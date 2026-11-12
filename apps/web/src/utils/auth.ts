const STORAGE_KEY = "map-gallery:adminToken";

export function getAdminToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

function setAdminToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
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
export async function ensureAdminToken(): Promise<boolean> {
  if (await checkToken(getAdminToken() ?? "")) {
    return true;
  }

  const input = window.prompt("請輸入管理碼");

  if (!input?.trim()) {
    return false;
  }

  if (await checkToken(input.trim())) {
    setAdminToken(input.trim());
    return true;
  }

  window.alert("管理碼錯誤");
  return false;
}
