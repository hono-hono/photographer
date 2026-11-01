import { describe, expect, it } from "vitest";
import { validateAll, validateField } from "./validate";

describe("validateField", () => {
  it("空欄を知らせる", () => {
    expect(validateField("name", "  ")).toMatch(/お名前/);
    expect(validateField("message", "")).toMatch(/お問い合わせ内容/);
  });
  it("メールアドレスの形式を確かめる", () => {
    expect(validateField("email", "name@example")).toMatch(/形式/);
    expect(validateField("email", "name@example.com")).toBeUndefined();
  });
  it("文字数の上限を確かめる", () => {
    expect(validateField("message", "あ".repeat(3001))).toMatch(/3000文字以内/);
    expect(validateField("message", "あ".repeat(3000))).toBeUndefined();
  });
});

describe("validateAll", () => {
  it("問題のある項目だけを返す", () => {
    expect(Object.keys(validateAll({ name: "hono", email: "", message: "" }))).toEqual(["email", "message"]);
  });
});
