const ACCESS_TOKEN_COOKIE = "accessToken";
const ROLE_COOKIE = "role";

function maxAgeSecondsForRole(role?: string) {
  return 60 * 60 * 24; // 24 hours for all sessions
}

export function setAuthCookies(params: {
  accessToken: string;
  role?: string;
}) {
  if (typeof document === "undefined") return;

  const maxAge = maxAgeSecondsForRole(params.role);

  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(
    params.accessToken,
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;

  if (params.role) {
    document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(
      params.role,
    )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  }
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;

  document.cookie = `${ACCESS_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
