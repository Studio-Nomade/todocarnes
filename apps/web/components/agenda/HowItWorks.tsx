import { AgendaIcon, type AgendaIconName } from "./AgendaIcon";
import { SectionHeading } from "./SiteChrome";

const items: { icon: AgendaIconName; title: string; text: string }[] = [
  { icon: "calendar", title: "Registra tu información", text: "Completa el formulario en menos de 2 minutos." },
  { icon: "check", title: "Recibe tu confirmación", text: "Te enviaremos un correo con todos los detalles." },
  { icon: "person", title: "Nos vemos en la feria", text: "Será un gusto mostrarte el stand en Food & Service 2026." },
];

export function HowItWorks() {
  return <section id="como-funciona" className="bg-blue-50"><div className="mx-auto max-w-6xl px-5 py-14 sm:px-8"><SectionHeading eyebrow="Por qué elegirnos" title="Así funciona">Un proceso simple para una reunión exitosa.</SectionHeading><div className="mt-8 grid gap-7 md:grid-cols-3">{items.map((item) => <article key={item.title} className="flex gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue/25 text-navy"><AgendaIcon name={item.icon} className="h-7 w-7"/></span><div><h3 className="font-bold text-navy">{item.title}</h3><p className="mt-1 text-sm leading-5 text-ink/65">{item.text}</p></div></article>)}</div></div></section>;
}
