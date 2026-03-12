import type { JSX } from "solid-js";

type ButtonVariant = "primary" | "secondary" | "ghost" | "neutral" | "warning";

type ButtonProps = {
  variant?: ButtonVariant;
  class?: string;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-variant-primary",
  secondary: "btn-variant-secondary",
  warning: "btn-variant-warning",
  neutral: "btn-variant-neutral",
  ghost: "btn-variant-ghost",
};

export function Button(props: ButtonProps) {
  const variant = () => props.variant ?? "primary";
  return (
    <button
      {...props}
      class={`motion-interactive rounded-lg px-4 py-2.5 font-semibold active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:opacity-70 ${variantClasses[variant()]} ${props.class ?? ""}`.trim()}
    >
      {props.children}
    </button>
  );
}
