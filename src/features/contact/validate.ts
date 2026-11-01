/** お問い合わせの入力チェック（ブラウザ側）。Kuroco 側のチェックと同じ条件にそろえる */

export type ContactValues = { name: string; email: string; message: string };
export type ContactField = keyof ContactValues;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const LIMITS = { name: 100, message: 3000 } as const;

// 実用上十分な形式チェック（@ の前後に文字があり、ドメインに . がある）
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateField(field: ContactField, raw: string): string | undefined {
  const value = raw.trim();
  switch (field) {
    case "name":
      if (!value) return "お名前を入力してください。";
      if (value.length > LIMITS.name) return `お名前は${LIMITS.name}文字以内で入力してください。`;
      return undefined;
    case "email":
      if (!value) return "メールアドレスを入力してください。";
      if (!EMAIL_PATTERN.test(value)) return "メールアドレスの形式が正しくありません。例: name@example.com";
      return undefined;
    case "message":
      if (!value) return "お問い合わせ内容を入力してください。";
      if (value.length > LIMITS.message) {
        return `お問い合わせ内容は${LIMITS.message}文字以内で入力してください（いま${value.length}文字）。`;
      }
      return undefined;
  }
}

export function validateAll(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  for (const field of ["name", "email", "message"] as const) {
    const error = validateField(field, values[field]);
    if (error) errors[field] = error;
  }
  return errors;
}
