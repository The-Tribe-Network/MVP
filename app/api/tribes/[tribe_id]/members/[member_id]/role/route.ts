import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { changeMemberRole } from '@/lib/services/members';
import { changeMemberRoleSchema, validateApiRequest } from '@/lib/validations/members';

/**
 * PATCH /api/tribes/[tribe_id]/members/[member_id]/role
 * Change a member's role
 */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/members/[member_id]/role'>
) {
  try {
    // Authenticate user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id, member_id } = await ctx.params;

    // Parse and validate request body
    const body = await request.json();
    const validation = validateApiRequest(changeMemberRoleSchema, {
      ...body,
      memberId: member_id,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error },
        { status: 400 }
      );
    }

    // Change member role
    await changeMemberRole(tribe_id, user.id, member_id, validation.data.newRole);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error changing member role:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('permission') ||
        error.message.includes('manage') ||
        error.message.includes('owner') ||
        error.message.includes('assign')
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes('Not a member')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to change member role' },
      { status: 500 }
    );
  }
}
