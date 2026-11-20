import { z } from "zod";

const optionalString = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => value === "" ? undefined : value, schema.optional());

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters."),
  NEXTAUTH_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  SEED_EMPLOYEE_PASSWORD: optionalString(z.string().min(12)),
  ENCRYPTION_KEY: z.string().min(32),
  PASSWORD_RESET_DELIVERY_URL: optionalString(z.string().url()),
  PASSWORD_RESET_DELIVERY_SECRET: optionalString(z.string().min(24)),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
}).superRefine((value, ctx) => {
  if (Boolean(value.PASSWORD_RESET_DELIVERY_URL) !== Boolean(value.PASSWORD_RESET_DELIVERY_SECRET)) {
    ctx.addIssue({ code: "custom", message: "Password reset delivery URL and secret must be configured together.", path: ["PASSWORD_RESET_DELIVERY_URL"] });
  }
  if (value.PASSWORD_RESET_DELIVERY_URL && value.NODE_ENV === "production" && !value.PASSWORD_RESET_DELIVERY_URL.startsWith("https://")) {
    ctx.addIssue({ code: "custom", message: "Password reset delivery must use HTTPS in production.", path: ["PASSWORD_RESET_DELIVERY_URL"] });
  }
});

export const env = envSchema.parse({
  ...process.env,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
});
