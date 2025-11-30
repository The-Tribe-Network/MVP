import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { createAlbum, getAlbumsByTribe } from '@/lib/services/album';
import { checkTribeMembership } from '@/lib/services/permissions';

/**
 * GET /api/tribes/[tribe_id]/albums
 * Get all albums for a tribe
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tribe_id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id } = await params;

    // Check tribe membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    // Get pagination params from URL
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const albums = await getAlbumsByTribe(tribe_id, { limit, offset });

    return NextResponse.json({ albums }, { status: 200 });
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tribes/[tribe_id]/albums
 * Create a new album
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tribe_id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id } = await params;
    const body = await request.json();

    const { name, description, coverImageUrl, privacy } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Album name is required' },
        { status: 400 }
      );
    }

    const album = await createAlbum(user.id, {
      tribeId: tribe_id,
      name,
      description,
      coverImageUrl,
      privacy,
    });

    return NextResponse.json({ album }, { status: 201 });
  } catch (error) {
    console.error('Error creating album:', error);

    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to create album' },
      { status: 500 }
    );
  }
}
