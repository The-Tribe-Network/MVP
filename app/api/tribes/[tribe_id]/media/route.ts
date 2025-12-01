import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/services/auth';
import { uploadTribeMedia, getMediaByTribe } from '@/lib/services/media';
import { validateImageFile } from '@/lib/utils/image';
import { checkTribeMembership } from '@/lib/services/permissions';

/**
 * GET /api/tribes/[tribe_id]/media
 * Get all media for a tribe with filters
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/media'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Check tribe membership
    const isMember = await checkTribeMembership(tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this tribe' },
        { status: 403 }
      );
    }

    // Get query params
    const url = new URL(request.url);
    const albumId = url.searchParams.get('albumId');
    const type = url.searchParams.get('type') as 'image' | 'video' | 'document' | null;
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const media = await getMediaByTribe(tribe_id, {
      albumId: albumId === 'null' ? null : albumId || undefined,
      type: type || undefined,
      limit,
      offset,
    });

    return NextResponse.json({ media }, { status: 200 });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tribes/[tribe_id]/media
 * Upload media directly to tribe
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/media'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const albumId = formData.get('albumId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Parse addToAlbum from form data (can be string "true"/"false" or boolean)
    const addToAlbumValue = formData.get('addToAlbum');
    let addToAlbum: boolean;
    if (addToAlbumValue === null || addToAlbumValue === undefined) {
      // Default to false if not provided
      addToAlbum = false;
    } else if (typeof addToAlbumValue === 'string') {
      addToAlbum = addToAlbumValue === 'true';
    } else {
      addToAlbum = Boolean(addToAlbumValue);
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary and create media record
    const result = await uploadTribeMedia(
      buffer,
      user.id,
      file.type,
      tribe_id,
      albumId || null,
      addToAlbum
    );

    return NextResponse.json({
      id: result.id,
      url: result.url,
      width: result.width,
      height: result.height,
      fileSize: result.fileSize,
      mimeType: result.mimeType,
    });
  } catch (error) {
    console.error('Error uploading tribe media:', error);

    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to upload tribe media' },
      { status: 500 }
    );
  }
}
