import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { getAlbumById, updateAlbum, deleteAlbum } from '@/lib/services/album';
import { checkTribeMembership } from '@/lib/services/permissions';

/**
 * GET /api/tribes/[tribe_id]/albums/[album_id]
 * Get a single album with its media
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tribe_id: string; album_id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id, album_id } = await params;

    // Check tribe membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    const album = await getAlbumById(album_id);

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
 * Update an album
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tribe_id: string; album_id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id, album_id } = await params;
    const body = await request.json();

    const { name, description, coverImageUrl, privacy } = body;

    // Check tribe membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    const album = await updateAlbum(album_id, user.id, {
      name,
      description,
      coverImageUrl,
      privacy,
    });

    return NextResponse.json({ album }, { status: 200 });
  } catch (error) {
    console.error('Error updating album:', error);

    if (error instanceof Error) {
      if (error.message === 'Album not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('permission')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
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
 * Delete an album
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tribe_id: string; album_id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id, album_id } = await params;

    // Check tribe membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    await deleteAlbum(album_id, user.id);

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
      if (error.message.includes('permission')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete album' },
      { status: 500 }
    );
  }
}
