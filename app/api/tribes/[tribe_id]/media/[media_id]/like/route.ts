import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { likeMedia, unlikeMedia, hasUserLikedMedia } from '@/lib/services/media';
import { checkTribeMembership } from '@/lib/services/permissions';

/**
 * POST /api/tribes/[tribe_id]/media/[media_id]/like
 * Like a media
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/media/[media_id]/like'>
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

    const like = await likeMedia(media_id, user.id);

    return NextResponse.json({ like }, { status: 201 });
  } catch (error) {
    console.error('Error liking media:', error);

    if (error instanceof Error) {
      if (error.message === 'Media already liked') {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to like media' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tribes/[tribe_id]/media/[media_id]/like
 * Unlike a media
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/media/[media_id]/like'>
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

    await unlikeMedia(media_id, user.id);

    return NextResponse.json(
      { message: 'Media unliked successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error unliking media:', error);
    return NextResponse.json(
      { error: 'Failed to unlike media' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tribes/[tribe_id]/media/[media_id]/like
 * Check if user has liked a media
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/media/[media_id]/like'>
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

    const liked = await hasUserLikedMedia(media_id, user.id);

    return NextResponse.json({ liked }, { status: 200 });
  } catch (error) {
    console.error('Error checking media like:', error);
    return NextResponse.json(
      { error: 'Failed to check media like' },
      { status: 500 }
    );
  }
}
