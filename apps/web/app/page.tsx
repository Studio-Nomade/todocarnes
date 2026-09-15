import type { Metadata } from "next";
import { Suspense } from "react";
import { Capacity } from "@/components/landing/Capacity";
import { CommercialAreas } from "@/components/landing/CommercialAreas";
import { CommercialTeam } from "@/components/landing/CommercialTeam";
import { LandingContactForm } from "@/components/landing/LandingContactForm";
import { DonPancho } from "@/components/landing/DonPancho";
import { FoodServiceBanner } from "@/components/landing/FoodServiceBanner";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { OperationsTabs } from "@/components/landing/OperationsTabs";
import { ProcessSteps } from "@/components/landing/ProcessSteps";
import { ProcessMedia } from "@/components/landing/ProcessMedia";
import { Solutions } from "@/components/landing/Solutions";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { getAgendaPageData } from "@/lib/agenda/data";
import { getPublicRepresentatives } from "@/lib/public-representatives";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Todo Carnes | Soluciones cárnicas B2B",
  description: "Más de 70 años desarrollando soluciones cárnicas para la industria alimentaria en Chile.",
  alternates: { canonical: "/" },
  openGraph: { title: "Todo Carnes — Más que carne", description: "Soluciones para abastecer, producir y vender mejor.", url: "/" },
};

async function PublicCommercialTeam() {
  const team = await getPublicRepresentatives();
  return <CommercialTeam representatives={team.representatives} />;
}

async function PublicContactForm() {
  const team = await getPublicRepresentatives();
  return <LandingContactForm configured={team.configured} />;
}

async function PublicFoodServiceBanner() {
  const data = await getAgendaPageData();
  return <FoodServiceBanner eventName={data.event.name} />;
}

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <LandingHeader />
      <main id="contenido">
        <LandingHero />
        <CommercialAreas />
        <DonPancho />
        <Solutions />
        <ProcessMedia />
        <OperationsTabs />
        <Capacity />
        <Suspense fallback={<div className="min-h-96 bg-gray-50" aria-label="Cargando equipo comercial" />}><PublicCommercialTeam /></Suspense>
        <ProcessSteps />
        <Suspense fallback={<div className="min-h-64" aria-label="Cargando evento Food Service" />}><PublicFoodServiceBanner /></Suspense>
        <Suspense fallback={<div className="min-h-96 bg-blue-50" aria-label="Cargando formulario de contacto" />}><PublicContactForm /></Suspense>
      </main>
      <LandingFooter />
    </>
  );
}
