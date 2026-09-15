export function FoodServiceBanner({ eventName }: { eventName: string }) {
  return (
    <section className="px-6 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-7 overflow-hidden rounded-3xl bg-navy p-8 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue">{eventName}</p><h2 className="mt-3 max-w-2xl text-3xl sm:text-4xl">Reunámonos en la feria.</h2><p className="mt-3 max-w-2xl leading-7 text-blue-50/80">Agenda una conversación con nuestro equipo o solicita una entrada de cortesía desde la experiencia Food Service.</p></div>
        <div className="flex flex-wrap gap-3"><a href="/agenda#reserva" className="rounded-full bg-blue px-6 py-3 text-sm font-bold text-navy">Agendar reunión</a><a href="/agenda#entrada-cortesia" className="rounded-full border border-white/70 px-6 py-3 text-sm font-bold text-white">Solicitar cortesía</a></div>
      </div>
    </section>
  );
}
