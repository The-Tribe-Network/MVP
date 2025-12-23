import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { getAllTribeMembers } from '@/lib/services/members';
import { memberListQuerySchema, validateApiRequest } from '@/lib/validations/members';

/**
 * GET /api/tribes/[tribe_id]/members/list
 * Fetch all tribe members with pagination and filters
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/members/list'>
) {
  try {
    // Authenticate user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryData = {
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') || undefined,
      hasCustomPermissions: searchParams.get('hasCustomPermissions') || undefined,
      joinedAfter: searchParams.get('joinedAfter') || undefined,
      joinedBefore: searchParams.get('joinedBefore') || undefined,
    };

    // Validate query parameters
    const validation = validateApiRequest(memberListQuerySchema, queryData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error },
        { status: 400 }
      );
    }

    // Fetch members (validation.data has defaults applied by Zod)
    const result = await getAllTribeMembers(tribe_id, user.id, validation.data as Required<typeof validation.data>);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching tribe members:', error);

    if (error instanceof Error) {
      if (error.message.includes('Not a member')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch tribe members' },
      { status: 500 }
    );
  }
}
