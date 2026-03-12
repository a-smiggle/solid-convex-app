import type { JSX } from "solid-js";

type ButtonVariant = "primary" | "secondary" | "ghost" | "neutral" | "warning";

type ButtonProps = {
  variant?: ButtonVariant;
  class?: string;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-cyan-600 text-white hover:bg-cyan-500",
  secondary: "bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200",
  warning: "bg-amber-500 text-slate-900 hover:bg-amber-400",
  neutral: "border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800",
  ghost: "text-cyan-700 hover:underline dark:text-cyan-300",
};

export function Button(props: ButtonProps) {
  const variant = () => props.variant ?? "primary";
  return (
    <button
      {...props}
      class={`rounded-lg px-4 py-2.5 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-70 ${variantClasses[variant()]} ${props.class ?? ""}`.trim()}
    >
      {props.children}
    </button>
  );
}
