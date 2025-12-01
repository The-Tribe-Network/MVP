import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { getMediaByTribe } from '@/lib/services/media';
import { checkTribeMembership } from '@/lib/services/permissions';

/**
 * GET /api/tribes/[tribe_id]/media/public
 * Fetch ALL media for tribe (used for album cover selection and media browsing)
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/media/public'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Check membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query params
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Fetch only public media (addToAlbum=true filter is in getMediaByTribe)
    const media = await getMediaByTribe(tribe_id, { limit, offset });

    return NextResponse.json({ media }, { status: 200 });
  } catch (error) {
    console.error('Error fetching public media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}
