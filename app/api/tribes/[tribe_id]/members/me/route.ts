import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { getMemberWithPermissions } from '@/lib/services/permissions';
import { resolveEffectivePermissions } from '@/lib/services/member-permissions';
import { tribeIdParamSchema, validateApiRequest } from '@/lib/validations/tribe';

/**
 * GET /api/tribes/[tribe_id]/members/me
 * Get current user's member data with its raw overrides and the resolved effectivePermissions
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/members/me'>
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

    // Get member with permissions
    const memberData = await getMemberWithPermissions(paramValidation.data.id, user.id);

    if (!memberData) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    const { effectivePermissions } = await resolveEffectivePermissions(
      paramValidation.data.id,
      memberData
    );

    return NextResponse.json({ ...memberData, effectivePermissions });
  } catch (error) {
    console.error('Error fetching member data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member data' },
      { status: 500 }
    );
  }
}

