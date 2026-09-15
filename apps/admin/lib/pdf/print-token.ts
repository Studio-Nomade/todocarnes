import "server-only";
import { timingSafeEqual } from "node:crypto";

export function isValidPrintToken(token: string | string[] | undefined) {
  const expectedToken = process.env.PRINT_TOKEN;

  if (!expectedToken || typeof token !== "string" || token.length === 0) {
    return false;
  }

  const received = Buffer.from(token);
  const expected = Buffer.from(expectedToken);

  return received.length === expected.length && timingSafeEqual(received, expected);
}
