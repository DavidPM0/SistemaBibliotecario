export function formatMoney(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-PE");
}

export async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.json().catch(() => ({ message: "Error desconocido" }));
    throw new Error(message.message ?? "Error");
  }

  return (await response.json()) as T;
}

