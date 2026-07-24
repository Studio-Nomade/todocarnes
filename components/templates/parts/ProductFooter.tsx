type ProductFooterProps = {
  period?: string;
  pageNumber?: number;
};

export function ProductFooter({ period = "Julio 2026", pageNumber = 1 }: ProductFooterProps) {
  return (
    <footer className="absolute inset-x-[31px] bottom-0 flex h-[50px] items-center gap-5 bg-white pt-[13px]">
      <div className="shrink-0 whitespace-nowrap text-[15px] font-normal uppercase tracking-[0.32em] text-ink/65">
        Catálogo {period}
      </div>
      <div className="h-px min-w-0 flex-1 bg-ink/45" />
      <div className="shrink-0 text-[15px] font-semibold tracking-[0.18em] text-blue">
        {String(pageNumber).padStart(2, "0")}
      </div>
    </footer>
  );
}
