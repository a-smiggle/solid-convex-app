import { For, Show } from "solid-js";

/**
 * SkeletonCard displays a loading skeleton for card-like dashboard sections.
 * Props:
 * - title: string (shown as a static header)
 * - lines: number (number of animated skeleton lines, default 3)
 * - children: optional, for custom skeleton content
 */
export function SkeletonCard(props: { title: string; lines?: number; children?: any }) {
  const lineCount = props.lines ?? 3;
  return (
    <section class="motion-surface rounded-xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/75 animate-pulse">
      <h3 class="mb-3 font-semibold text-base text-slate-700 dark:text-slate-200">{props.title}</h3>
      <Show when={props.children} fallback={
        <For each={Array(lineCount)}>{() => (
          <div class="mb-3 h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
        )}</For>
      }>
        {props.children}
      </Show>
    </section>
  );
}
