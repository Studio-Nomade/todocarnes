type CutsNavProps = {
  cuts: string[];
  activeCut: string;
};

export function CutsNav({ cuts, activeCut }: CutsNavProps) {
  return (
    <nav aria-label="Cortes" className="absolute left-[815px] top-[122px] flex h-[33px] w-[625px] items-center justify-start gap-[23px] overflow-hidden bg-blue-50 px-[30px] text-[12px]">
      {cuts.map((cut) => (
        <span className={cut === activeCut ? "font-semibold text-navy" : "font-light text-ink"} key={cut}>
          {cut}
        </span>
      ))}
    </nav>
  );
}
