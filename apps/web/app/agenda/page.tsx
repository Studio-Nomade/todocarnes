import type { Metadata } from "next";
import { AgendaClient } from "@/components/agenda/AgendaClient";
import { AgendaHero } from "@/components/agenda/AgendaHero";
import { SiteFooter, SiteHeader } from "@/components/agenda/SiteChrome";
import { getAgendaPageData } from "@/lib/agenda/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agenda Food & Service 2026 | Todo Carnes",
  description: "Reserva una reunión con el equipo comercial de Todo Carnes en Food & Service 2026.",
};

export default async function AgendaPage() {
  const data = await getAgendaPageData();
  return <main><SiteHeader/><AgendaHero/><AgendaClient data={data}/><SiteFooter/></main>;
}
