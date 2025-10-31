export interface PortalTokenPayload {
  sub?: string;
  portal?: string;
  role?: string;
  name?: string;
  exp?: number;
}

export function decodeToken(token: string | null): PortalTokenPayload | null {
  if (!token) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(parts[1])) as PortalTokenPayload;
    return payload;
  } catch {
    return null;
  }
}

export function isTokenValidForPortal(token: string | null, expectedPortal: string): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp || payload.portal !== expectedPortal) {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp > nowSeconds;
}

