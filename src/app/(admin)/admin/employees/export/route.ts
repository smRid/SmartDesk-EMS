import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getEmployeesList } from "@/lib/queries";
import { checkRateLimit } from "@/lib/rate-limit";

const csv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET(request: Request) {
  const session = await requireAuth("admin");
  const limit = checkRateLimit(`employee-export:${session.id}`, { limit: 3, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json({ message: "Export limit reached. Try again shortly." }, {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter ?? 60) },
    });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const departmentId = url.searchParams.get("department") ?? "all";
  const status = url.searchParams.get("status") ?? "all";
  const requestedSort = url.searchParams.get("sort") ?? "newest";
  const sort = ["newest", "oldest", "name-asc", "name-desc"].includes(requestedSort)
    ? requestedSort as "newest" | "oldest" | "name-asc" | "name-desc"
    : "newest";
  const first = await getEmployeesList({ departmentId, page: 1, pageSize: 50, query, sort, status });
  const pages = await Promise.all(Array.from({ length: Math.min(first.totalPages, 100) - 1 }, (_, index) =>
    getEmployeesList({ departmentId, page: index + 2, pageSize: 50, query, sort, status })));
  const items = [first, ...pages].flatMap((page) => page.items);
  const body = [
    ["Employee ID", "Name", "Department", "Designation", "Status", "Active"].map(csv).join(","),
    ...items.map((item) => [item.employeeCode, item.name, item.departmentName, item.designation, item.status, item.isActive ? "Yes" : "No"].map(csv).join(",")),
  ].join("\r\n");

  return new NextResponse(body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="employees-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
