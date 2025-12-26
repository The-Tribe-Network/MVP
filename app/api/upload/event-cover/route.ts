import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { uploadEventCover } from '@/lib/services/media';
import { validateImageFile } from '@/lib/utils/image';
import { canUserUploadMedia } from '@/lib/services/permissions';

/**
 * POST /api/upload/event-cover
 * Upload event cover image to the tribes/events folder
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getServerUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const tribeId = formData.get('tribeId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!tribeId) {
      return NextResponse.json({ error: 'Tribe ID is required' }, { status: 400 });
    }

    // Check upload permissions
    const hasPermission = await canUserUploadMedia(tribeId, currentUser.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to upload media' },
        { status: 403 }
      );
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary and create media record
    const result = await uploadEventCover(
      buffer,
      currentUser.id,
      file.type,
      tribeId
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
    console.error('Error uploading event cover:', error);

    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to upload event cover' },
      { status: 500 }
    );
  }
}
