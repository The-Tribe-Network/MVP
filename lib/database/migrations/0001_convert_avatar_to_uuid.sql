-- Migration: Convert tribe.avatar from TEXT to UUID
-- This migration handles the conversion of the avatar column from TEXT to UUID
-- and adds the foreign key constraint to the media table

-- Step 1: Clean up any invalid UUID values (set to NULL if not a valid UUID)
-- This handles any edge cases where avatar might contain non-UUID text
UPDATE tribe 
SET avatar = NULL 
WHERE avatar IS NOT NULL 
  AND avatar !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Step 2: Convert the column type from TEXT to UUID
-- Using explicit cast with USING clause
ALTER TABLE tribe 
ALTER COLUMN avatar TYPE uuid USING avatar::uuid;

-- Step 3: Add foreign key constraint to media table
-- Note: This will fail if there are any avatar values that don't exist in media.id
-- The ON DELETE SET NULL ensures that if a media record is deleted, avatar is set to NULL
ALTER TABLE tribe 
ADD CONSTRAINT tribe_avatar_fkey 
FOREIGN KEY (avatar) REFERENCES media(id) ON DELETE SET NULL;

