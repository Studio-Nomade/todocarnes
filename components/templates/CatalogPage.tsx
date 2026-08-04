import type { CSSProperties, ReactNode } from "react";

type CatalogPageProps = {
  children: ReactNode;
  id?: string;
  scale?: number;
};

export function CatalogPage({ children, id, scale = 1 }: CatalogPageProps) {
  const style: CSSProperties = {
    height: 810,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    width: 1440,
  };

  return (
    <section
      className="catalog-page relative overflow-hidden bg-white font-sans text-ink"
      id={id}
      style={style}
    >
      {children}
    </section>
  );
}
