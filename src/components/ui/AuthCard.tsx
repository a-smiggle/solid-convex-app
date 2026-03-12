import type { ParentProps } from "solid-js";

export function AuthCard(props: ParentProps<{ title: string; subtitle: string }>) {
  return (
    <div class="surface-panel mx-auto w-full max-w-md p-6 shadow-soft backdrop-blur sm:p-8">
      <h2 class="text-2xl font-semibold">{props.title}</h2>
      <p class="text-muted mt-1 text-sm">{props.subtitle}</p>
      {props.children}
    </div>
  );
}
