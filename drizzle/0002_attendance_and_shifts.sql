CREATE TYPE "public"."attendance_status" AS ENUM('present', 'late', 'missing_checkout', 'adjusted');--> statement-breakpoint
CREATE TYPE "public"."attendance_event_type" AS ENUM('check_in', 'check_out');--> statement-breakpoint
CREATE TYPE "public"."adjustment_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "work_shifts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "name" varchar(120) NOT NULL,
  "timezone" varchar(80) DEFAULT 'Asia/Dhaka' NOT NULL, "start_time" time NOT NULL, "end_time" time NOT NULL,
  "grace_minutes" integer DEFAULT 0 NOT NULL, "weekdays" jsonb DEFAULT '[1,2,3,4,5]'::jsonb NOT NULL,
  "is_overnight" boolean DEFAULT false NOT NULL, "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "shift_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "employee_id" uuid NOT NULL, "shift_id" uuid NOT NULL,
  "effective_from" date NOT NULL, "effective_to" date, "created_by" uuid, "created_at" timestamptz DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "attendance_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "employee_id" uuid NOT NULL, "shift_id" uuid,
  "assignment_id" uuid, "work_date" date NOT NULL, "timezone" varchar(80) NOT NULL,
  "scheduled_start" timestamptz, "scheduled_end" timestamptz, "check_in_at" timestamptz DEFAULT now() NOT NULL,
  "check_out_at" timestamptz, "worked_minutes" integer, "late_minutes" integer DEFAULT 0 NOT NULL,
  "status" "attendance_status" DEFAULT 'present' NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "attendance_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "record_id" uuid NOT NULL, "employee_id" uuid NOT NULL,
  "event_type" "attendance_event_type" NOT NULL, "occurred_at" timestamptz DEFAULT now() NOT NULL,
  "idempotency_key" uuid NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "attendance_adjustments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "record_id" uuid NOT NULL, "employee_id" uuid NOT NULL,
  "requested_check_in_at" timestamptz, "requested_check_out_at" timestamptz, "reason" text NOT NULL,
  "status" "adjustment_status" DEFAULT 'pending' NOT NULL, "reviewer_note" text, "reviewed_by" uuid,
  "reviewed_at" timestamptz, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_employee_fk" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shift_fk" FOREIGN KEY ("shift_id") REFERENCES "work_shifts"("id");--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_creator_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE set null;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employee_fk" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_shift_fk" FOREIGN KEY ("shift_id") REFERENCES "work_shifts"("id") ON DELETE set null;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_assignment_fk" FOREIGN KEY ("assignment_id") REFERENCES "shift_assignments"("id") ON DELETE set null;--> statement-breakpoint
ALTER TABLE "attendance_events" ADD CONSTRAINT "attendance_events_record_fk" FOREIGN KEY ("record_id") REFERENCES "attendance_records"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "attendance_events" ADD CONSTRAINT "attendance_events_employee_fk" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "attendance_adjustments" ADD CONSTRAINT "attendance_adjustments_record_fk" FOREIGN KEY ("record_id") REFERENCES "attendance_records"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "attendance_adjustments" ADD CONSTRAINT "attendance_adjustments_employee_fk" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "attendance_adjustments" ADD CONSTRAINT "attendance_adjustments_reviewer_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE set null;--> statement-breakpoint
CREATE UNIQUE INDEX "work_shifts_name_idx" ON "work_shifts" ("name");--> statement-breakpoint
CREATE INDEX "shift_assignments_employee_date_idx" ON "shift_assignments" ("employee_id", "effective_from");--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_no_overlap" EXCLUDE USING gist
("employee_id" WITH =, daterange("effective_from", COALESCE("effective_to", 'infinity'::date), '[]') WITH &&);--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_records_employee_date_idx" ON "attendance_records" ("employee_id", "work_date");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_records_one_open_idx" ON "attendance_records" ("employee_id") WHERE "check_out_at" IS NULL;--> statement-breakpoint
CREATE INDEX "attendance_records_date_status_idx" ON "attendance_records" ("work_date", "status");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_events_idempotency_idx" ON "attendance_events" ("idempotency_key");--> statement-breakpoint
CREATE INDEX "attendance_events_employee_idx" ON "attendance_events" ("employee_id", "occurred_at");--> statement-breakpoint
CREATE INDEX "attendance_adjustments_employee_idx" ON "attendance_adjustments" ("employee_id", "status");--> statement-breakpoint
CREATE INDEX "attendance_adjustments_record_status_idx" ON "attendance_adjustments" ("record_id", "status");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_adjustments_one_pending_idx" ON "attendance_adjustments" ("record_id") WHERE "status" = 'pending';
