import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { updateMedia, deleteMediaWithPermissions } from '@/lib/services/media';
import { checkTribeMembership } from '@/lib/services/permissions';

/**
 * PATCH /api/tribes/[tribe_id]/media/[media_id]
 * Update media (change album, alt text, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tribe_id: string; media_id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id, media_id } = await params;

    // Check tribe membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { albumId, altText, addToAlbum } = body;

    const updatedMedia = await updateMedia(media_id, user.id, {
      albumId,
      altText,
      addToAlbum,
    });

    return NextResponse.json({ media: updatedMedia }, { status: 200 });
  } catch (error) {
    console.error('Error updating media:', error);

    if (error instanceof Error) {
      if (error.message === 'Media not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('permission')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tribes/[tribe_id]/media/[media_id]
 * Delete media
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tribe_id: string; media_id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id, media_id } = await params;

    await deleteMediaWithPermissions(media_id, tribe_id, user.id);

    return NextResponse.json(
      { message: 'Media deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting media:', error);

    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
