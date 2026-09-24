import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { uploadTribeMedia, getMediaByTribe, countMediaByTribe } from '@/lib/services/media';
import { mediaListQuerySchema, mediaListQueryInput } from '@/lib/validations/media';
import { validateImageFile } from '@/lib/utils/image';
import { checkTribeMembership } from '@/lib/services/permissions';
import { multipartFileLimit, rejectOversizedBody } from '@/lib/services/multipart-limits';
import { AlbumForbiddenError, InvalidAlbumError, getAlbumAccessContext } from '@/lib/services/album';

/**
 * GET /api/tribes/[tribe_id]/media
 * Album gallery items of a tribe (`listMedia`): filters albumId, type, uploadedBy, from/to; sort; paging.
 * Returns `{ media, total, hasMore }`.
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/media'>
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

    // Query params (TRI-207: uploadedBy, from, to, sort; docs/specs/TRI-207-list-media-filters.md)
    const validation = mediaListQuerySchema.safeParse(mediaListQueryInput(request.nextUrl.searchParams));
    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        {
          error: `Invalid query parameter \`${issue.path.join('.') || 'query'}\`: ${issue.message}`,
          code: 'INVALID_QUERY',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }
    // Only the general library and albums the caller may see (TRI-273): a hidden album's id lists nothing.
    const filters = { ...validation.data, viewerAccess: await getAlbumAccessContext(tribe_id, user.id) };

    const [media, total] = await Promise.all([
      getMediaByTribe(tribe_id, filters),
      countMediaByTribe(tribe_id, filters),
    ]);

    return NextResponse.json(
      { media, total, hasMore: filters.offset + media.length < total },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tribes/[tribe_id]/media
 * Upload media directly to tribe
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/media'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    const oversized = rejectOversizedBody(request);
    if (oversized) return oversized;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const albumId = formData.get('albumId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Parse addToAlbum from form data (can be string "true"/"false" or boolean)
    const addToAlbumValue = formData.get('addToAlbum');
    let addToAlbum: boolean;
    if (addToAlbumValue === null || addToAlbumValue === undefined) {
      // Default to false if not provided
      addToAlbum = false;
    } else if (typeof addToAlbumValue === 'string') {
      addToAlbum = addToAlbumValue === 'true';
    } else {
      addToAlbum = Boolean(addToAlbumValue);
    }

    // Validate file (type, and size against the tribe's maxMediaFileSize / platform limit)
    const validation = validateImageFile(file, await multipartFileLimit(tribe_id));
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, code: validation.code },
        { status: validation.code === 'FILE_TOO_LARGE' ? 413 : 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary and create media record
    const result = await uploadTribeMedia(
      buffer,
      user.id,
      file.type,
      tribe_id,
      albumId || null,
      addToAlbum
    );

    return NextResponse.json({
      id: result.id,
      url: result.url,
      width: result.width,
      height: result.height,
      fileSize: result.fileSize,
      mimeType: result.mimeType,
    });
  } catch (error) {
    if (error instanceof InvalidAlbumError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    if (error instanceof AlbumForbiddenError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 403 });
    }

    console.error('Error uploading tribe media:', error);

    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to upload tribe media' },
      { status: 500 }
    );
  }
}
