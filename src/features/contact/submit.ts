import { CONTACT_ENDPOINT } from "@/lib/site";
import type { ContactErrors, ContactField, ContactValues } from "./validate";

export type SubmitResult =
  | { ok: true }
  | { ok: false; kind: "validation"; errors: ContactErrors; message?: string }
  | { ok: false; kind: "network" | "server" | "rate_limited" | "closed" };

/** Kuroco の項目名 → フォームの項目名 */
const FIELD_MAP: Record<string, ContactField> = { name: "name", email: "email", body: "message", message: "message" };

type KurocoError = string | { code?: string; message?: string; field?: string };

/** Kuroco のフォーム（API 3 の contact）に送信する */
export async function submitContact(values: ContactValues, endpoint = CONTACT_ENDPOINT): Promise<SubmitResult> {
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name: values.name.trim(), email: values.email.trim(), body: values.message.trim() }),
    });
  } catch {
    return { ok: false, kind: "network" };
  }

  if (res.ok) return { ok: true };
  if (res.status === 429) return { ok: false, kind: "rate_limited" };
  // Kuroco のフォームが「無効」になっているとき
  if (res.status === 403) return { ok: false, kind: "closed" };

  const json = (await res.json().catch(() => null)) as { errors?: KurocoError[] } | null;
  if (res.status >= 400 && res.status < 500 && json?.errors?.length) {
    const errors: ContactErrors = {};
    const general: string[] = [];
    for (const e of json.errors) {
      const field = typeof e === "object" && e.field ? FIELD_MAP[e.field] : undefined;
      const message = typeof e === "string" ? e : (e.message ?? "");
      if (field && !errors[field]) errors[field] = message;
      else if (message) general.push(message);
    }
    return { ok: false, kind: "validation", errors, message: general.join(" ") || undefined };
  }
  return { ok: false, kind: "server" };
}
