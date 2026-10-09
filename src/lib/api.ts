import { NextResponse } from "next/server";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Logs an error without leaking user input or secrets. */
export function logServerError(scope: string, err: unknown) {
  const message = err instanceof Error ? err.message : "unknown error";
  console.error(`[${scope}] ${message.slice(0, 200)}`);
}
