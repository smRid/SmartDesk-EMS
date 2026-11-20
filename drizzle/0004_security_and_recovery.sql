ALTER TABLE "users" ADD COLUMN "session_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE TABLE "auth_rate_limits" (
  "key_hash" varchar(64) PRIMARY KEY NOT NULL,
  "count" integer DEFAULT 0 NOT NULL,
  "reset_at" timestamptz NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "token_hash" varchar(64) NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "used_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_tokens_hash_idx" ON "password_reset_tokens" ("token_hash");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_idx" ON "password_reset_tokens" ("user_id", "expires_at");--> statement-breakpoint
CREATE INDEX "auth_rate_limits_reset_idx" ON "auth_rate_limits" ("reset_at");
