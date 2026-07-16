import type { CSSProperties, ReactNode } from "react";

type CatalogPageProps = {
  children: ReactNode;
  scale?: number;
};

export function CatalogPage({ children, scale = 1 }: CatalogPageProps) {
  const style: CSSProperties = {
    height: 810,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    width: 1440,
  };

  return (
    <section
      className="catalog-page relative overflow-hidden bg-white font-sans text-ink"
      style={style}
    >
      {children}
    </section>
  );
}
