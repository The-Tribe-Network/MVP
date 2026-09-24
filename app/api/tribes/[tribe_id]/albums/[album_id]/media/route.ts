import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { addMultipleMediaToAlbum, removeMediaFromAlbum, canUserSeeAlbum, AlbumForbiddenError, UUID_PATTERN } from '@/lib/services/album';
import { db } from '@/lib/database/client';
import { album as albumTable } from '@/lib/database/schemas/media';
import { eq } from 'drizzle-orm';

/** The album row the checks need, or null for an unknown / malformed id or one the caller may not see (TRI-273). */
async function visibleAlbum(albumId: string, userId: string) {
  if (!UUID_PATTERN.test(albumId)) return null;
  const [row] = await db
    .select({ id: albumTable.id, tribeId: albumTable.tribeId, createdBy: albumTable.createdBy, privacy: albumTable.privacy })
    .from(albumTable)
    .where(eq(albumTable.id, albumId))
    .limit(1);
  if (!row || !(await canUserSeeAlbum(row, userId))) return null;
  return row;
}
import { checkTribeMembership } from '@/lib/services/permissions';

/**
 * POST /api/tribes/[tribe_id]/albums/[album_id]/media
 * Add media items to an album
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/albums/[album_id]/media'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id, album_id } = await ctx.params;
    const body = await request.json();
    const { mediaIds } = body;

    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json(
        { error: 'mediaIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // A malformed media id is "not found", never a Postgres uuid-cast 500 (TRI-208).
    if (!mediaIds.every((id: unknown) => typeof id === 'string' && UUID_PATTERN.test(id))) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Check tribe membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    // Verify album belongs to this tribe (an album the caller may not see is not found, TRI-273)
    const album = await visibleAlbum(album_id, user.id);
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }
    if (album.tribeId !== tribe_id) {
      return NextResponse.json(
        { error: 'Album does not belong to this tribe' },
        { status: 403 }
      );
    }

    // Add media to album (service handles permission checks)
    const result = await addMultipleMediaToAlbum(album_id, mediaIds, user.id);

    return NextResponse.json(
      { success: true, count: result.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding media to album:', error);

    if (error instanceof Error) {
      // Unknown ids or another tribe's media (addMultipleMediaToAlbum), TRI-208: was a 500.
      if (error.message === 'Some media items not found or not accessible') {
        return NextResponse.json({ error: 'Media not found' }, { status: 404 });
      }
      if (error instanceof AlbumForbiddenError) {
        return NextResponse.json({ error: error.message, code: error.code }, { status: 403 });
      }
      if (error.message.includes('permission')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to add media to album' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tribes/[tribe_id]/albums/[album_id]/media
 * Remove media items from an album
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/albums/[album_id]/media'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id, album_id } = await ctx.params;
    const body = await request.json();
    const { mediaIds } = body;

    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json(
        { error: 'mediaIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // A malformed media id is "not found", never a Postgres uuid-cast 500 (TRI-208).
    if (!mediaIds.every((id: unknown) => typeof id === 'string' && UUID_PATTERN.test(id))) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Check tribe membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    // Verify album belongs to this tribe (an album the caller may not see is not found, TRI-273)
    const album = await visibleAlbum(album_id, user.id);
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }
    if (album.tribeId !== tribe_id) {
      return NextResponse.json(
        { error: 'Album does not belong to this tribe' },
        { status: 403 }
      );
    }

    // Remove each media item (service handles permission checks)
    for (const mediaId of mediaIds) {
      await removeMediaFromAlbum(mediaId, album_id, user.id);
    }

    return NextResponse.json(
      { success: true, count: mediaIds.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing media from album:', error);

    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to remove media from album' },
      { status: 500 }
    );
  }
}
