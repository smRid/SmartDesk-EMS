import { z } from "zod";

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
  ENCRYPTION_KEY: z.string().min(32),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse({
  ...process.env,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
});
