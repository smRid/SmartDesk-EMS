import type { Instrumentation } from "next";
import { logError, logInfo } from "@/lib/logger";

export function register() {
  logInfo("application.started", { runtime: process.env.NEXT_RUNTIME ?? "nodejs" });
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const digest = typeof error === "object" && error && "digest" in error
    ? String(error.digest)
    : undefined;
  logError("request.failed", {
    context: { routePath: context.routePath, routeType: context.routeType },
    digest,
    error,
    request: { method: request.method, path: request.path },
  });
};
