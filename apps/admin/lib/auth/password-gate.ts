export function mustRedirectToPasswordChange({
  allowPasswordChangeRequired = false,
  mustChangePassword,
  pathname,
}: {
  allowPasswordChangeRequired?: boolean;
  mustChangePassword: boolean;
  pathname: string | null;
}) {
  if (!mustChangePassword || allowPasswordChangeRequired || !pathname) return false;
  return pathname !== "/profile" && !pathname.startsWith("/profile/");
}
