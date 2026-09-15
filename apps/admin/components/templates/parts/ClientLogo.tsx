import Image from "next/image";

type ClientLogoProps = {
  clientName?: string | null;
  className?: string;
  logoUrl?: string | null;
};

export function ClientLogo({ clientName, className = "", logoUrl }: ClientLogoProps) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {logoUrl ? (
        <Image
          alt={`Logo de ${clientName || "cliente"}`}
          className="object-contain p-[8%]"
          fill
          priority
          sizes="320px"
          src={logoUrl}
        />
      ) : (
        <span className="text-center text-[16px] font-semibold uppercase tracking-[0.14em] text-navy/45">
          Tu logo aquí
        </span>
      )}
    </div>
  );
}
