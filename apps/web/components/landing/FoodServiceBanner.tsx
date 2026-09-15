import Image from "next/image";

export function FoodServiceBanner({ eventName }: { eventName: string }) {
  return (
    <section className="px-6 py-14 sm:px-8 lg:py-20">
      <div className="relative mx-auto min-h-[430px] max-w-7xl overflow-hidden rounded-3xl text-white">
        <Image src="/agenda/hero-stand.jpg" alt="Equipo Todo Carnes conversando en Food & Service" fill sizes="100vw" className="object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/10"/>
        <div className="relative flex min-h-[430px] max-w-3xl flex-col justify-end p-8 sm:p-12"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue">{eventName}</p><h2 className="mt-3 max-w-2xl text-3xl sm:text-4xl">Reunámonos en la feria.</h2><p className="mt-3 max-w-2xl leading-7 text-blue-50/90">Agenda una conversación con nuestro equipo o solicita una entrada de cortesía desde la experiencia Food Service.</p><div className="mt-6 flex flex-wrap gap-3"><a href="/agenda#reserva" className="rounded-full bg-blue px-6 py-3 text-sm font-bold text-navy">Agendar reunión</a><a href="/agenda#entrada-cortesia" className="rounded-full border border-white/70 px-6 py-3 text-sm font-bold text-white">Solicitar cortesía</a></div></div>
      </div>
    </section>
  );
}
