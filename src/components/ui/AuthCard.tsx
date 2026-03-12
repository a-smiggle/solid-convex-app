import type { ParentProps } from "solid-js";

export function AuthCard(props: ParentProps<{ title: string; subtitle: string }>) {
  return (
    <div class="mx-auto w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:p-8">
      <h2 class="text-2xl font-semibold">{props.title}</h2>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{props.subtitle}</p>
      {props.children}
    </div>
  );
}
