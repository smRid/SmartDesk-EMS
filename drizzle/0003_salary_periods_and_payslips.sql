CREATE TYPE "public"."salary_status" AS ENUM('draft', 'approved', 'finalized', 'paid');--> statement-breakpoint
ALTER TABLE "salaries" ADD COLUMN "period_start" date;--> statement-breakpoint
ALTER TABLE "salaries" ADD COLUMN "period_end" date;--> statement-breakpoint
ALTER TABLE "salaries" ADD COLUMN "currency" varchar(3) DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "salaries" ADD COLUMN "status" "salary_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "salaries" ADD COLUMN "approved_by" uuid;--> statement-breakpoint
ALTER TABLE "salaries" ADD COLUMN "approved_at" timestamptz;--> statement-breakpoint
ALTER TABLE "salaries" ADD COLUMN "finalized_by" uuid;--> statement-breakpoint
ALTER TABLE "salaries" ADD COLUMN "finalized_at" timestamptz;--> statement-breakpoint
ALTER TABLE "salaries" ADD COLUMN "paid_by" uuid;--> statement-breakpoint
ALTER TABLE "salaries" ADD COLUMN "paid_at" timestamptz;--> statement-breakpoint
UPDATE "salaries" SET
  "period_start" = date_trunc('month', "pay_date"::timestamp)::date,
  "period_end" = (date_trunc('month', "pay_date"::timestamp) + interval '1 month - 1 day')::date,
  "status" = 'paid';--> statement-breakpoint
ALTER TABLE "salaries" ALTER COLUMN "period_start" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "salaries" ALTER COLUMN "period_end" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_approved_by_users_fk" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE set null;--> statement-breakpoint
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_finalized_by_users_fk" FOREIGN KEY ("finalized_by") REFERENCES "users"("id") ON DELETE set null;--> statement-breakpoint
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_paid_by_users_fk" FOREIGN KEY ("paid_by") REFERENCES "users"("id") ON DELETE set null;--> statement-breakpoint
CREATE UNIQUE INDEX "salaries_employee_period_idx" ON "salaries" ("employee_id", "period_start", "period_end");
