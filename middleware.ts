import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

function redirectToLogin(request: NextRequest) {
  const url = new URL("/login", request.url);
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isProtected = pathname.startsWith("/admin") || pathname.startsWith("/employee");

  if (!token) {
    if (isProtected) {
      return redirectToLogin(request);
    }

    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "");
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string | undefined;

    if (pathname === "/login") {
      const destination =
        role === "admin" ? "/admin/dashboard" : "/employee/dashboard";
      return NextResponse.redirect(new URL(destination, request.url));
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }

    if (pathname.startsWith("/employee") && role !== "employee") {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }

    return NextResponse.next();
  } catch {
    const response = isProtected ? redirectToLogin(request) : NextResponse.next();
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
