import Image from "next/image";
import { catalogPeriod } from "@/lib/catalogs/format";
import { CatalogPage } from "./CatalogPage";
import { ClientLogo } from "./parts/ClientLogo";

const packages = [
  { image: "/services/mockups/bolsa-vacio.webp", label: "Bolsa al vacío", logoWidth: "w-[48%]" },
  { image: "/services/mockups/bandeja-sellada.webp", label: "Bandeja sellada", logoWidth: "w-[34%]" },
  { image: "/services/mockups/caja-personalizada.webp", label: "Caja personalizada", logoWidth: "w-[58%]" },
] as const;

type CatalogPackagingProps = {
  clientLogoUrl?: string | null;
  clientName?: string | null;
  month: number;
  pageNumber: number;
  scale?: number;
  year: number;
};

export function CatalogPackaging({ clientLogoUrl, clientName, month, pageNumber, scale, year }: CatalogPackagingProps) {
  return (
    <CatalogPage id="maquila-envasados" scale={scale}>
      <div className="absolute inset-0 bg-navy" />
      <header className="absolute left-[105px] right-[105px] top-[70px] text-white">
        <p className="text-[17px] font-medium uppercase tracking-[0.4em] text-blue-mid">Servicio personalizado</p>
        <div className="mt-3 flex items-end justify-between gap-10">
          <h1 className="text-[64px] font-bold leading-none">Maquila de envasados</h1>
          {clientName ? <p className="pb-1 text-right text-[16px] font-light text-white/65">Propuesta para<br /><strong className="font-semibold text-white">{clientName}</strong></p> : null}
        </div>
        <p className="mt-4 max-w-[940px] text-[18px] font-light leading-7 text-white/65">
          Distintos formatos de presentación con la identidad de tu empresa, listos para comercializar.
        </p>
      </header>

      <div className="absolute left-[105px] right-[105px] top-[250px] grid grid-cols-3 gap-6">
        {packages.map((item) => (
          <article key={item.label}>
            <div className="relative h-[355px] overflow-hidden rounded-[24px] bg-white">
              <Image alt={item.label} className="object-cover" fill priority sizes="410px" src={item.image} />
              <ClientLogo
                className={`absolute left-1/2 top-1/2 h-[32%] -translate-x-1/2 -translate-y-1/2 ${item.logoWidth}`}
                clientName={clientName}
                logoUrl={clientLogoUrl}
              />
            </div>
            <h2 className="mt-4 text-center text-[19px] font-medium text-white">{item.label}</h2>
          </article>
        ))}
      </div>

      <footer className="absolute bottom-[34px] left-[105px] right-[105px] flex items-center justify-between border-t border-white/15 pt-5 text-[14px] font-light tracking-[0.18em] text-white/45">
        <span>CATÁLOGO {catalogPeriod(month, year).toUpperCase()}</span>
        <span>{String(pageNumber).padStart(2, "0")}</span>
      </footer>
    </CatalogPage>
  );
}
