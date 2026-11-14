import type { Dialogs } from "../hooks/useDialogs";

const STORAGE_KEY = "map-gallery:adminToken";

let cachedToken: string | null | undefined;

export function getAdminToken(): string | null {
  if (cachedToken === undefined) {
    try {
      cachedToken = localStorage.getItem(STORAGE_KEY);
    } catch {
      cachedToken = null;
    }
  }
  return cachedToken;
}

function setAdminToken(token: string): void {
  cachedToken = token;
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Storage unavailable; the token still applies to this session.
  }
}

async function checkToken(token: string): Promise<boolean> {
  const response = await fetch("/api/v1/auth/check", {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);

  return response?.status === 204;
}

/**
 * Returns true when writes are allowed: the API is in open dev mode, or a
 * stored/freshly-entered token validates. Prompts for the token when needed.
 */
export async function ensureAdminToken(
  dialogs: Dialogs,
): Promise<boolean> {
  if (await checkToken(getAdminToken() ?? "")) {
    return true;
  }

  const input = await dialogs.prompt("請輸入管理碼");

  if (!input) {
    return false;
  }

  if (await checkToken(input)) {
    setAdminToken(input);
    return true;
  }

  await dialogs.alert("管理碼錯誤");
  return false;
}
