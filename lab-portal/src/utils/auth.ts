export interface PortalTokenPayload {
  sub?: string;
  portal?: string;
  role?: string;
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
    return JSON.parse(atob(parts[1])) as PortalTokenPayload;
  } catch {
    return null;
  }
}

export function isTokenValidForPortal(token: string | null, expectedPortal: string): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp || payload.portal !== expectedPortal) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}

