import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { getTribeAdminMembers } from '@/lib/services/tribe';
import { checkTribeMembership } from '@/lib/services/permissions';
import { tribeIdParamSchema, validateApiRequest } from '@/lib/validations/tribe';

/**
 * GET /api/tribes/[tribe_id]/members/admins
 * Get admin members of a tribe (for transfer ownership)
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/members/admins'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Validate tribe ID parameter
    const paramValidation = validateApiRequest(tribeIdParamSchema, { id: tribe_id });
    if (!paramValidation.success) {
      return NextResponse.json(
        { error: 'Invalid tribe ID', details: paramValidation.error },
        { status: 400 }
      );
    }

    // Check if user is a member
    const isMember = await checkTribeMembership(paramValidation.data.id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    // Get admin members
    const adminMembers = await getTribeAdminMembers(paramValidation.data.id);

    return NextResponse.json({ members: adminMembers });
  } catch (error) {
    console.error('Error fetching admin members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin members' },
      { status: 500 }
    );
  }
}

