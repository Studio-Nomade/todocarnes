import Image from "next/image";
import { BRANDS, type Brand } from "@/lib/landing/brands";

function BrandItem({ brand, duplicate }: { brand: Brand; duplicate: boolean }) {
  const logo = <Image src={`/landing/brands/${brand.slug}.webp`} alt={duplicate ? "" : brand.name} width={144} height={56} className="h-14 w-36 object-contain" />;
  const box = "flex shrink-0 items-center justify-center rounded-lg px-2 py-1";

  if (!brand.url) return <div className={box}>{logo}</div>;
  return (
    <a
      href={brand.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={duplicate ? undefined : `Sitio de ${brand.name} (se abre en otra pestaña)`}
      tabIndex={duplicate ? -1 : undefined}
      className={`${box} transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700`}
    >
      {logo}
    </a>
  );
}

/**
 * Franja de marcas en loop continuo. La pista se duplica y se desplaza -50% para que el ciclo no tenga
 * cortes; se pausa al pasar el mouse o al enfocar un logo. Con "reducir movimiento" queda estática.
 */
export function BrandCarousel() {
  return (
    <section aria-label="Marcas con las que trabajamos" className="brand-marquee overflow-hidden bg-blue-50 py-6">
      <div className="brand-marquee-track flex w-max items-center gap-16 px-8 motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-x-10 motion-reduce:gap-y-4">
        {BRANDS.map((brand) => <BrandItem key={brand.slug} brand={brand} duplicate={false} />)}
        <div aria-hidden="true" className="flex items-center gap-16 motion-reduce:hidden">
          {BRANDS.map((brand) => <BrandItem key={`${brand.slug}-copy`} brand={brand} duplicate />)}
        </div>
      </div>
    </section>
  );
}
