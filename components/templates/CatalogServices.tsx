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
      <div className="absolute inset-0 bg-white" />
      <div className="absolute left-0 top-0 h-full w-[10px] bg-blue" />
      <header className="absolute left-[110px] right-[110px] top-[80px]">
        <p className="text-[18px] font-medium uppercase tracking-[0.4em] text-blue">Soluciones Todo Carnes</p>
        <h1 className="mt-3 text-[68px] font-bold leading-none text-navy">Servicios</h1>
        <p className="mt-4 max-w-[880px] text-[20px] font-light leading-8 text-ink/60">
          Capacidades pensadas para acompañar las necesidades comerciales y operativas de cada cliente.
        </p>
      </header>

      <div className="absolute left-[110px] right-[110px] top-[270px] grid grid-cols-2 gap-5">
        {services.length > 0 ? services.map((service, index) => (
          <article className="min-h-[125px] rounded-[22px] border border-ink/10 bg-gray-50 p-6" key={service.id}>
            <div className="flex items-start gap-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-[15px] font-semibold text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-[23px] font-semibold text-navy">{service.title}</h2>
                <p className="mt-2 text-[15px] font-light leading-6 text-ink/65">{service.description}</p>
              </div>
            </div>
          </article>
        )) : (
          <p className="col-span-2 rounded-[22px] border border-dashed border-ink/20 p-10 text-[20px] font-light text-ink/50">
            Los servicios comerciales se incorporarán en esta sección.
          </p>
        )}
      </div>

      <footer className="absolute bottom-[38px] left-[110px] right-[110px] flex items-center justify-between border-t border-ink/15 pt-5 text-[14px] font-light tracking-[0.18em] text-ink/50">
        <span>CATÁLOGO {catalogPeriod(month, year).toUpperCase()}</span>
        <span>{String(pageNumber).padStart(2, "0")}</span>
      </footer>
    </CatalogPage>
  );
}
