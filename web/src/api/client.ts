export const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const url = API_URL ? `${API_URL}${path}` : path;
  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP error! status: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  const url = API_URL ? `${API_URL}${path}` : path;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP error! status: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

