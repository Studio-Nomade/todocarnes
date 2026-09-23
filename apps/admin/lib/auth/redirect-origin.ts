const PRODUCTION_ADMIN_ORIGIN = "https://admin.todocarnes.cl";

function isLoopback(url: URL) {
  return url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]";
}

export function resolveAuthRedirectOrigin({
  appUrl,
  nodeEnv,
  requestUrl,
}: {
  appUrl?: string;
  nodeEnv?: string;
  requestUrl: string;
}) {
  const configuredUrl = appUrl?.trim();

  if (configuredUrl) {
    const configuredOrigin = new URL(configuredUrl);
    if (nodeEnv !== "production" || !isLoopback(configuredOrigin)) return configuredOrigin.origin;
  }

  if (nodeEnv === "production") return PRODUCTION_ADMIN_ORIGIN;

  return new URL(requestUrl).origin;
}
