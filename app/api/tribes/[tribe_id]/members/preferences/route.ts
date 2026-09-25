import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { db } from '@/lib/database/client';
import { and, eq } from 'drizzle-orm';
import { tribeMember, tribeMemberPreference } from '@/lib/database/schemas';

/**
 * GET /api/tribes/[tribe_id]/members/preferences
 * Get user preferences for a specific tribe
 * OPTIMIZED: Single query with LEFT JOIN instead of two separate queries
 */
export async function GET(
  request: NextRequest,
  context: RouteContext<'/api/tribes/[tribe_id]/members/preferences'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id } = await context.params;

    // Single query with LEFT JOIN to get preferences in one go
    const result = await db
      .select({
        memberId: tribeMember.id,
        autoAddPostMediaToTribe: tribeMemberPreference.autoAddPostMediaToTribe,
        notificationsMuted: tribeMemberPreference.notificationsMuted,
      })
      .from(tribeMember)
      .leftJoin(
        tribeMemberPreference,
        eq(tribeMemberPreference.tribeMemberId, tribeMember.id)
      )
      .where(
        and(
          eq(tribeMember.tribeId, tribe_id),
          eq(tribeMember.userId, user.id)
        )
      )
      .limit(1);

    // Check if user is a member of the tribe
    if (!result[0]) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    // No preference row yet (LEFT JOIN nulls) means the defaults
    return NextResponse.json(
      {
        preferences: {
          autoAddPostMediaToTribe: result[0].autoAddPostMediaToTribe ?? true,
          notificationsMuted: result[0].notificationsMuted ?? false,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching tribe member preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tribe member preferences' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tribes/[tribe_id]/members/preferences
 * Update user preferences for a specific tribe
 * OPTIMIZED: Uses subquery in WHERE clause instead of two separate queries
 */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/members/preferences'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tribe_id } = await ctx.params;

    // Partial update: either field (TRI-7 adds `notificationsMuted`, NOTIF-04)
    const patch: { autoAddPostMediaToTribe?: boolean; notificationsMuted?: boolean } = {};
    for (const key of ['autoAddPostMediaToTribe', 'notificationsMuted'] as const) {
      if (body?.[key] === undefined) continue;
      if (typeof body[key] !== 'boolean') {
        return NextResponse.json({ error: `${key} must be a boolean` }, { status: 400 });
      }
      patch[key] = body[key];
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: 'Nothing to update: send autoAddPostMediaToTribe or notificationsMuted' },
        { status: 400 }
      );
    }

    const [member] = await db
      .select({ id: tribeMember.id })
      .from(tribeMember)
      .where(and(eq(tribeMember.tribeId, tribe_id), eq(tribeMember.userId, user.id)))
      .limit(1);
    if (!member) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    // Most members have no preference row yet: create it with the patch, or update the one there is
    const [updated] = await db
      .insert(tribeMemberPreference)
      .values({ tribeMemberId: member.id, userId: user.id, ...patch })
      .onConflictDoUpdate({ target: tribeMemberPreference.tribeMemberId, set: patch })
      .returning({
        autoAddPostMediaToTribe: tribeMemberPreference.autoAddPostMediaToTribe,
        notificationsMuted: tribeMemberPreference.notificationsMuted,
      });

    return NextResponse.json({ preferences: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating tribe member preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update tribe member preferences' },
      { status: 500 }
    );
  }
}
