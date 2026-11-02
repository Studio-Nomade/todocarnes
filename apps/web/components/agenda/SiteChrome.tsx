import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue">{eyebrow}</p><h3 className="mt-2 font-display text-2xl text-navy sm:text-3xl">{title}</h3>{children && <p className="mt-2 text-sm text-ink/70 sm:text-base">{children}</p>}</div>;
}
