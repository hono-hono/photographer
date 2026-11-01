import Link from "next/link";
import styles from "./Button.module.css";

type Variant = "tile" | "solid";

type Props =
  | { variant: Variant; href: string; children: React.ReactNode; className?: string }
  | ({ variant: Variant; href?: undefined; children: React.ReactNode; className?: string } & Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      "className" | "children"
    >);

/** 角丸10pxのボタン。tile = 薄いグレー（すべての写真を見る）、solid = 黒地に白文字（送信） */
export function Button(props: Props) {
  const className = [styles.button, styles[props.variant], props.className].filter(Boolean).join(" ");
  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={className}>
        {props.children}
      </Link>
    );
  }
  const { variant: _variant, className: _className, children, ...rest } = props;
  return (
    <button className={className} {...rest}>
      {children}
    </button>
  );
}
