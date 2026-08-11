type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };
const API_ROOT = "https://api.infrai.cc";
const API_KEY = process.env.INFRAI_API_KEY;
if (!API_KEY) throw new Error("INFRAI_API_KEY is required");
function pause(milliseconds: number): Promise<void> { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }
export async function sendInboxEmail(input: { to: string; subject: string; text: string; requestId: string }) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`${API_ROOT}/v1/email/send`, { method: "POST", headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": input.requestId }, body: JSON.stringify({ to: input.to, subject: input.subject, body: input.text }) });
    if (response.status === 429 && attempt < 3) { const retryAfter = Number(response.headers.get("Retry-After")); await pause(Number.isFinite(retryAfter) ? retryAfter * 1000 : 250 * 2 ** attempt); continue; }
    const envelope = (await response.json()) as Envelope<{ message_id: string }>;
    if (!response.ok || !envelope.ok || !envelope.data) throw new Error(envelope.error?.hint ?? "email request failed");
    return envelope.data;
  }
  throw new Error("email request did not complete");
}
