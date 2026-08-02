import Image from "next/image";
import { catalogPeriod } from "@/lib/catalogs/format";
import type { CatalogService } from "@/lib/pdf/page-order";
import { CatalogPage } from "./CatalogPage";

type CatalogServicesProps = {
  month: number;
  pageNumber: number;
  scale?: number;
  services: CatalogService[];
  year: number;
};

export function CatalogServices({ month, pageNumber, scale, services, year }: CatalogServicesProps) {
  return (
    <CatalogPage id="servicios" scale={scale}>
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy to-blue" />

      <div className="absolute left-[44px] top-[32px] flex items-center gap-5">
        <Image alt="" className="h-[62px] w-[92px] object-contain" height={4500} priority src="/brand/isologo_completo.png" width={4501} />
        <span className="text-[28px] font-bold italic tracking-tight text-white">TodoCarnes</span>
      </div>

      <div className="absolute left-[114px] top-[181px] w-[760px] space-y-[38px]">
        {services.length > 0 ? services.slice(0, 5).map((service) => (
          <article className="grid min-h-[74px] grid-cols-[276px_1px_1fr] items-start" key={service.id}>
            <h2 className="pr-8 text-[21px] font-semibold leading-[1.25] text-blue-mid">{service.title}</h2>
            <span className="h-[64px] bg-white/75" />
            <p className="pl-11 text-[18px] font-light leading-[1.35] text-white/90">{service.description}</p>
          </article>
        )) : (
          <p className="text-[22px] font-light text-white/70">Los servicios comerciales se incorporarán en esta sección.</p>
        )}
      </div>

      <h1 className="absolute bottom-[112px] right-[78px] w-[340px] text-[55px] font-bold uppercase leading-[1.25] text-white">
        Nuestros<br />servicios
      </h1>

      <footer className="absolute bottom-[15px] left-[30px] right-[80px] flex items-center gap-4 text-[13px] font-light tracking-[0.28em] text-white">
        <span>CATÁLOGO {catalogPeriod(month, year).toUpperCase()}</span>
        <span className="h-px flex-1 bg-white/80" />
        <span>{String(pageNumber).padStart(2, "0")}</span>
      </footer>
    </CatalogPage>
  );
}
