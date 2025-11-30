-- Migration: Add Performance Indexes
-- This migration adds critical indexes to improve query performance across the application
-- Expected impact: 10-100x faster queries on activity feeds, post feeds, media galleries, and comment threads

-- ============================================================================
-- ACTIVITY TABLE INDEXES
-- ============================================================================
-- Activity feeds are queried frequently with WHERE tribeId/userId + ORDER BY createdAt
-- Without these indexes, queries do full table scans which become very slow with many activities

-- Index for tribe activity feeds (lib/services/activity.ts:190)
CREATE INDEX IF NOT EXISTS idx_activity_tribe_created
ON activity(tribe_id, created_at DESC);

-- Index for user activity feeds (lib/services/activity.ts:338)
CREATE INDEX IF NOT EXISTS idx_activity_user_created
ON activity(user_id, created_at DESC);

-- Index for post-specific activities and milestone checks (lib/services/activity.ts:118)
CREATE INDEX IF NOT EXISTS idx_activity_post_type
ON activity(post_id, type) WHERE post_id IS NOT NULL;

-- ============================================================================
-- POST TABLE INDEXES
-- ============================================================================
-- Post feeds are core to the application and queried on every tribe page view
-- Without index, queries scan entire post table regardless of size

-- Index for tribe post feeds (lib/services/post.ts:171)
CREATE INDEX IF NOT EXISTS idx_post_tribe_created
ON post(tribe_id, created_at DESC);

-- Index for user's posts (for profile pages and author lookups)
CREATE INDEX IF NOT EXISTS idx_post_author
ON post(author_id);

-- ============================================================================
-- COMMENT TABLE INDEXES
-- ============================================================================
-- Comment threads are loaded for every post view
-- Without index, loading comments becomes slow as thread size grows

-- Index for post comments (lib/services/comment.ts:115)
CREATE INDEX IF NOT EXISTS idx_comment_post_created
ON comment(post_id, created_at ASC);

-- Index for nested/threaded comments (when implementing reply threads)
CREATE INDEX IF NOT EXISTS idx_comment_parent
ON comment(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- ============================================================================
-- MEDIA TABLE INDEXES
-- ============================================================================
-- Media galleries and album views need fast filtering and sorting

-- Index for tribe media galleries (lib/services/media.ts:267)
CREATE INDEX IF NOT EXISTS idx_media_tribe_created
ON media(tribe_id, created_at DESC);

-- Index for album media (lib/services/album.ts:110)
CREATE INDEX IF NOT EXISTS idx_media_album
ON media(album_id) WHERE album_id IS NOT NULL;

-- Index for post media (for post image lookups)
CREATE INDEX IF NOT EXISTS idx_media_post
ON media(post_id) WHERE post_id IS NOT NULL;

-- Index for user's uploaded media (for user profile media tabs)
CREATE INDEX IF NOT EXISTS idx_media_uploader
ON media(uploaded_by);

-- ============================================================================
-- LIKE TABLE INDEXES
-- ============================================================================
-- Like counts are aggregated frequently for posts, comments, and media
-- Without indexes, COUNT queries scan entire tables

-- Index for post like counts and user like checks (lib/services/post.ts:184, 207)
CREATE INDEX IF NOT EXISTS idx_post_like_post
ON post_like(post_id);

-- Index for checking if specific user liked post
CREATE INDEX IF NOT EXISTS idx_post_like_user
ON post_like(user_id);

-- Index for comment like counts (lib/services/comment.ts:125)
CREATE INDEX IF NOT EXISTS idx_comment_like_comment
ON comment_like(comment_id);

-- Index for checking if specific user liked comment
CREATE INDEX IF NOT EXISTS idx_comment_like_user
ON comment_like(user_id);

-- Index for media like counts (lib/services/media.ts:255)
CREATE INDEX IF NOT EXISTS idx_media_like_media
ON media_like(media_id);

-- Index for checking if specific user liked media
CREATE INDEX IF NOT EXISTS idx_media_like_user
ON media_like(user_id);

-- ============================================================================
-- TRIBE MEMBER TABLE INDEXES
-- ============================================================================
-- Tribe membership checks and member lists are queried on almost every API request

-- Index for user's tribe list (lib/services/tribe.ts:150)
CREATE INDEX IF NOT EXISTS idx_tribe_member_user
ON tribe_member(user_id);

-- Index for tribe member lists and counts (lib/services/tribe.ts:122)
CREATE INDEX IF NOT EXISTS idx_tribe_member_tribe
ON tribe_member(tribe_id);

-- Composite index for permission checks (used by getMemberWithPermissions)
CREATE INDEX IF NOT EXISTS idx_tribe_member_tribe_user
ON tribe_member(tribe_id, user_id);

-- ============================================================================
-- TRIBE INVITATION TABLE INDEXES
-- ============================================================================
-- Invitations are queried by email to check for pending invites

-- Index for pending invitations by email (lib/services/invitation.ts:53)
CREATE INDEX IF NOT EXISTS idx_tribe_invitation_email_status
ON tribe_invitation(email, status);

-- Index for tribe's pending invitations
CREATE INDEX IF NOT EXISTS idx_tribe_invitation_tribe_status
ON tribe_invitation(tribe_id, status);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this migration, verify indexes were created:
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;
