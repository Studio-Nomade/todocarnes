import type { PublicRepresentative } from "./types";

export function normalizeWhatsAppNumber(value: string | null) {
  if (!value) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 9) digits = `56${digits}`;
  return /^\d{10,15}$/.test(digits) ? digits : null;
}

export function buildWhatsAppHref({ representative, dayLabel, slotTime, customerName }: { representative: PublicRepresentative; dayLabel: string; slotTime: string | null; customerName?: string }) {
  const number = normalizeWhatsAppNumber(representative.whatsapp);
  if (!number) return null;
  const greeting = customerName?.trim() ? `Soy ${customerName.trim()}. ` : "";
  const tentative = slotTime ? ` Me interesa el ${dayLabel} a las ${slotTime.slice(0, 5)}.` : "";
  const message = `Hola ${representative.name}. ${greeting}Quisiera agendar una reunión con el área ${representative.areaLabel} en Food & Service 2026.${tentative}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
