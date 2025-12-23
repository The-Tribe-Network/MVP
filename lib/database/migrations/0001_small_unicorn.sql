CREATE TABLE "poll" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"question" text NOT NULL,
	"allow_multiple" boolean DEFAULT false NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_option" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"text" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_vote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"option_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "poll_vote_poll_id_option_id_user_id_unique" UNIQUE("poll_id","option_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "tribe" DROP CONSTRAINT "tribe_avatar_media_id_fk";
--> statement-breakpoint
ALTER TABLE "album_media" DROP CONSTRAINT "album_media_album_id_album_id_fk";
--> statement-breakpoint
DROP INDEX "idx_album_cover_id";--> statement-breakpoint
DROP INDEX "idx_album_media_added_at";--> statement-breakpoint
DROP INDEX "idx_album_media_album_id";--> statement-breakpoint
DROP INDEX "idx_album_media_media_id";--> statement-breakpoint
ALTER TABLE "comment" ALTER COLUMN "post_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "album_media" ALTER COLUMN "album_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "linked_album_id" uuid;--> statement-breakpoint
ALTER TABLE "comment" ADD COLUMN "event_id" uuid;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "tour_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "poll" ADD CONSTRAINT "poll_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll" ADD CONSTRAINT "poll_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_option" ADD CONSTRAINT "poll_option_poll_id_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."poll"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_vote" ADD CONSTRAINT "poll_vote_poll_id_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."poll"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_vote" ADD CONSTRAINT "poll_vote_option_id_poll_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."poll_option"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_vote" ADD CONSTRAINT "poll_vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_linked_album_id_album_id_fk" FOREIGN KEY ("linked_album_id") REFERENCES "public"."album"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "album_media" ADD CONSTRAINT "album_media_album_id_album_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."album"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_post_linked_album_id" ON "post" USING btree ("linked_album_id");--> statement-breakpoint
CREATE INDEX "idx_album_cover_id" ON "album" USING btree ("cover_id");--> statement-breakpoint
CREATE INDEX "idx_album_media_added_at" ON "album_media" USING btree ("added_at");--> statement-breakpoint
CREATE INDEX "idx_album_media_album_id" ON "album_media" USING btree ("album_id");--> statement-breakpoint
CREATE INDEX "idx_album_media_media_id" ON "album_media" USING btree ("media_id");--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "add_to_album";