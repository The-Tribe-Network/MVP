import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { uploadPostImage, addMediaToAlbumJunction } from '@/lib/services/media';
import { validateImageFile } from '@/lib/utils/image';
import { canUserUploadMedia } from '@/lib/services/permissions';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getServerUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const postId = formData.get('postId') as string | null;
    const tribeId = formData.get('tribeId') as string | null;
    const albumId = formData.get('albumId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!tribeId) {
      return NextResponse.json(
        { error: 'Tribe ID is required' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary and create media record
    const result = await uploadPostImage(
      buffer,
      currentUser.id,
      file.type,
      tribeId,
      postId || null
    );

    // If albumId is provided (either specific album or null for general album),
    // add this media to the album using the service function
    // if (albumId !== undefined && result.id) {
    //   await addMediaToAlbumJunction(result.id, albumId, currentUser.id);
    // }

    return NextResponse.json({
      id: result.id,
      url: result.url,
      width: result.width,
      height: result.height,
      fileSize: result.fileSize,
      mimeType: result.mimeType,
    });
  } catch (error) {
    console.error('Error uploading post image:', error);

    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to upload post image' },
      { status: 500 }
    );
  }
}

