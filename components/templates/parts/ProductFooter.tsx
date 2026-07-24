type ProductFooterProps = {
  period?: string;
  pageNumber?: number;
};

export function ProductFooter({ period = "Julio 2026", pageNumber = 1 }: ProductFooterProps) {
  return (
    <footer className="absolute inset-x-0 bottom-0 h-[50px] bg-white">
      <div className="absolute left-[31px] top-[26px] text-[15px] font-normal uppercase tracking-[0.38em] text-ink/65">
        Catálogo {period}
      </div>
      <div className="absolute left-[278px] right-[80px] top-[29px] h-px bg-ink/45" />
      <div className="absolute right-[35px] top-[21px] text-[15px] font-semibold tracking-[0.18em] text-blue">
        {String(pageNumber).padStart(2, "0")}
      </div>
    </footer>
  );
}
