import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { removeMember } from '@/lib/services/members';

/**
 * DELETE /api/tribes/[tribe_id]/members/[member_id]
 * Remove a member from the tribe
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/members/[member_id]'>
) {
  try {
    // Authenticate user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id, member_id } = await ctx.params;

    // Remove member
    await removeMember(tribe_id, user.id, member_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('permission') ||
        error.message.includes('manage') ||
        error.message.includes('owner') ||
        error.message.includes('remove')
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes('Not a member')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
