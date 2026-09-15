import { Capacity } from "@/components/landing/Capacity";
import { CommercialAreas } from "@/components/landing/CommercialAreas";
import { CommercialTeam } from "@/components/landing/CommercialTeam";
import { ContactPreview } from "@/components/landing/ContactPreview";
import { CustomSolutions } from "@/components/landing/CustomSolutions";
import { DonPancho } from "@/components/landing/DonPancho";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { OperationsTabs } from "@/components/landing/OperationsTabs";
import { ProcessSteps } from "@/components/landing/ProcessSteps";
import { Solutions } from "@/components/landing/Solutions";
import { getPublicRepresentatives } from "@/lib/public-representatives";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const team = await getPublicRepresentatives();
  return (
    <>
      <LandingHeader />
      <main>
        <LandingHero />
        <CommercialAreas />
        <CommercialTeam {...team} />
        <OperationsTabs />
        <Solutions />
        <Capacity />
        <CustomSolutions />
        <DonPancho />
        <ProcessSteps />
        <ContactPreview />
      </main>
      <LandingFooter />
    </>
  );
}
