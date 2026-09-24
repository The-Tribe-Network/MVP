import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { getAlbumById, updateAlbum, deleteAlbum } from '@/lib/services/album';
import { checkTribeMembership } from '@/lib/services/permissions';
import { updateAlbumSchema, validateApiRequest } from '@/lib/validations/album';

/**
 * GET /api/tribes/[tribe_id]/albums/[album_id]
 * Get a single album with its media
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/albums/[album_id]'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id, album_id } = await ctx.params;

    // Check tribe membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    // Marks media.isNew from the caller's previous visit to this album and stamps this one (TRI-201);
    // the service skips both when the album is not in tribe_id, which is a 403 below. An album the
    // caller may not see (TRI-273) comes back null: 404, same as a missing one.
    const album = await getAlbumById(album_id, { viewerId: user.id, tribeId: tribe_id });

    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    // Verify album belongs to this tribe
    if (album.tribeId !== tribe_id) {
      return NextResponse.json(
        { error: 'Album does not belong to this tribe' },
        { status: 403 }
      );
    }

    return NextResponse.json({ album }, { status: 200 });
  } catch (error) {
    console.error('Error fetching album:', error);
    return NextResponse.json(
      { error: 'Failed to fetch album' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tribes/[tribe_id]/albums/[album_id]
 * Update an album's details, privacy or cover (`coverId`, a media id in this tribe).
 * Allowed for the album's creator or a member holding `canDeleteAnyMedia` (TRI-205).
 */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/albums/[album_id]'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id, album_id } = await ctx.params;
    const body = await request.json();

    const validation = validateApiRequest(updateAlbumSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error },
        { status: 400 }
      );
    }

    // Check tribe membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    // The service answers "not found" / "does not belong" / "permission" (mapped below)
    const album = await updateAlbum(album_id, user.id, validation.data, { tribeId: tribe_id });

    return NextResponse.json({ album }, { status: 200 });
  } catch (error) {
    console.error('Error updating album:', error);

    if (error instanceof Error) {
      if (error.message === 'Album not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === 'Album does not belong to this tribe' || error.message.includes('permission')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes('not accessible')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to update album' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tribes/[tribe_id]/albums/[album_id]
 * Delete an album. Allowed for the album's creator or a member holding `canDeleteAnyMedia` (TRI-205).
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/albums/[album_id]'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id, album_id } = await ctx.params;

    // Check tribe membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    // The service answers "not found" / "does not belong" / "permission" (mapped below)
    await deleteAlbum(album_id, user.id, { tribeId: tribe_id });

    return NextResponse.json(
      { message: 'Album deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting album:', error);

    if (error instanceof Error) {
      if (error.message === 'Album not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === 'Album does not belong to this tribe' || error.message.includes('permission')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete album' },
      { status: 500 }
    );
  }
}
