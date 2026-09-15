import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/update-session";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/leads/:path*",
    "/agenda/:path*",
    "/catalogs/:path*",
    "/products/:path*",
    "/services/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/profile/:path*",
  ],
};
