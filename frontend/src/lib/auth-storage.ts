const ACCESS_TOKEN_KEY = "devscribe_access_token";
const ACCESS_TOKEN_EXPIRY_KEY = "devscribe_access_token_expiry";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const expiryRaw = window.localStorage.getItem(ACCESS_TOKEN_EXPIRY_KEY);
  const expiry = expiryRaw ? Number(expiryRaw) : null;
  if (expiry && Date.now() >= expiry) {
    clearAccessToken();
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string, expiresInMs?: number): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  if (typeof expiresInMs === "number") {
    window.localStorage.setItem(
      ACCESS_TOKEN_EXPIRY_KEY,
      String(Date.now() + expiresInMs),
    );
  }

  const maxAge =
    typeof expiresInMs === "number" ? Math.floor(expiresInMs / 1000) : 3600;
  document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function clearAccessToken(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_EXPIRY_KEY);
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
}
