"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { submitContact } from "./submit";
import {
  LIMITS,
  validateAll,
  validateField,
  type ContactErrors,
  type ContactField,
  type ContactValues,
} from "./validate";
import styles from "./ContactForm.module.css";

const FIELDS: { name: ContactField; label: string; type: "text" | "email" | "textarea"; autoComplete?: string }[] = [
  { name: "name", label: "お名前", type: "text", autoComplete: "name" },
  { name: "email", label: "メールアドレス", type: "email", autoComplete: "email" },
  { name: "message", label: "お問い合わせ内容", type: "textarea" },
];

const FAILURE_TEXT = {
  network: "送信できませんでした。通信状況を確認して、もう一度お試しください。",
  server: "送信できませんでした。時間をおいてもう一度お試しいただくか、下のメールアドレスにご連絡ください。",
  rate_limited:
    "送信が集中しているため受け付けられませんでした。時間をおいてもう一度お試しいただくか、下のメールアドレスにご連絡ください。",
} as const;

/** お名前・メールアドレス・お問い合わせ内容の3項目。送信後はページ内の文面に置き換える */
export function ContactForm() {
  const [values, setValues] = useState<ContactValues>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLParagraphElement>(null);

  const update = (field: ContactField, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    // 一度エラーを出した項目は、直ったらすぐに消す
    if (touched[field]) setErrors((e) => ({ ...e, [field]: validateField(field, value) }));
  };

  const onBlur = (field: ContactField) => {
    if (!values[field] && !touched[field]) return; // 何も入れずに通り過ぎただけなら責めない
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validateField(field, values[field]) }));
  };

  const focusFirstError = (errs: ContactErrors) => {
    const first = FIELDS.find((f) => errs[f.name]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first.name}"]`)?.focus();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return; // 二重送信を防ぐ
    setFormError(null);

    // 人には見えない欄に入力があれば、機械による送信とみなして送らない（成功したように見せる）
    const trap = new FormData(e.currentTarget).get("website");
    if (typeof trap === "string" && trap !== "") {
      setStatus("sent");
      return;
    }

    const errs = validateAll(values);
    setTouched({ name: true, email: true, message: true });
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      focusFirstError(errs);
      return;
    }

    setStatus("sending");
    const result = await submitContact(values);
    if (result.ok) {
      setStatus("sent");
      requestAnimationFrame(() => doneRef.current?.focus());
      return;
    }
    setStatus("idle");
    if (result.kind === "validation") {
      setErrors(result.errors);
      setFormError(result.message ?? (Object.keys(result.errors).length ? null : FAILURE_TEXT.server));
      focusFirstError(result.errors);
    } else {
      setFormError(FAILURE_TEXT[result.kind]);
    }
  };

  if (status === "sent") {
    return (
      <p ref={doneRef} tabIndex={-1} className={styles.done} role="status">
        お問い合わせを受け付けました。ありがとうございます。
        <br />
        内容を確認のうえ、あらためてご連絡いたします。確認のメールをお送りしましたので、届いているかご確認ください。
      </p>
    );
  }

  return (
    <form ref={formRef} className={styles.form} onSubmit={onSubmit} noValidate aria-describedby="contact-required-note">
      <p id="contact-required-note" className="visually-hidden">
        すべての項目が必須です。
      </p>
      {FIELDS.map((f) => {
        const id = `contact-${f.name}`;
        const error = errors[f.name];
        const common = {
          id,
          name: f.name,
          value: values[f.name],
          required: true,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": error ? `${id}-error` : undefined,
          onBlur: () => onBlur(f.name),
          className: `${styles.control} ${f.type === "textarea" ? styles.textarea : ""}`,
        };
        return (
          <div key={f.name} className={styles.field}>
            <label htmlFor={id} className={styles.label}>
              {f.label}
            </label>
            {f.type === "textarea" ? (
              <textarea
                {...common}
                rows={6}
                maxLength={LIMITS.message + 200}
                onChange={(e) => update(f.name, e.target.value)}
              />
            ) : (
              <input
                {...common}
                type={f.type}
                autoComplete={f.autoComplete}
                inputMode={f.type === "email" ? "email" : undefined}
                onChange={(e) => update(f.name, e.target.value)}
              />
            )}
            {error && (
              <p id={`${id}-error`} className={styles.error}>
                {error}
              </p>
            )}
          </div>
        );
      })}

      {/* 迷惑送信対策（人には見えない欄） */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className={styles.actions}>
        <Button variant="solid" type="submit" disabled={status === "sending"} className={styles.submit}>
          {status === "sending" ? "送信中…" : "送信する"}
        </Button>
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      </div>
    </form>
  );
}
