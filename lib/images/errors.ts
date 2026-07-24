const DEFAULT_MESSAGE = "No se pudo generar la imagen. Probá de nuevo o avisá al administrador.";

type ErrorDetails = {
  code: string;
  message: string;
  name: string;
  requestId: string;
  status: number | null;
  type: string;
};

function stringProperty(value: object, key: string): string {
  const property = Reflect.get(value, key);
  return typeof property === "string" ? property : "";
}

function numberProperty(value: object, key: string): number | null {
  const property = Reflect.get(value, key);
  return typeof property === "number" ? property : null;
}

function errorDetails(error: unknown): ErrorDetails {
  if (!(error instanceof Object)) {
    return {
      code: "",
      message: String(error),
      name: "",
      requestId: "",
      status: null,
      type: "",
    };
  }

  return {
    code: stringProperty(error, "code"),
    message: stringProperty(error, "message"),
    name: stringProperty(error, "name"),
    requestId: stringProperty(error, "request_id"),
    status: numberProperty(error, "status"),
    type: stringProperty(error, "type"),
  };
}

export class ImageGenerationError extends Error {
  readonly logMessage: string;
  readonly model: string;

  constructor(message: string, logMessage: string, model = "gpt-image-1") {
    super(message);
    this.name = "ImageGenerationError";
    this.logMessage = logMessage;
    this.model = model;
  }
}

export function humanizeOpenAIError(error: unknown): string {
  const details = errorDetails(error);
  const searchable = `${details.code} ${details.type} ${details.name} ${details.message}`.toLowerCase();

  if (
    searchable.includes("insufficient_quota") ||
    searchable.includes("billing_hard_limit") ||
    searchable.includes("credit balance") ||
    searchable.includes("billing quota")
  ) {
    return "No hay crédito disponible para generar imágenes. Avisá al administrador.";
  }

  if (
    searchable.includes("organization") &&
    (searchable.includes("verif") || searchable.includes("not enabled"))
  ) {
    return "La cuenta de OpenAI no está habilitada para generar imágenes.";
  }

  if (
    searchable.includes("timeout") ||
    searchable.includes("timed out") ||
    searchable.includes("connection timeout")
  ) {
    return "La generación tardó demasiado. Probá de nuevo.";
  }

  if (
    searchable.includes("moderation") ||
    searchable.includes("safety") ||
    searchable.includes("content_policy") ||
    searchable.includes("content policy")
  ) {
    return "OpenAI rechazó esta generación. Probá con otra imagen fuente.";
  }

  return DEFAULT_MESSAGE;
}

export function openAIErrorLog(error: unknown): string {
  const details = errorDetails(error);
  return JSON.stringify({
    code: details.code || null,
    message: details.message || String(error),
    name: details.name || null,
    request_id: details.requestId || null,
    status: details.status,
    type: details.type || null,
  });
}
