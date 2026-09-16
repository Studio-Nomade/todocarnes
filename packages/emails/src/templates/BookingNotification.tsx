import { InternalNotification } from "./InternalNotification";

export type BookingNotificationProps = {
  name: string;
  company?: string | null;
  cargo?: string | null;
  email: string;
  phone?: string | null;
  area?: string | null;
  representativeName?: string | null;
  eventName: string;
  dateLabel: string;
  timeLabel: string;
  durationMinutes: number;
  location: string;
  topics?: string | null;
  cameFrom?: string | null;
  logoUrl?: string;
};

export function BookingNotification(props: BookingNotificationProps) {
  return (
    <InternalNotification
      logoUrl={props.logoUrl}
      preview={`Nueva reunión: ${props.name}`}
      title="Nueva reunión agendada"
      rows={[
        { label: "Nombre", value: props.name },
        { label: "Empresa", value: props.company },
        { label: "Cargo", value: props.cargo },
        { label: "Correo", value: props.email },
        { label: "Teléfono", value: props.phone },
        { label: "Área", value: props.area },
        { label: "Representante", value: props.representativeName },
        { label: "Evento", value: props.eventName },
        { label: "Fecha", value: props.dateLabel },
        { label: "Hora", value: props.timeLabel },
        { label: "Duración", value: `${props.durationMinutes} minutos` },
        { label: "Lugar / stand", value: props.location },
        { label: "Temas", value: props.topics },
        { label: "Cómo llegó", value: props.cameFrom },
      ]}
    />
  );
}
