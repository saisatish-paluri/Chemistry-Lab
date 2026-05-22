const PREFIX = "chemlab_";

export function saveSession<T>(key: string, state: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ state, savedAt: Date.now() }));
  } catch {}
}

export function loadSession<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state: T };
    return parsed.state;
  } catch {
    return null;
  }
}

export function clearSession(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PREFIX + key);
}
