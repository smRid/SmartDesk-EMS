CREATE TYPE "public"."employment_status" AS ENUM('active', 'on_leave', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."leave_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."leave_type" AS ENUM('casual', 'sick', 'annual', 'emergency');--> statement-breakpoint
CREATE TYPE "public"."marital_status" AS ENUM('single', 'married', 'divorced', 'widowed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'employee');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"action" varchar(160) NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" varchar(120) NOT NULL,
	"details_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"employee_id" varchar(32) NOT NULL,
	"department_id" uuid NOT NULL,
	"designation" varchar(140) NOT NULL,
	"dob" date NOT NULL,
	"gender" "gender" NOT NULL,
	"marital_status" "marital_status" NOT NULL,
	"phone" varchar(32) NOT NULL,
	"address" text NOT NULL,
	"joining_date" date NOT NULL,
	"image_url" text,
	"cloudinary_public_id" text,
	"base_salary" numeric(12, 2) DEFAULT 0 NOT NULL,
	"status" "employment_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"leave_type" "leave_type" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"total_days" integer NOT NULL,
	"reason" text NOT NULL,
	"status" "leave_status" DEFAULT 'pending' NOT NULL,
	"admin_note" text,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"department_id" uuid NOT NULL,
	"basic_salary" numeric(12, 2) DEFAULT 0 NOT NULL,
	"allowance" numeric(12, 2) DEFAULT 0 NOT NULL,
	"deduction" numeric(12, 2) DEFAULT 0 NOT NULL,
	"total_salary" numeric(12, 2) DEFAULT 0 NOT NULL,
	"pay_date" date NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'employee' NOT NULL,
	"employee_id" varchar(32),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "departments_name_idx" ON "departments" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "employees_user_id_idx" ON "employees" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "employees_employee_id_idx" ON "employees" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "employees_department_idx" ON "employees" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "employees_status_idx" ON "employees" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leave_requests_employee_idx" ON "leave_requests" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "leave_requests_status_idx" ON "leave_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leave_requests_reviewed_by_idx" ON "leave_requests" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "salaries_employee_idx" ON "salaries" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "salaries_department_idx" ON "salaries" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "salaries_pay_date_idx" ON "salaries" USING btree ("pay_date");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_employee_id_idx" ON "users" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");