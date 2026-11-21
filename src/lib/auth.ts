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
import { isSessionVersionCurrent } from "@/lib/authorization";

type SessionPayload = {
  role: UserRole;
  sub: string;
  sv: number;
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
    .setIssuer("smartdesk-ems")
    .setAudience("smartdesk-ems")
    .setExpirationTime("7d")
    .sign(secret);
}

async function verifyToken(token: string) {
  const { payload } = await jwtVerify<SessionPayload>(token, secret, {
    algorithms: ["HS256"], audience: "smartdesk-ems", issuer: "smartdesk-ems",
  });
  return payload;
}

export function getDashboardRedirect(role: UserRole) {
  return role === "admin" ? "/admin/dashboard" : "/employee/dashboard";
}

export async function createSession(user: { id: string; role: UserRole; sessionVersion: number }) {
  const token = await signToken({
    role: user.role,
    sub: user.id,
    sv: user.sessionVersion,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    priority: "high",
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
        departmentName: departments.name,
        designation: employees.designation,
        email: users.email,
        employeeCode: employees.employeeId,
        employeeRecordId: employees.id,
        id: users.id,
        imageUrl: employees.imageUrl,
        isActive: users.isActive,
        name: users.name,
        role: users.role,
        sessionVersion: users.sessionVersion,
        userEmployeeCode: users.employeeId,
      })
      .from(users)
      .leftJoin(employees, eq(employees.userId, users.id))
      .leftJoin(departments, eq(employees.departmentId, departments.id))
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!record || !isSessionVersionCurrent(payload.sv, record.sessionVersion, record.isActive)) {
      return null;
    }

    return {
      departmentName: record.departmentName ?? null,
      designation: record.designation ?? null,
      email: record.email,
      employeeCode: record.employeeCode ?? record.userEmployeeCode ?? null,
      employeeRecordId: record.employeeRecordId ?? null,
      id: record.id,
      imageUrl: record.imageUrl ?? null,
      isActive: record.isActive,
      name: record.name,
      role: record.role,
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
