import { relations } from "drizzle-orm/relations";
import { user, account, event, tribe, activity, media, post, comment, commentLike, eventAttendee, eventSettings, eventCoHost, eventLink, message, messageRead, notification, hashtag, postHashtag, postLike, postMedia, session, tribeInvitation, tribeMember, tribeMemberPermission, album, mediaLike, tribeMemberPreference, albumMedia, poll, pollOption, pollVote, draft } from "@/lib/database/schemas";

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	events: many(event),
	activities_targetUserId: many(activity, {
		relationName: "activity_targetUserId_user_id"
	}),
	activities_userId: many(activity, {
		relationName: "activity_userId_user_id"
	}),
	posts: many(post),
	tribes: many(tribe),
	comments: many(comment),
	commentLikes: many(commentLike),
	eventAttendees: many(eventAttendee),
	eventCoHosts_userId: many(eventCoHost, {
		relationName: "eventCoHost_userId_user_id"
	}),
	eventCoHosts_addedBy: many(eventCoHost, {
		relationName: "eventCoHost_addedBy_user_id"
	}),
	eventLinks: many(eventLink),
	messages_recipientId: many(message, {
		relationName: "message_recipientId_user_id"
	}),
	messages_senderId: many(message, {
		relationName: "message_senderId_user_id"
	}),
	messageReads: many(messageRead),
	notifications: many(notification),
	postLikes: many(postLike),
	sessions: many(session),
	tribeInvitations: many(tribeInvitation),
	tribeMembers: many(tribeMember),
	tribeMemberPermissions_setBy: many(tribeMemberPermission, {
		relationName: "tribeMemberPermission_setBy_user_id"
	}),
	tribeMemberPermissions_userId: many(tribeMemberPermission, {
		relationName: "tribeMemberPermission_userId_user_id"
	}),
	media: many(media),
	albums: many(album),
	mediaLikes: many(mediaLike),
	tribeMemberPreferences: many(tribeMemberPreference),
	albumMedias: many(albumMedia),
	polls: many(poll),
	pollVotes: many(pollVote),
}));

export const eventRelations = relations(event, ({ one, many }) => ({
	user: one(user, {
		fields: [event.createdBy],
		references: [user.id]
	}),
	tribe: one(tribe, {
		fields: [event.tribeId],
		references: [tribe.id]
	}),
	activities: many(activity),
	eventAttendees: many(eventAttendee),
	polls: many(poll),
	eventSettings: one(eventSettings),
	eventCoHosts: many(eventCoHost),
	eventLinks: many(eventLink),
}));

export const eventSettingsRelations = relations(eventSettings, ({ one }) => ({
	event: one(event, {
		fields: [eventSettings.eventId],
		references: [event.id]
	}),
	linkedAlbum: one(album, {
		fields: [eventSettings.linkedAlbumId],
		references: [album.id]
	}),
}));

export const eventCoHostRelations = relations(eventCoHost, ({ one }) => ({
	event: one(event, {
		fields: [eventCoHost.eventId],
		references: [event.id]
	}),
	user: one(user, {
		fields: [eventCoHost.userId],
		references: [user.id],
		relationName: "eventCoHost_userId_user_id"
	}),
	addedByUser: one(user, {
		fields: [eventCoHost.addedBy],
		references: [user.id],
		relationName: "eventCoHost_addedBy_user_id"
	}),
}));

export const eventLinkRelations = relations(eventLink, ({ one }) => ({
	event: one(event, {
		fields: [eventLink.eventId],
		references: [event.id]
	}),
	createdByUser: one(user, {
		fields: [eventLink.createdBy],
		references: [user.id]
	}),
}));

export const tribeRelations = relations(tribe, ({ one, many }) => ({
	events: many(event),
	activities: many(activity),
	posts: many(post),
	media_avatar: one(media, {
		fields: [tribe.avatar],
		references: [media.id],
		relationName: "tribe_avatar_media_id"
	}),
	media_featured: one(media, {
		fields: [tribe.featuredMediaId],
		references: [media.id],
		relationName: "tribe_featuredMediaId_media_id"
	}),
	user: one(user, {
		fields: [tribe.createdBy],
		references: [user.id]
	}),
	messages: many(message),
	tribeInvitations: many(tribeInvitation),
	tribeMembers: many(tribeMember),
	tribeMemberPermissions: many(tribeMemberPermission),
	media_tribeId: many(media, {
		relationName: "media_tribeId_tribe_id"
	}),
	albums: many(album),
}));

export const activityRelations = relations(activity, ({ one }) => ({
	event: one(event, {
		fields: [activity.eventId],
		references: [event.id]
	}),
	media: one(media, {
		fields: [activity.mediaId],
		references: [media.id]
	}),
	post: one(post, {
		fields: [activity.postId],
		references: [post.id]
	}),
	user_targetUserId: one(user, {
		fields: [activity.targetUserId],
		references: [user.id],
		relationName: "activity_targetUserId_user_id"
	}),
	tribe: one(tribe, {
		fields: [activity.tribeId],
		references: [tribe.id]
	}),
	user_userId: one(user, {
		fields: [activity.userId],
		references: [user.id],
		relationName: "activity_userId_user_id"
	}),
}));

export const mediaRelations = relations(media, ({ one, many }) => ({
	activities: many(activity),
	tribes_avatar: many(tribe, {
		relationName: "tribe_avatar_media_id"
	}),
	tribes_featured: many(tribe, {
		relationName: "tribe_featuredMediaId_media_id"
	}),
	post: one(post, {
		fields: [media.postId],
		references: [post.id]
	}),
	tribe: one(tribe, {
		fields: [media.tribeId],
		references: [tribe.id],
		relationName: "media_tribeId_tribe_id"
	}),
	user: one(user, {
		fields: [media.uploadedBy],
		references: [user.id]
	}),
	albums: many(album),
	mediaLikes: many(mediaLike),
	albumMedias: many(albumMedia),
}));

export const postRelations = relations(post, ({ one, many }) => ({
	activities: many(activity),
	user: one(user, {
		fields: [post.authorId],
		references: [user.id]
	}),
	tribe: one(tribe, {
		fields: [post.tribeId],
		references: [tribe.id]
	}),
	comments: many(comment),
	postHashtags: many(postHashtag),
	postLikes: many(postLike),
	media: many(media),
	postMedia: many(postMedia),
	event: one(event, {
		fields: [post.eventId],
		references: [event.id]
	}),
	poll: one(poll, {
		fields: [post.pollId],
		references: [poll.id]
	}),
}));

export const postMediaRelations = relations(postMedia, ({ one }) => ({
	post: one(post, {
		fields: [postMedia.postId],
		references: [post.id]
	}),
	media: one(media, {
		fields: [postMedia.mediaId],
		references: [media.id]
	}),
}));

export const commentRelations = relations(comment, ({ one, many }) => ({
	user: one(user, {
		fields: [comment.authorId],
		references: [user.id]
	}),
	comment: one(comment, {
		fields: [comment.parentCommentId],
		references: [comment.id],
		relationName: "comment_parentCommentId_comment_id"
	}),
	comments: many(comment, {
		relationName: "comment_parentCommentId_comment_id"
	}),
	post: one(post, {
		fields: [comment.postId],
		references: [post.id]
	}),
	commentLikes: many(commentLike),
}));

export const commentLikeRelations = relations(commentLike, ({ one }) => ({
	comment: one(comment, {
		fields: [commentLike.commentId],
		references: [comment.id]
	}),
	user: one(user, {
		fields: [commentLike.userId],
		references: [user.id]
	}),
}));

export const eventAttendeeRelations = relations(eventAttendee, ({ one }) => ({
	event: one(event, {
		fields: [eventAttendee.eventId],
		references: [event.id]
	}),
	user: one(user, {
		fields: [eventAttendee.userId],
		references: [user.id]
	}),
}));

export const messageRelations = relations(message, ({ one, many }) => ({
	user_recipientId: one(user, {
		fields: [message.recipientId],
		references: [user.id],
		relationName: "message_recipientId_user_id"
	}),
	user_senderId: one(user, {
		fields: [message.senderId],
		references: [user.id],
		relationName: "message_senderId_user_id"
	}),
	tribe: one(tribe, {
		fields: [message.tribeId],
		references: [tribe.id]
	}),
	messageReads: many(messageRead),
}));

export const messageReadRelations = relations(messageRead, ({ one }) => ({
	message: one(message, {
		fields: [messageRead.messageId],
		references: [message.id]
	}),
	user: one(user, {
		fields: [messageRead.userId],
		references: [user.id]
	}),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
	user: one(user, {
		fields: [notification.userId],
		references: [user.id]
	}),
}));

export const postHashtagRelations = relations(postHashtag, ({ one }) => ({
	hashtag: one(hashtag, {
		fields: [postHashtag.hashtagId],
		references: [hashtag.id]
	}),
	post: one(post, {
		fields: [postHashtag.postId],
		references: [post.id]
	}),
}));

export const hashtagRelations = relations(hashtag, ({ many }) => ({
	postHashtags: many(postHashtag),
}));

export const postLikeRelations = relations(postLike, ({ one }) => ({
	post: one(post, {
		fields: [postLike.postId],
		references: [post.id]
	}),
	user: one(user, {
		fields: [postLike.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const tribeInvitationRelations = relations(tribeInvitation, ({ one }) => ({
	user: one(user, {
		fields: [tribeInvitation.invitedBy],
		references: [user.id]
	}),
	tribe: one(tribe, {
		fields: [tribeInvitation.tribeId],
		references: [tribe.id]
	}),
}));

export const tribeMemberRelations = relations(tribeMember, ({ one, many }) => ({
	tribe: one(tribe, {
		fields: [tribeMember.tribeId],
		references: [tribe.id]
	}),
	user: one(user, {
		fields: [tribeMember.userId],
		references: [user.id]
	}),
	tribeMemberPermissions: many(tribeMemberPermission),
	tribeMemberPreferences: many(tribeMemberPreference),
}));

export const tribeMemberPermissionRelations = relations(tribeMemberPermission, ({ one }) => ({
	user_setBy: one(user, {
		fields: [tribeMemberPermission.setBy],
		references: [user.id],
		relationName: "tribeMemberPermission_setBy_user_id"
	}),
	tribe: one(tribe, {
		fields: [tribeMemberPermission.tribeId],
		references: [tribe.id]
	}),
	tribeMember: one(tribeMember, {
		fields: [tribeMemberPermission.tribeMemberId],
		references: [tribeMember.id]
	}),
	user_userId: one(user, {
		fields: [tribeMemberPermission.userId],
		references: [user.id],
		relationName: "tribeMemberPermission_userId_user_id"
	}),
}));

export const albumRelations = relations(album, ({ one, many }) => ({
	user: one(user, {
		fields: [album.createdBy],
		references: [user.id]
	}),
	tribe: one(tribe, {
		fields: [album.tribeId],
		references: [tribe.id]
	}),
	media: one(media, {
		fields: [album.coverId],
		references: [media.id]
	}),
	albumMedias: many(albumMedia),
}));

export const mediaLikeRelations = relations(mediaLike, ({ one }) => ({
	media: one(media, {
		fields: [mediaLike.mediaId],
		references: [media.id]
	}),
	user: one(user, {
		fields: [mediaLike.userId],
		references: [user.id]
	}),
}));

export const tribeMemberPreferenceRelations = relations(tribeMemberPreference, ({ one }) => ({
	tribeMember: one(tribeMember, {
		fields: [tribeMemberPreference.tribeMemberId],
		references: [tribeMember.id]
	}),
	user: one(user, {
		fields: [tribeMemberPreference.userId],
		references: [user.id]
	}),
}));

export const albumMediaRelations = relations(albumMedia, ({ one }) => ({
	album: one(album, {
		fields: [albumMedia.albumId],
		references: [album.id]
	}),
	media: one(media, {
		fields: [albumMedia.mediaId],
		references: [media.id]
	}),
	user: one(user, {
		fields: [albumMedia.addedBy],
		references: [user.id]
	}),
}));

export const pollRelations = relations(poll, ({ one, many }) => ({
	event: one(event, {
		fields: [poll.eventId],
		references: [event.id]
	}),
	creator: one(user, {
		fields: [poll.createdBy],
		references: [user.id]
	}),
	options: many(pollOption),
	votes: many(pollVote),
}));

export const pollOptionRelations = relations(pollOption, ({ one, many }) => ({
	poll: one(poll, {
		fields: [pollOption.pollId],
		references: [poll.id]
	}),
	votes: many(pollVote),
}));

export const pollVoteRelations = relations(pollVote, ({ one }) => ({
	poll: one(poll, {
		fields: [pollVote.pollId],
		references: [poll.id]
	}),
	option: one(pollOption, {
		fields: [pollVote.optionId],
		references: [pollOption.id]
	}),
	user: one(user, {
		fields: [pollVote.userId],
		references: [user.id]
	}),
}));

export const draftRelations = relations(draft, ({ one }) => ({
	user: one(user, {
		fields: [draft.userId],
		references: [user.id]
	}),
	tribe: one(tribe, {
		fields: [draft.tribeId],
		references: [tribe.id]
	}),
}));
