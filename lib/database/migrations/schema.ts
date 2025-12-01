import { pgTable, uuid, text, timestamp, foreignKey, type AnyPgColumn, boolean, unique, integer, bigint, index, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const activityType = pgEnum("activity_type", ['post', 'photo', 'event', 'member', 'comment', 'like'])
export const albumPrivacy = pgEnum("album_privacy", ['public', 'private', 'admin_only'])
export const eventStatus = pgEnum("event_status", ['upcoming', 'ongoing', 'completed', 'cancelled'])
export const invitationStatus = pgEnum("invitation_status", ['pending', 'accepted', 'rejected', 'expired'])
export const mediaType = pgEnum("media_type", ['image', 'video', 'document'])
export const messageType = pgEnum("message_type", ['group', 'direct'])
export const privacyType = pgEnum("privacy_type", ['private', 'public'])
export const tribeCategory = pgEnum("tribe_category", ['social', 'gaming', 'family', 'work', 'hobbies', 'other'])
export const tribeRole = pgEnum("tribe_role", ['owner', 'admin', 'moderator', 'member'])


export const verification = pgTable("verification", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const account = pgTable("account", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: uuid("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const event = pgTable("event", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tribeId: uuid("tribe_id").notNull(),
	createdBy: uuid("created_by").notNull(),
	title: text().notNull(),
	description: text(),
	location: text(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	status: eventStatus().default('upcoming').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "event_created_by_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tribeId],
			foreignColumns: [tribe.id],
			name: "event_tribe_id_tribe_id_fk"
		}).onDelete("cascade"),
]);

export const activity = pgTable("activity", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	type: activityType().notNull(),
	userId: uuid("user_id").notNull(),
	tribeId: uuid("tribe_id"),
	postId: uuid("post_id"),
	eventId: uuid("event_id"),
	mediaId: uuid("media_id"),
	targetUserId: uuid("target_user_id"),
	action: text().notNull(),
	preview: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [event.id],
			name: "activity_event_id_event_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.mediaId],
			foreignColumns: [media.id],
			name: "activity_media_id_media_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [post.id],
			name: "activity_post_id_post_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.targetUserId],
			foreignColumns: [user.id],
			name: "activity_target_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tribeId],
			foreignColumns: [tribe.id],
			name: "activity_tribe_id_tribe_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "activity_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const post = pgTable("post", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tribeId: uuid("tribe_id").notNull(),
	authorId: uuid("author_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [user.id],
			name: "post_author_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tribeId],
			foreignColumns: [tribe.id],
			name: "post_tribe_id_tribe_id_fk"
		}).onDelete("cascade"),
]);

export const tribe = pgTable("tribe", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	avatar: uuid(),
	location: text(),
	privacy: privacyType().default('private').notNull(),
	category: tribeCategory().default('other').notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	isTrending: boolean("is_trending").default(false).notNull(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.avatar],
			foreignColumns: [media.id],
			name: "tribe_avatar_media_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "tribe_created_by_user_id_fk"
		}).onDelete("restrict"),
]);

export const comment = pgTable("comment", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	authorId: uuid("author_id").notNull(),
	content: text().notNull(),
	parentCommentId: uuid("parent_comment_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [user.id],
			name: "comment_author_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.parentCommentId],
			foreignColumns: [table.id],
			name: "comment_parent_comment_id_comment_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [post.id],
			name: "comment_post_id_post_id_fk"
		}).onDelete("cascade"),
]);

export const commentLike = pgTable("comment_like", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	commentId: uuid("comment_id").notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.commentId],
			foreignColumns: [comment.id],
			name: "comment_like_comment_id_comment_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "comment_like_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("comment_like_comment_id_user_id_unique").on(table.commentId, table.userId),
]);

export const eventAttendee = pgTable("event_attendee", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventId: uuid("event_id").notNull(),
	userId: uuid("user_id").notNull(),
	status: text().default('going').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [event.id],
			name: "event_attendee_event_id_event_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "event_attendee_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("event_attendee_event_id_user_id_unique").on(table.eventId, table.userId),
]);

export const message = pgTable("message", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	messageType: messageType("message_type").default('group').notNull(),
	tribeId: uuid("tribe_id"),
	senderId: uuid("sender_id").notNull(),
	recipientId: uuid("recipient_id"),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.recipientId],
			foreignColumns: [user.id],
			name: "message_recipient_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [user.id],
			name: "message_sender_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tribeId],
			foreignColumns: [tribe.id],
			name: "message_tribe_id_tribe_id_fk"
		}).onDelete("cascade"),
]);

export const messageRead = pgTable("message_read", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	messageId: uuid("message_id").notNull(),
	userId: uuid("user_id").notNull(),
	readAt: timestamp("read_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [message.id],
			name: "message_read_message_id_message_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "message_read_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("message_read_message_id_user_id_unique").on(table.messageId, table.userId),
]);

export const notification = pgTable("notification", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	type: text().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	link: text(),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "notification_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const hashtag = pgTable("hashtag", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tag: text().notNull(),
	postCount: integer("post_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("hashtag_tag_unique").on(table.tag),
]);

export const postHashtag = pgTable("post_hashtag", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	hashtagId: uuid("hashtag_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.hashtagId],
			foreignColumns: [hashtag.id],
			name: "post_hashtag_hashtag_id_hashtag_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [post.id],
			name: "post_hashtag_post_id_post_id_fk"
		}).onDelete("cascade"),
	unique("post_hashtag_post_id_hashtag_id_unique").on(table.postId, table.hashtagId),
]);

export const postLike = pgTable("post_like", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [post.id],
			name: "post_like_post_id_post_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "post_like_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("post_like_post_id_user_id_unique").on(table.postId, table.userId),
]);

export const session = pgTable("session", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: uuid("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const tribeInvitation = pgTable("tribe_invitation", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tribeId: uuid("tribe_id").notNull(),
	invitedBy: uuid("invited_by").notNull(),
	email: text().notNull(),
	role: tribeRole().default('member').notNull(),
	status: invitationStatus().default('pending').notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.invitedBy],
			foreignColumns: [user.id],
			name: "tribe_invitation_invited_by_user_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.tribeId],
			foreignColumns: [tribe.id],
			name: "tribe_invitation_tribe_id_tribe_id_fk"
		}).onDelete("cascade"),
]);

export const tribeMember = pgTable("tribe_member", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tribeId: uuid("tribe_id").notNull(),
	userId: uuid("user_id").notNull(),
	role: tribeRole().default('member').notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tribeId],
			foreignColumns: [tribe.id],
			name: "tribe_member_tribe_id_tribe_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "tribe_member_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("tribe_member_tribe_id_user_id_unique").on(table.tribeId, table.userId),
]);

export const user = pgTable("user", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	username: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	displayName: text("display_name"),
	bio: text(),
	location: text(),
	profileCompleted: boolean("profile_completed").default(false).notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
	unique("user_username_unique").on(table.username),
]);

export const tribeMemberPermission = pgTable("tribe_member_permission", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tribeMemberId: uuid("tribe_member_id").notNull(),
	tribeId: uuid("tribe_id").notNull(),
	userId: uuid("user_id").notNull(),
	canPost: boolean("can_post"),
	canComment: boolean("can_comment"),
	canEditOwnPosts: boolean("can_edit_own_posts"),
	canDeleteOwnPosts: boolean("can_delete_own_posts"),
	canUploadMedia: boolean("can_upload_media"),
	canCreateAlbums: boolean("can_create_albums"),
	canDeleteOwnMedia: boolean("can_delete_own_media"),
	canCreateEvents: boolean("can_create_events"),
	canEditEvents: boolean("can_edit_events"),
	canDeleteEvents: boolean("can_delete_events"),
	canInviteMembers: boolean("can_invite_members"),
	canRemoveMembers: boolean("can_remove_members"),
	canChangeMemberRoles: boolean("can_change_member_roles"),
	canManagePermissions: boolean("can_manage_permissions"),
	canModeratePosts: boolean("can_moderate_posts"),
	canModerateComments: boolean("can_moderate_comments"),
	canDeleteAnyPost: boolean("can_delete_any_post"),
	canDeleteAnyComment: boolean("can_delete_any_comment"),
	canEditTribeSettings: boolean("can_edit_tribe_settings"),
	canDeleteTribe: boolean("can_delete_tribe"),
	canTransferOwnership: boolean("can_transfer_ownership"),
	canSendMessages: boolean("can_send_messages"),
	restrictionReason: text("restriction_reason"),
	setBy: uuid("set_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	canDeleteAnyMedia: boolean("can_delete_any_media"),
}, (table) => [
	foreignKey({
			columns: [table.setBy],
			foreignColumns: [user.id],
			name: "tribe_member_permission_set_by_user_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.tribeId],
			foreignColumns: [tribe.id],
			name: "tribe_member_permission_tribe_id_tribe_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tribeMemberId],
			foreignColumns: [tribeMember.id],
			name: "tribe_member_permission_tribe_member_id_tribe_member_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "tribe_member_permission_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const media = pgTable("media", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id"),
	uploadedBy: uuid("uploaded_by").notNull(),
	tribeId: uuid("tribe_id"),
	fileUrl: text("file_url").notNull(),
	fileType: mediaType("file_type").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	fileSize: bigint("file_size", { mode: "number" }),
	mimeType: text("mime_type"),
	width: integer(),
	height: integer(),
	duration: integer(),
	thumbnailUrl: text("thumbnail_url"),
	altText: text("alt_text"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	addToAlbum: boolean("add_to_album").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [post.id],
			name: "media_post_id_post_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tribeId],
			foreignColumns: [tribe.id],
			name: "media_tribe_id_tribe_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [user.id],
			name: "media_uploaded_by_user_id_fk"
		}).onDelete("cascade"),
]);

export const album = pgTable("album", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tribeId: uuid("tribe_id").notNull(),
	createdBy: uuid("created_by").notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	privacy: albumPrivacy().default('public').notNull(),
	coverId: uuid("cover_id"),
}, (table) => [
	index("idx_album_cover_id").using("btree", table.coverId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "album_created_by_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tribeId],
			foreignColumns: [tribe.id],
			name: "album_tribe_id_tribe_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.coverId],
			foreignColumns: [media.id],
			name: "album_cover_id_media_id_fk"
		}).onDelete("set null"),
]);

export const mediaLike = pgTable("media_like", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	mediaId: uuid("media_id").notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.mediaId],
			foreignColumns: [media.id],
			name: "media_like_media_id_media_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "media_like_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("media_like_media_id_user_id_unique").on(table.mediaId, table.userId),
]);

export const tribeMemberPreference = pgTable("tribe_member_preference", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tribeMemberId: uuid("tribe_member_id").notNull(),
	userId: uuid("user_id").notNull(),
	autoAddPostMediaToTribe: boolean("auto_add_post_media_to_tribe").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tribeMemberId],
			foreignColumns: [tribeMember.id],
			name: "tribe_member_preference_tribe_member_id_tribe_member_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "tribe_member_preference_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const albumMedia = pgTable("album_media", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	albumId: uuid("album_id").notNull(),
	mediaId: uuid("media_id").notNull(),
	addedAt: timestamp("added_at", { mode: 'string' }).defaultNow().notNull(),
	addedBy: uuid("added_by").notNull(),
	displayOrder: integer("display_order"),
}, (table) => [
	index("idx_album_media_added_at").using("btree", table.addedAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_album_media_album_id").using("btree", table.albumId.asc().nullsLast().op("uuid_ops")),
	index("idx_album_media_media_id").using("btree", table.mediaId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.albumId],
			foreignColumns: [album.id],
			name: "album_media_album_id_album_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.mediaId],
			foreignColumns: [media.id],
			name: "album_media_media_id_media_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.addedBy],
			foreignColumns: [user.id],
			name: "album_media_added_by_user_id_fk"
		}).onDelete("cascade"),
	unique("album_media_album_id_media_id_unique").on(table.albumId, table.mediaId),
]);
