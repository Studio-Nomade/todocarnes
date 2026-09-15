import type { SVGProps } from "react";

export type AgendaIconName = "calendar" | "check" | "clock" | "location" | "person" | "whatsapp";

export function AgendaIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: AgendaIconName }) {
  const common = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.8 };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props} {...common}>
      {name === "calendar" && <><path d="M6 3v3M18 3v3M4 9h16"/><rect x="3" y="5" width="18" height="16" rx="2"/></>}
      {name === "check" && <path d="m5 12 4 4L19 6"/>}
      {name === "clock" && <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>}
      {name === "location" && <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>}
      {name === "person" && <><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></>}
      {name === "whatsapp" && <><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.5Z"/><path d="M9 8.5c.5 2 2 3.5 4 4l1.2-1 2 1.2c-.6 2.2-2.1 2.5-4.8 1.2-2.5-1.2-4.3-3.7-4-5.5.2-1 .8-1.6 1.6-1.8Z"/></>}
    </svg>
  );
}
