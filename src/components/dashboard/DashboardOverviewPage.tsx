import { For } from "solid-js";
import { dashboardStats, pipelineItems } from "../../data/dashboard";

export function DashboardOverviewPage() {
  return (
    <section class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <For each={dashboardStats}>
          {(stat) => (
            <article class="rounded-xl border border-slate-200/70 bg-white/90 p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900/75">
              <p class="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p class="mt-2 text-2xl font-semibold">{stat.value}</p>
              <p class="mt-1 text-sm text-emerald-600 dark:text-emerald-400">{stat.trend} this month</p>
            </article>
          )}
        </For>
      </div>

      <div class="rounded-xl border border-slate-200/70 bg-white/90 shadow-soft dark:border-slate-800 dark:bg-slate-900/75">
        <div class="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h3 class="font-semibold">Revenue Pipeline</h3>
        </div>
        <div class="divide-y divide-slate-200 dark:divide-slate-800">
          <For each={pipelineItems}>
            {(item) => (
              <div class="flex flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="font-medium">{item.company}</p>
                  <p class="text-slate-500 dark:text-slate-400">Owner: {item.owner}</p>
                </div>
                <span class="w-fit rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200">
                  {item.stage}
                </span>
              </div>
            )}
          </For>
        </div>
      </div>
    </section>
  );
}
