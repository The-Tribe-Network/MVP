import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { deleteMedia, getMediaById } from '@/lib/services/media';

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<'/api/media/[media_id]'> 
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { media_id } = await ctx.params;

    // Get media record to verify ownership
    const mediaRecord = await getMediaById(media_id);
    if (!mediaRecord) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Check if user owns the media
    if (mediaRecord.uploadedBy !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this media' },
        { status: 403 }
      );
    }

    // Delete media (from Cloudinary and database)
    await deleteMedia(media_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}

