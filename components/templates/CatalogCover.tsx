import Image from "next/image";
import { catalogPeriod } from "@/lib/catalogs/format";
import { CatalogPage } from "./CatalogPage";

type CatalogCoverProps = {
  title: string;
  month: number;
  year: number;
  scale?: number;
};

export function CatalogCover({ title, month, year, scale }: CatalogCoverProps) {
  return (
    <CatalogPage scale={scale}>
      <div className="absolute inset-0 bg-navy" />
      {/* Elementos gráficos de fondo — provisorios hasta que llegue el arte de portada */}
      <div className="absolute -right-40 -top-40 h-[720px] w-[720px] rounded-full bg-blue/10" />
      <div className="absolute -bottom-52 -left-24 h-[560px] w-[560px] rounded-full bg-blue/10" />
      <div className="absolute right-[120px] top-[150px] h-[420px] w-[420px] rotate-6 rounded-[64px] border border-blue/20" />

      <div className="absolute left-[120px] top-[150px] flex items-center gap-6">
        <Image alt="Todo Carnes" height={4500} priority src="/brand/isologo_blanco.png" width={4501} className="h-24 w-24 object-contain" />
        <span className="text-4xl font-bold italic tracking-tight text-white">TodoCarnes</span>
      </div>

      <div className="absolute bottom-[190px] left-[120px] right-[120px]">
        <p className="text-[22px] font-medium uppercase tracking-[0.4em] text-blue">Catálogo comercial</p>
        <h1 className="mt-6 max-w-[900px] text-[92px] font-bold leading-[0.98] text-white">{title}</h1>
        <p className="mt-8 text-[34px] font-light uppercase tracking-[0.3em] text-blue-mid">{catalogPeriod(month, year)}</p>
      </div>

      <div className="absolute bottom-[70px] left-[120px] right-[120px] flex items-center justify-between border-t border-white/15 pt-6 text-[16px] font-light tracking-[0.2em] text-white/60">
        <span>TODO CARNES · DISTRIBUCIÓN DE CARNES CONGELADAS</span>
        <span>{catalogPeriod(month, year).toUpperCase()}</span>
      </div>
    </CatalogPage>
  );
}
