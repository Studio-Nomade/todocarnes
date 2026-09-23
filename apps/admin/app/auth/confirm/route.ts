import { NextResponse, type NextRequest } from "next/server";
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
  const supabase = await createClient();

  if (tokenHash && type === "recovery") {
    const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    if (!result.error) return NextResponse.redirect(new URL(next, request.url));
  } else if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    if (!result.error) return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.redirect(new URL("/login?error=enlace-vencido", request.url));
}
