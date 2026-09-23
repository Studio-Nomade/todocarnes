import { courtesyRequestsCsv } from "@/lib/courtesy/csv";
import { listAllCourtesyRequests } from "@/lib/courtesy/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const requests = await listAllCourtesyRequests();
  const date = new Date().toISOString().slice(0, 10);
  const filename = `solicitudes-cortesia-${date}.csv`;

  return new Response(courtesyRequestsCsv(requests), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
