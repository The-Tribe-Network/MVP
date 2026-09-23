import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { likeMedia, unlikeMedia, hasUserLikedMedia, getMediaInTribe } from '@/lib/services/media';
import { checkTribeMembership } from '@/lib/services/permissions';

// Every method: 401 signed out, 403 not a member of tribe_id, 404 when media_id is not a media of
// tribe_id (TRI-208), so a member of one tribe cannot like/unlike/probe another tribe's media by id.

/**
 * POST /api/tribes/[tribe_id]/media/[media_id]/like
 * Like a media (idempotent): 201 { like, liked: true, likeCount }
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

    // The media must be this tribe's (TRI-208): unknown, malformed or another tribe's id is a 404.
    if (!(await getMediaInTribe(media_id, tribe_id))) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Idempotent: a new like and an already-liked media both answer 201 with the current state.
    const { like, liked, likeCount } = await likeMedia(media_id, user.id);

    return NextResponse.json({ like, liked, likeCount }, { status: 201 });
  } catch (error) {
    console.error('Error liking media:', error);
    return NextResponse.json(
      { error: 'Failed to like media' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tribes/[tribe_id]/media/[media_id]/like
 * Unlike a media (idempotent): 200 { success: true }
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

    // The media must be this tribe's (TRI-208): unknown, malformed or another tribe's id is a 404.
    if (!(await getMediaInTribe(media_id, tribe_id))) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Idempotent: unliking a media that isn't liked is the same success.
    await unlikeMedia(media_id, user.id);

    return NextResponse.json({ success: true }, { status: 200 });
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

    // The media must be this tribe's (TRI-208): unknown, malformed or another tribe's id is a 404.
    if (!(await getMediaInTribe(media_id, tribe_id))) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
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
