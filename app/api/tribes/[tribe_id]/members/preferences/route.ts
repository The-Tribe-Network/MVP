import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { db } from '@/lib/database/client';
import { and, eq, inArray } from 'drizzle-orm';
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
        autoAddPostMediaToTribe: tribeMemberPreference.autoAddPostMediaToTribe,
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

    // If preference doesn't exist (LEFT JOIN returns null), return default value
    const preference = result[0].autoAddPostMediaToTribe;
    if (preference === null || preference === undefined) {
      return NextResponse.json(
        { preferences: { autoAddPostMediaToTribe: true } },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { preferences: { autoAddPostMediaToTribe: preference } },
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

    const { autoAddPostMediaToTribe } = body;

    if (typeof autoAddPostMediaToTribe !== 'boolean') {
      return NextResponse.json(
        { error: 'autoAddPostMediaToTribe must be a boolean' },
        { status: 400 }
      );
    }

    // Quick membership check (single indexed query)
    const memberExists = await db
      .select({ id: tribeMember.id })
      .from(tribeMember)
      .where(
        and(
          eq(tribeMember.tribeId, tribe_id),
          eq(tribeMember.userId, user.id)
        )
      )
      .limit(1);

    if (!memberExists[0]) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    // Update preferences using subquery to find tribeMemberId directly
    // This is efficient as the subquery uses the same indexed lookup
    const updated = await db
      .update(tribeMemberPreference)
      .set({ autoAddPostMediaToTribe })
      .where(
        inArray(
          tribeMemberPreference.tribeMemberId,
          db
            .select({ id: tribeMember.id })
            .from(tribeMember)
            .where(
              and(
                eq(tribeMember.tribeId, tribe_id),
                eq(tribeMember.userId, user.id)
              )
            )
        )
      )
      .returning({
        autoAddPostMediaToTribe: tribeMemberPreference.autoAddPostMediaToTribe,
      });

    if (!updated[0]) {
      return NextResponse.json({ error: 'Tribe member preference not found' }, { status: 404 });
    }

    return NextResponse.json(
      { preferences: updated[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating tribe member preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update tribe member preferences' },
      { status: 500 }
    );
  }
}
