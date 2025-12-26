import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { uploadTribeAvatar } from '@/lib/services/media';
import { validateImageFile } from '@/lib/utils/image';

/**
 * POST /api/upload/tribe-avatar
 * Upload tribe avatar image to the tribes/avatars folder
 * Unlike /api/upload/avatar, this does NOT update the user's profile image
 * Note: Does not require tribeId since tribe may not exist yet during creation
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getServerUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
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
    const result = await uploadTribeAvatar(
      buffer,
      currentUser.id,
      file.type,
      null // tribeId is null during tribe creation
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
    console.error('Error uploading tribe avatar:', error);

    return NextResponse.json(
      { error: 'Failed to upload tribe avatar' },
      { status: 500 }
    );
  }
}
