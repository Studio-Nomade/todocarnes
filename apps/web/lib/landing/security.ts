import { createHash } from "node:crypto";

export const LANDING_RATE_LIMIT = 3;
export const LANDING_RATE_WINDOW_MS = 60 * 60 * 1000;

export function hashRequestIp(ip: string | null) {
  if (!ip) return null;
  const salt = process.env.LANDING_RATE_LIMIT_SALT ?? "todocarnes-landing-rate-limit";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function firstForwardedIp(forwardedFor: string | null, realIp: string | null) {
  return forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || null;
}
