import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import {
  updateMedia,
  deleteMediaWithPermissions,
  getMediaById,
  updateMediaAlbumAssignment
} from '@/lib/services/media';
import { checkTribeMembership } from '@/lib/services/permissions';
import { InvalidAlbumError } from '@/lib/services/album';

/**
 * PATCH /api/tribes/[tribe_id]/media/[media_id]
 * Update media (change album assignment, alt text, etc.)
 * The media must be in tribe_id (403 otherwise) and `albumId`, when set, must be an album of that tribe
 * (400 INVALID_ALBUM; null keeps meaning the general library) — TRI-197.
 */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/media/[media_id]'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id, media_id } = await ctx.params;

    // Check tribe membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    // The media must be this tribe's, so the caller's membership in tribe_id is what gets checked.
    const existingMedia = await getMediaById(media_id);
    if (!existingMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }
    if (existingMedia.tribeId !== tribe_id) {
      return NextResponse.json(
        { error: 'Media does not belong to this tribe' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { albumId, altText, addToAlbum } = body;

    // Update altText if provided (media table field)
    let updatedMedia = null;
    if (altText !== undefined) {
      updatedMedia = await updateMedia(media_id, user.id, { altText });
    }

    // Handle album assignment changes through service function
    if (addToAlbum !== undefined) {
      await updateMediaAlbumAssignment(media_id, user.id, albumId, addToAlbum);
    } else if (albumId !== undefined) {
      // Just changing album (keep in albums, just change which one)
      await updateMediaAlbumAssignment(media_id, user.id, albumId, true);
    }

    // Fetch the updated media to return
    if (!updatedMedia) {
      updatedMedia = await getMediaById(media_id);
    }

    return NextResponse.json({ media: updatedMedia }, { status: 200 });
  } catch (error) {
    if (error instanceof InvalidAlbumError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }

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
  ctx: RouteContext<'/api/tribes/[tribe_id]/media/[media_id]'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id, media_id } = await ctx.params;

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
