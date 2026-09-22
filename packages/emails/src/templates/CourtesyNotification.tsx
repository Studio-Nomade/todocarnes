import { InternalNotification } from "./InternalNotification";

export type CourtesyNotificationProps = {
  name: string;
  lastName: string;
  rut: string;
  company: string;
  cargo: string;
  email: string;
  phone: string;
  eventName: string;
  eventLocation: string;
  logoUrl?: string;
};

export function CourtesyNotification(props: CourtesyNotificationProps) {
  return (
    <InternalNotification
      logoUrl={props.logoUrl}
      preview={`Nueva solicitud de cortesía: ${props.name}`}
      title="Nueva solicitud de entrada de cortesía"
      rows={[
        { label: "Nombre", value: `${props.name} ${props.lastName}`.trim() },
        { label: "RUT", value: props.rut },
        { label: "Empresa", value: props.company },
        { label: "Cargo", value: props.cargo },
        { label: "Correo", value: props.email },
        { label: "Teléfono", value: props.phone },
        { label: "Evento", value: props.eventName },
        { label: "Lugar / stand", value: props.eventLocation },
      ]}
    />
  );
}
