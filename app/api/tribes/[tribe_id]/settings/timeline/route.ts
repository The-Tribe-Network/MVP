import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { getTimelineSettings, updateTimelineSettings } from '@/lib/services/tribe-settings';
import { getMemberWithPermissions } from '@/lib/services/permissions';
import { validateApiRequest } from '@/lib/validations/tribe-settings';
import { updateTimelineSettingsSchema } from '@/lib/validations/tribe-settings';

type RouteContext = { params: Promise<{ tribe_id: string }> };

export async function GET(request: NextRequest, ctx: RouteContext) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Check membership - only members can view settings
    const memberData = await getMemberWithPermissions(tribe_id, user.id);
    if (!memberData) {
      return NextResponse.json({ error: 'You must be a member of this tribe' }, { status: 403 });
    }

    const settings = await getTimelineSettings(tribe_id);

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching timeline settings:', error);
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch timeline settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;
    const body = await request.json();

    // Check permissions - only owners and admins with canEditTribeSettings can update
    const memberData = await getMemberWithPermissions(tribe_id, user.id);
    if (!memberData) {
      return NextResponse.json({ error: 'You must be a member of this tribe' }, { status: 403 });
    }

    const { member, permissions } = memberData;
    const canEdit = permissions?.canEditTribeSettings ?? (member.role === 'owner' || member.role === 'admin');

    if (!canEdit) {
      return NextResponse.json(
        { error: 'You do not have permission to edit tribe settings' },
        { status: 403 }
      );
    }

    // Validate request
    const validation = validateApiRequest(updateTimelineSettingsSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error },
        { status: 400 }
      );
    }

    const updated = await updateTimelineSettings(
      tribe_id,
      user.id,
      validation.data
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating timeline settings:', error);
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to update timeline settings' },
      { status: 500 }
    );
  }
}
