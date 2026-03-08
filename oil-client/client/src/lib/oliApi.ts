export const OLI_API_BASE_URL =
  import.meta.env.VITE_OLI_API_BASE_URL ?? "http://localhost:8085";

export function oliUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${OLI_API_BASE_URL}${p}`;
}

export function oliAssetUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const p = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${OLI_API_BASE_URL}${p}`;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function oliGetJson<T>(path: string): Promise<T> {
  const res = await fetch(oliUrl(path));
  await throwIfResNotOk(res);
  return (await res.json()) as T;
}

export async function oliRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<Response> {
  const url = oliUrl(path);

  const headers: Record<string, string> = {};
  let requestBody: BodyInit | undefined;

  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method,
    headers,
    body: requestBody,
  });

  await throwIfResNotOk(res);
  return res;
}
