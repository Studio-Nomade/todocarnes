import Image from "next/image";

export const HEAD_OFFICE_ADDRESS = "San Fernando 750, San Bernardo";

type EmailSignatureProps = {
  email: string;
  jobTitle: string;
  name: string;
  phone: string;
};

export function EmailSignature({
  email,
  jobTitle,
  name,
  phone,
}: EmailSignatureProps) {
  return (
    <div
      aria-label={`Firma de correo de ${name || "usuario"}`}
      className="flex min-w-[470px] items-center gap-5 bg-white px-5 py-4 text-left text-[#0a0a0a]"
    >
      <div className="flex w-44 shrink-0 justify-center">
        <Image
          alt="Todo Carnes"
          className="h-28 w-40 object-contain"
          height={4500}
          src="/brand/logo_completo.png"
          width={4500}
        />
      </div>
      <div className="min-h-28 border-l-4 border-[#477fe5] pl-5">
        <p className="text-lg font-bold leading-6">{name || "Nombre y apellido"}</p>
        <p className="text-base leading-6">{jobTitle || "Cargo"}</p>
        <SignatureLine icon="mail" value={email || "correo@tdcarnes.cl"} />
        <SignatureLine icon="phone" value={phone || "+56 9 0000 0000"} />
        <p className="text-sm leading-5">{HEAD_OFFICE_ADDRESS}</p>
      </div>
    </div>
  );
}

function SignatureLine({ icon, value }: { icon: "mail" | "phone"; value: string }) {
  return (
    <p className="flex items-center gap-2 text-sm leading-5">
      <svg
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-[#1688f4]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        {icon === "mail" ? (
          <path d="M3 5.5h18v13H3z M3.5 6l8.5 7 8.5-7" />
        ) : (
          <path d="M7 3l3 4-2 2c1.5 3 3.5 5 6.5 6.5l2-2 4 3c-1 3-3 4.5-5.5 4C9 19 5 15 3.5 9 3 6.5 4 4 7 3z" />
        )}
      </svg>
      {value}
    </p>
  );
}
