ALTER TYPE "public"."leave_status" ADD VALUE IF NOT EXISTS 'cancelled';--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
CREATE TYPE "public"."leave_cycle" AS ENUM('calendar_year', 'anniversary_year');--> statement-breakpoint
CREATE TYPE "public"."leave_ledger_event" AS ENUM('grant', 'reserve', 'release', 'consume', 'adjustment');--> statement-breakpoint
ALTER TABLE "leave_requests" ADD COLUMN "charge_days" numeric(6, 2);--> statement-breakpoint
ALTER TABLE "leave_requests" ADD COLUMN "day_fraction" numeric(3, 2) DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD COLUMN "cycle_start" date;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD COLUMN "cycle_end" date;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD COLUMN "exception_approved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE TABLE "leave_policies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "leave_type" "leave_type" NOT NULL,
  "annual_entitlement" numeric(6, 2) DEFAULT 0 NOT NULL,
  "cycle_type" "leave_cycle" DEFAULT 'calendar_year' NOT NULL,
  "exclude_weekends" boolean DEFAULT true NOT NULL,
  "weekend_days" jsonb DEFAULT '[0,6]'::jsonb NOT NULL,
  "exclude_holidays" boolean DEFAULT true NOT NULL,
  "allow_half_day" boolean DEFAULT false NOT NULL,
  "reserve_pending" boolean DEFAULT true NOT NULL,
  "allow_negative_with_approval" boolean DEFAULT false NOT NULL,
  "is_active" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "holiday_calendar" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "holiday_date" date NOT NULL,
  "name" varchar(160) NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "leave_ledger" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "employee_id" uuid NOT NULL,
  "leave_type" "leave_type" NOT NULL,
  "request_id" uuid,
  "event_type" "leave_ledger_event" NOT NULL,
  "amount" numeric(7, 2) NOT NULL,
  "cycle_start" date NOT NULL,
  "cycle_end" date NOT NULL,
  "event_key" varchar(180) NOT NULL,
  "note" text,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "leave_approval_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "request_id" uuid NOT NULL,
  "actor_user_id" uuid,
  "from_status" "leave_status" NOT NULL,
  "to_status" "leave_status" NOT NULL,
  "note" text,
  "exception_approved" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "leave_ledger" ADD CONSTRAINT "leave_ledger_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "leave_ledger" ADD CONSTRAINT "leave_ledger_request_id_leave_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."leave_requests"("id") ON DELETE set null;--> statement-breakpoint
ALTER TABLE "leave_ledger" ADD CONSTRAINT "leave_ledger_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null;--> statement-breakpoint
ALTER TABLE "leave_approval_history" ADD CONSTRAINT "leave_approval_history_request_id_leave_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."leave_requests"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "leave_approval_history" ADD CONSTRAINT "leave_approval_history_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null;--> statement-breakpoint
CREATE UNIQUE INDEX "leave_policies_type_idx" ON "leave_policies" ("leave_type");--> statement-breakpoint
CREATE UNIQUE INDEX "holiday_calendar_date_idx" ON "holiday_calendar" ("holiday_date");--> statement-breakpoint
CREATE INDEX "leave_ledger_employee_cycle_idx" ON "leave_ledger" ("employee_id", "leave_type", "cycle_start");--> statement-breakpoint
CREATE UNIQUE INDEX "leave_ledger_event_key_idx" ON "leave_ledger" ("event_key");--> statement-breakpoint
CREATE INDEX "leave_approval_history_request_idx" ON "leave_approval_history" ("request_id");--> statement-breakpoint
CREATE UNIQUE INDEX "leave_approval_history_decision_idx" ON "leave_approval_history" ("request_id", "to_status");--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_no_active_overlap"
EXCLUDE USING gist ("employee_id" WITH =, daterange("start_date", "end_date", '[]') WITH &&)
WHERE ("status" IN ('pending', 'approved'));--> statement-breakpoint
INSERT INTO "leave_policies" ("leave_type") VALUES ('casual'), ('sick'), ('annual'), ('emergency') ON CONFLICT ("leave_type") DO NOTHING;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION enforce_leave_ledger_balance() RETURNS trigger AS $$
DECLARE
  current_balance numeric;
  permits_exception boolean;
BEGIN
  IF NEW.event_type NOT IN ('reserve', 'consume') THEN RETURN NEW; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.employee_id::text || NEW.leave_type::text || NEW.cycle_start::text, 0));
  SELECT COALESCE(SUM(amount), 0) INTO current_balance
    FROM leave_ledger
    WHERE employee_id = NEW.employee_id AND leave_type = NEW.leave_type AND cycle_start = NEW.cycle_start;
  SELECT COALESCE(exception_approved, false) INTO permits_exception FROM leave_requests WHERE id = NEW.request_id;
  IF current_balance + NEW.amount < 0 AND NOT COALESCE(permits_exception, false) THEN
    RAISE EXCEPTION 'insufficient leave balance';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "leave_ledger_balance_guard" BEFORE INSERT ON "leave_ledger"
FOR EACH ROW EXECUTE FUNCTION enforce_leave_ledger_balance();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION validate_leave_decision_history() RETURNS trigger AS $$
DECLARE current_status leave_status;
BEGIN
  SELECT status INTO current_status FROM leave_requests WHERE id = NEW.request_id FOR UPDATE;
  IF current_status IS DISTINCT FROM NEW.to_status THEN
    RAISE EXCEPTION 'stale leave decision';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "leave_decision_history_guard" BEFORE INSERT ON "leave_approval_history"
FOR EACH ROW EXECUTE FUNCTION validate_leave_decision_history();
