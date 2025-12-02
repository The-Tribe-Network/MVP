import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { createAlbumWithMedia, getAlbumsByTribe } from '@/lib/services/album';
import { checkTribeMembership } from '@/lib/services/permissions';
import { createAlbumSchema, validateApiRequest } from "@/lib/validations/album";

/**
 * GET /api/tribes/[tribe_id]/albums
 * Get all albums for a tribe
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/albums'>
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
/**
 * POST /api/tribes/[tribe_id]/albums
 * Create a new album with optional cover and media
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/albums'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;
    const body = await request.json();

    // Validate with Zod schema
    const validation = validateApiRequest(createAlbumSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error },
        { status: 400 }
      );
    }

    const { name, description, privacy, coverId, mediaIds, isNewCover } = validation.data;

    const album = await createAlbumWithMedia(user.id, {
      tribeId: tribe_id,
      name,
      description,
      privacy,
      coverId,
      mediaIds,
      isNewCover,
    });

    return NextResponse.json({ album }, { status: 201 });
  } catch (error) {
    console.error('Error creating album:', error);

    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes('not found') || error.message.includes('not accessible')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to create album' },
      { status: 500 }
    );
  }
}

