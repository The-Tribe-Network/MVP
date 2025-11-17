-- ============================================
-- Tribe Application Database Schema
-- ============================================
-- This file contains all tables, columns, enums, and types
-- needed for the Tribe social networking application
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

-- Privacy settings for tribes
CREATE TYPE privacy_type AS ENUM ('private', 'public');

-- User roles within a tribe
CREATE TYPE tribe_role AS ENUM ('admin', 'moderator', 'member');

-- Tribe categories
CREATE TYPE tribe_category AS ENUM ('social', 'gaming', 'family', 'work', 'hobbies', 'other');

-- Activity types for activity feed
CREATE TYPE activity_type AS ENUM ('post', 'photo', 'event', 'member', 'comment', 'like');

-- Media types
CREATE TYPE media_type AS ENUM ('image', 'video', 'document');

-- Invitation status
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');

-- Event status
CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');

-- ============================================
-- AUTHENTICATION TABLES (Better Auth)
-- ============================================

-- Users table
CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    image TEXT,
    username TEXT UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sessions table
CREATE TABLE "session" (
    id TEXT PRIMARY KEY,
    expires_at TIMESTAMP NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

-- Accounts table (for OAuth and email/password)
CREATE TABLE "account" (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at TIMESTAMP,
    refresh_token_expires_at TIMESTAMP,
    scope TEXT,
    password TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Verification table (for OTP, magic links, etc.)
CREATE TABLE "verification" (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- TRIBE TABLES
-- ============================================

-- Tribes table
CREATE TABLE "tribe" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    avatar TEXT,
    location TEXT,
    privacy privacy_type NOT NULL DEFAULT 'private',
    category tribe_category NOT NULL DEFAULT 'other',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_trending BOOLEAN NOT NULL DEFAULT FALSE,
    created_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tribe members (many-to-many relationship)
CREATE TABLE "tribe_member" (
    id TEXT PRIMARY KEY,
    tribe_id TEXT NOT NULL REFERENCES "tribe"(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    role tribe_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(tribe_id, user_id)
);

-- Tribe invitations
CREATE TABLE "tribe_invitation" (
    id TEXT PRIMARY KEY,
    tribe_id TEXT NOT NULL REFERENCES "tribe"(id) ON DELETE CASCADE,
    invited_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
    email TEXT NOT NULL,
    role tribe_role NOT NULL DEFAULT 'member',
    status invitation_status NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- POST TABLES
-- ============================================

-- Posts table
CREATE TABLE "post" (
    id TEXT PRIMARY KEY,
    tribe_id TEXT NOT NULL REFERENCES "tribe"(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Post likes
CREATE TABLE "post_like" (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES "post"(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Comments table
CREATE TABLE "comment" (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES "post"(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id TEXT REFERENCES "comment"(id) ON DELETE CASCADE, -- For nested comments/replies
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comment likes
CREATE TABLE "comment_like" (
    id TEXT PRIMARY KEY,
    comment_id TEXT NOT NULL REFERENCES "comment"(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- ============================================
-- MEDIA TABLES
-- ============================================

-- Media files (photos, videos, documents)
CREATE TABLE "media" (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES "post"(id) ON DELETE CASCADE, -- Media attached to a post
    album_id TEXT REFERENCES "album"(id) ON DELETE SET NULL, -- Media in an album
    uploaded_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    tribe_id TEXT NOT NULL REFERENCES "tribe"(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type media_type NOT NULL,
    file_size BIGINT, -- Size in bytes
    mime_type TEXT,
    width INTEGER, -- For images/videos
    height INTEGER, -- For images/videos
    duration INTEGER, -- For videos (in seconds)
    thumbnail_url TEXT, -- For videos
    alt_text TEXT, -- For accessibility
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Albums table
CREATE TABLE "album" (
    id TEXT PRIMARY KEY,
    tribe_id TEXT NOT NULL REFERENCES "tribe"(id) ON DELETE CASCADE,
    created_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- EVENT TABLES
-- ============================================

-- Events table
CREATE TABLE "event" (
    id TEXT PRIMARY KEY,
    tribe_id TEXT NOT NULL REFERENCES "tribe"(id) ON DELETE CASCADE,
    created_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    status event_status NOT NULL DEFAULT 'upcoming',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Event attendees
CREATE TABLE "event_attendee" (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES "event"(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'going', -- 'going', 'maybe', 'not_going'
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- ============================================
-- ACTIVITY & NOTIFICATION TABLES
-- ============================================

-- Activity feed
CREATE TABLE "activity" (
    id TEXT PRIMARY KEY,
    type activity_type NOT NULL,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    tribe_id TEXT REFERENCES "tribe"(id) ON DELETE CASCADE,
    post_id TEXT REFERENCES "post"(id) ON DELETE CASCADE,
    event_id TEXT REFERENCES "event"(id) ON DELETE CASCADE,
    media_id TEXT REFERENCES "media"(id) ON DELETE CASCADE,
    target_user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE, -- For member joins, etc.
    action TEXT NOT NULL, -- e.g., 'shared a new post', 'joined the tribe'
    preview TEXT, -- Preview text for the activity
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Notifications table
CREATE TABLE "notification" (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'like', 'comment', 'mention', 'invitation', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT, -- URL to the related content
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- HASHTAG & TRENDING TABLES
-- ============================================

-- Hashtags table
CREATE TABLE "hashtag" (
    id TEXT PRIMARY KEY,
    tag TEXT NOT NULL UNIQUE, -- e.g., '#SummerPlans'
    post_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Post hashtags (many-to-many)
CREATE TABLE "post_hashtag" (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES "post"(id) ON DELETE CASCADE,
    hashtag_id TEXT NOT NULL REFERENCES "hashtag"(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, hashtag_id)
);

-- ============================================
-- MESSAGING TABLES
-- ============================================

-- Messages table (for tribe messaging/chat)
CREATE TABLE "message" (
    id TEXT PRIMARY KEY,
    tribe_id TEXT NOT NULL REFERENCES "tribe"(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Message reads (to track unread messages)
CREATE TABLE "message_read" (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL REFERENCES "message"(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    read_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- User indexes
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_username ON "user"(username);

-- Session indexes
CREATE INDEX idx_session_user_id ON "session"(user_id);
CREATE INDEX idx_session_token ON "session"(token);
CREATE INDEX idx_session_expires_at ON "session"(expires_at);

-- Account indexes
CREATE INDEX idx_account_user_id ON "account"(user_id);
CREATE INDEX idx_account_provider ON "account"(provider_id, account_id);

-- Verification indexes
CREATE INDEX idx_verification_identifier ON "verification"(identifier);
CREATE INDEX idx_verification_expires_at ON "verification"(expires_at);

-- Tribe indexes
CREATE INDEX idx_tribe_created_by ON "tribe"(created_by);
CREATE INDEX idx_tribe_privacy ON "tribe"(privacy);
CREATE INDEX idx_tribe_category ON "tribe"(category);
CREATE INDEX idx_tribe_featured ON "tribe"(is_featured);
CREATE INDEX idx_tribe_trending ON "tribe"(is_trending);

-- Tribe member indexes
CREATE INDEX idx_tribe_member_tribe_id ON "tribe_member"(tribe_id);
CREATE INDEX idx_tribe_member_user_id ON "tribe_member"(user_id);
CREATE INDEX idx_tribe_member_role ON "tribe_member"(role);

-- Tribe invitation indexes
CREATE INDEX idx_tribe_invitation_tribe_id ON "tribe_invitation"(tribe_id);
CREATE INDEX idx_tribe_invitation_email ON "tribe_invitation"(email);
CREATE INDEX idx_tribe_invitation_status ON "tribe_invitation"(status);

-- Post indexes
CREATE INDEX idx_post_tribe_id ON "post"(tribe_id);
CREATE INDEX idx_post_author_id ON "post"(author_id);
CREATE INDEX idx_post_created_at ON "post"(created_at DESC);

-- Post like indexes
CREATE INDEX idx_post_like_post_id ON "post_like"(post_id);
CREATE INDEX idx_post_like_user_id ON "post_like"(user_id);

-- Comment indexes
CREATE INDEX idx_comment_post_id ON "comment"(post_id);
CREATE INDEX idx_comment_author_id ON "comment"(author_id);
CREATE INDEX idx_comment_parent_id ON "comment"(parent_comment_id);
CREATE INDEX idx_comment_created_at ON "comment"(created_at DESC);

-- Comment like indexes
CREATE INDEX idx_comment_like_comment_id ON "comment_like"(comment_id);
CREATE INDEX idx_comment_like_user_id ON "comment_like"(user_id);

-- Media indexes
CREATE INDEX idx_media_post_id ON "media"(post_id);
CREATE INDEX idx_media_album_id ON "media"(album_id);
CREATE INDEX idx_media_tribe_id ON "media"(tribe_id);
CREATE INDEX idx_media_uploaded_by ON "media"(uploaded_by);
CREATE INDEX idx_media_file_type ON "media"(file_type);

-- Album indexes
CREATE INDEX idx_album_tribe_id ON "album"(tribe_id);
CREATE INDEX idx_album_created_by ON "album"(created_by);

-- Event indexes
CREATE INDEX idx_event_tribe_id ON "event"(tribe_id);
CREATE INDEX idx_event_created_by ON "event"(created_by);
CREATE INDEX idx_event_start_date ON "event"(start_date);
CREATE INDEX idx_event_status ON "event"(status);

-- Event attendee indexes
CREATE INDEX idx_event_attendee_event_id ON "event_attendee"(event_id);
CREATE INDEX idx_event_attendee_user_id ON "event_attendee"(user_id);

-- Activity indexes
CREATE INDEX idx_activity_user_id ON "activity"(user_id);
CREATE INDEX idx_activity_tribe_id ON "activity"(tribe_id);
CREATE INDEX idx_activity_type ON "activity"(type);
CREATE INDEX idx_activity_created_at ON "activity"(created_at DESC);

-- Notification indexes
CREATE INDEX idx_notification_user_id ON "notification"(user_id);
CREATE INDEX idx_notification_is_read ON "notification"(is_read);
CREATE INDEX idx_notification_created_at ON "notification"(created_at DESC);

-- Hashtag indexes
CREATE INDEX idx_hashtag_tag ON "hashtag"(tag);
CREATE INDEX idx_hashtag_post_count ON "hashtag"(post_count DESC);

-- Post hashtag indexes
CREATE INDEX idx_post_hashtag_post_id ON "post_hashtag"(post_id);
CREATE INDEX idx_post_hashtag_hashtag_id ON "post_hashtag"(hashtag_id);

-- Message indexes
CREATE INDEX idx_message_tribe_id ON "message"(tribe_id);
CREATE INDEX idx_message_sender_id ON "message"(sender_id);
CREATE INDEX idx_message_created_at ON "message"(created_at DESC);

-- Message read indexes
CREATE INDEX idx_message_read_message_id ON "message_read"(message_id);
CREATE INDEX idx_message_read_user_id ON "message_read"(user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_updated_at BEFORE UPDATE ON "session"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_updated_at BEFORE UPDATE ON "account"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_updated_at BEFORE UPDATE ON "verification"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tribe_updated_at BEFORE UPDATE ON "tribe"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tribe_invitation_updated_at BEFORE UPDATE ON "tribe_invitation"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_updated_at BEFORE UPDATE ON "post"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comment_updated_at BEFORE UPDATE ON "comment"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_album_updated_at BEFORE UPDATE ON "album"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_updated_at BEFORE UPDATE ON "event"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_attendee_updated_at BEFORE UPDATE ON "event_attendee"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hashtag_updated_at BEFORE UPDATE ON "hashtag"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update hashtag post count
CREATE OR REPLACE FUNCTION update_hashtag_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE "hashtag" SET post_count = post_count + 1 WHERE id = NEW.hashtag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE "hashtag" SET post_count = GREATEST(0, post_count - 1) WHERE id = OLD.hashtag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hashtag_count_on_insert
    AFTER INSERT ON "post_hashtag"
    FOR EACH ROW EXECUTE FUNCTION update_hashtag_post_count();

CREATE TRIGGER update_hashtag_count_on_delete
    AFTER DELETE ON "post_hashtag"
    FOR EACH ROW EXECUTE FUNCTION update_hashtag_post_count();

-- ============================================
-- END OF SCHEMA
-- ============================================

