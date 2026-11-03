const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function requestAiFeature<T>(
  endpoint: string,
  payload: unknown,
  timeoutMs = 45000
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error || `Błąd serwera (${res.status}). Spróbuj ponownie.`);
    }

    return data as T;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Czas oczekiwania na odpowiedź AI minął. Serwery Google mogą być przeciążone.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}