import { InternalNotification } from "./InternalNotification";

export type ContactNotifLandingProps = {
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  area?: string | null;
  message?: string | null;
  representativeName?: string | null;
  logoUrl?: string;
};

export function ContactNotifLanding(props: ContactNotifLandingProps) {
  return (
    <InternalNotification
      logoUrl={props.logoUrl}
      preview={`Nuevo contacto desde landing: ${props.name}`}
      title="Nuevo contacto desde la landing"
      rows={[
        { label: "Nombre", value: props.name },
        { label: "Empresa", value: props.company },
        { label: "Correo", value: props.email },
        { label: "Teléfono", value: props.phone },
        { label: "Área", value: props.area },
        { label: "Representante", value: props.representativeName },
        { label: "Mensaje", value: props.message },
        { label: "Origen", value: "Landing Todo Carnes" },
      ]}
    />
  );
}
