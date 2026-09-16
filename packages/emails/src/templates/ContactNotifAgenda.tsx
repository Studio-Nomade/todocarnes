import { InternalNotification } from "./InternalNotification";

export type ContactNotifAgendaProps = {
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  area?: string | null;
  message?: string | null;
  representativeName?: string | null;
  logoUrl?: string;
};

export function ContactNotifAgenda(props: ContactNotifAgendaProps) {
  return (
    <InternalNotification
      logoUrl={props.logoUrl}
      preview={`Nuevo contacto desde agenda: ${props.name}`}
      title="Nuevo contacto desde la agenda"
      rows={[
        { label: "Nombre", value: props.name },
        { label: "Empresa", value: props.company },
        { label: "Correo", value: props.email },
        { label: "Teléfono", value: props.phone },
        { label: "Área", value: props.area },
        { label: "Representante", value: props.representativeName },
        { label: "Mensaje", value: props.message },
        { label: "Origen", value: "Agenda Food & Service 2026" },
      ]}
    />
  );
}
