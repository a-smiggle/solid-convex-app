import { For } from "solid-js";

/**
 * SkeletonChart displays a loading skeleton for chart-like dashboard sections.
 * Props:
 * - title: string (shown as a static header)
 * - bars: number (number of animated bars, default 5)
 */
export function SkeletonChart(props: { title: string; bars?: number }) {
  const barCount = props.bars ?? 5;
  return (
    <section class="motion-surface rounded-xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/75 animate-pulse">
      <h3 class="mb-3 font-semibold text-base text-slate-700 dark:text-slate-200">{props.title}</h3>
      <div class="flex items-end gap-2 h-32">
        <For each={Array(barCount)}>{(_, i) => (
          <div
            class="w-6 rounded bg-slate-200 dark:bg-slate-700"
            style={{ height: `${40 + Math.random() * 60}%` }}
          />
        )}</For>
      </div>
    </section>
  );
}
