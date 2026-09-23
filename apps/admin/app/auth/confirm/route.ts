import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthRedirectOrigin } from "@/lib/auth/redirect-origin";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  const allowedPaths = new Set(["/nueva-clave"]);
  return value && allowedPaths.has(value) ? value : "/nueva-clave";
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const redirectOrigin = resolveAuthRedirectOrigin({
    appUrl: process.env.APP_URL,
    nodeEnv: process.env.NODE_ENV,
    requestUrl: request.url,
  });
  const supabase = await createClient();

  if (tokenHash && type === "recovery") {
    const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    if (!result.error) return NextResponse.redirect(new URL(next, redirectOrigin));
  } else if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    if (!result.error) return NextResponse.redirect(new URL(next, redirectOrigin));
  }

  return NextResponse.redirect(new URL("/login?error=enlace-vencido", redirectOrigin));
}
