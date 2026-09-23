import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { uploadTribeMediaBatch } from '@/lib/services/media';
import { validateImageFile } from '@/lib/utils/image';
import { checkTribeMembership } from '@/lib/services/permissions';
import { multipartFileLimit, rejectOversizedBody } from '@/lib/services/multipart-limits';

/**
 * POST /api/tribes/[tribe_id]/media/batch
 * Batch upload multiple media files to a tribe
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/media/batch'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Check tribe membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    const oversized = rejectOversizedBody(request);
    if (oversized) return oversized;

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const albumId = formData.get('albumId') as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    const MAX_BATCH_SIZE = 20;
    if (files.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BATCH_SIZE} files per batch` },
        { status: 400 }
      );
    }

    // Parse addToAlbum from form data
    const addToAlbumValue = formData.get('addToAlbum');
    let addToAlbum: boolean;
    if (addToAlbumValue === null || addToAlbumValue === undefined) {
      addToAlbum = false;
    } else if (typeof addToAlbumValue === 'string') {
      addToAlbum = addToAlbumValue === 'true';
    } else {
      addToAlbum = Boolean(addToAlbumValue);
    }

    // Validate all files and convert to buffers
    const validatedFiles: { buffer: Buffer; mimeType: string; originalName: string }[] = [];
    const validationErrors: { index: number; name: string; error: string; code?: string }[] = [];

    const fileLimit = await multipartFileLimit(tribe_id);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file, fileLimit);

      if (!validation.valid) {
        validationErrors.push({
          index: i,
          name: file.name,
          error: validation.error || 'Invalid file',
          code: validation.code,
        });
        continue;
      }

      const arrayBuffer = await file.arrayBuffer();
      validatedFiles.push({
        buffer: Buffer.from(arrayBuffer),
        mimeType: file.type,
        originalName: file.name,
      });
    }

    // If no valid files, return validation errors
    if (validatedFiles.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid files to upload',
          validationErrors,
        },
        { status: 400 }
      );
    }

    // Upload all valid files in parallel
    const result = await uploadTribeMediaBatch(
      validatedFiles.map(f => ({ buffer: f.buffer, mimeType: f.mimeType })),
      user.id,
      tribe_id,
      albumId || null,
      addToAlbum
    );

    return NextResponse.json({
      successful: result.successful,
      failed: [
        ...validationErrors.map(e => ({ index: e.index, error: e.error, name: e.name, code: e.code })),
        ...result.failed,
      ],
      totalUploaded: result.successful.length,
      totalFailed: validationErrors.length + result.failed.length,
    });
  } catch (error) {
    console.error('Error batch uploading tribe media:', error);

    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}
