import type { Metadata } from "next";
import { AgendaClient } from "@/components/agenda/AgendaClient";
import { AgendaHero } from "@/components/agenda/AgendaHero";
import { CourtesyRequestForm } from "@/components/agenda/CourtesyRequestForm";
import { SiteFooter, SiteHeader } from "@/components/agenda/SiteChrome";
import { getAgendaPageData } from "@/lib/agenda/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agenda Food & Service 2026",
  description: "Reserva una reunión con el equipo comercial de Todo Carnes en Food & Service 2026.",
  alternates: { canonical: "/agenda" },
  openGraph: { title: "Agenda Food & Service 2026 | Todo Carnes", description: "Reserva una reunión con nuestro equipo comercial durante la feria.", url: "/agenda" },
};

export default async function AgendaPage() {
  const data = await getAgendaPageData();
  return <main id="contenido"><SiteHeader/><AgendaHero/><CourtesyRequestForm eventId={data.event.id} configured={data.courtesyConfigured}/><AgendaClient data={data}/><SiteFooter/></main>;
}
