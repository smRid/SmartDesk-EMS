import "server-only";

import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { departments, employees, users } from "@/db/schema";
import { SESSION_COOKIE_NAME, type UserRole } from "@/lib/constants";
import { env } from "@/lib/env";

type SessionPayload = {
  role: UserRole;
  sub: string;
};

export type SessionUser = {
  departmentName: string | null;
  designation: string | null;
  email: string;
  employeeCode: string | null;
  employeeRecordId: string | null;
  id: string;
  imageUrl: string | null;
  isActive: boolean;
  name: string;
  role: UserRole;
};

const secret = new TextEncoder().encode(env.NEXTAUTH_SECRET);

async function signToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

async function verifyToken(token: string) {
  const { payload } = await jwtVerify<SessionPayload>(token, secret);
  return payload;
}

export function getDashboardRedirect(role: UserRole) {
  return role === "admin" ? "/admin/dashboard" : "/employee/dashboard";
}

export async function createSession(user: { id: string; role: UserRole }) {
  const token = await signToken({
    role: user.role,
    sub: user.id,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export const getCurrentSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyToken(token);

    const [record] = await db
      .select({
        department: departments,
        employee: employees,
        user: users,
      })
      .from(users)
      .leftJoin(employees, eq(employees.userId, users.id))
      .leftJoin(departments, eq(employees.departmentId, departments.id))
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!record || !record.user.isActive) {
      return null;
    }

    return {
      departmentName: record.department?.name ?? null,
      designation: record.employee?.designation ?? null,
      email: record.user.email,
      employeeCode: record.employee?.employeeId ?? record.user.employeeId ?? null,
      employeeRecordId: record.employee?.id ?? null,
      id: record.user.id,
      imageUrl: record.employee?.imageUrl ?? null,
      isActive: record.user.isActive,
      name: record.user.name,
      role: record.user.role,
    };
  } catch {
    return null;
  }
});

export async function requireAuth(role?: UserRole) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (role && session.role !== role) {
    redirect("/forbidden");
  }

  return session;
}
