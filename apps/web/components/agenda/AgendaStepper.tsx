const steps = ["Selecciona día y horario", "Completa tus datos", "Revisa tu reserva", "¡Listo! Te esperamos"];

export function AgendaStepper({ current }: { current: number }) {
  return (
    <ol aria-label="Progreso de la reserva" className="mx-auto grid max-w-4xl grid-cols-4 px-4 py-8 sm:py-10">
      {steps.map((label, index) => {
        const number = index + 1;
        const active = number <= current;
        return <li key={label} className="relative flex flex-col items-center text-center"><span className={`relative z-10 grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-bold ${active ? "border-blue bg-blue text-navy" : "border-navy/35 bg-white text-navy"}`}>{number}</span>{index < steps.length - 1 && <span className={`absolute left-1/2 top-4 h-0.5 w-full ${number < current ? "bg-blue" : "bg-navy/15"}`}/>}<span className={`relative z-10 mt-2 max-w-28 bg-white px-1 text-[10px] font-semibold leading-4 sm:text-xs ${active ? "text-navy" : "text-ink/60"}`}>{label}</span></li>;
      })}
    </ol>
  );
}
