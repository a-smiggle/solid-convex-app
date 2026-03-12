import { For, Show } from "solid-js";
import type { SettingsTab } from "../../types/ui";

const settingsTabs: Array<{ id: SettingsTab; label: string }> = [
  { id: "billing", label: "Billing" },
  { id: "profile", label: "Profile" },
  { id: "team", label: "Team" },
  { id: "integrations", label: "Integrations" },
];

type SettingsPageProps = {
  activeTab: SettingsTab;
  onSelectTab: (tab: SettingsTab) => void;
};

export function SettingsPage(props: SettingsPageProps) {
  return (
    <section class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <For each={settingsTabs}>
          {(tab) => (
            <button
              class={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                props.activeTab === tab.id
                  ? "border-cyan-300 bg-cyan-50 text-cyan-900 dark:border-cyan-900/70 dark:bg-cyan-900/30 dark:text-cyan-100"
                  : "border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              }`}
              onClick={() => props.onSelectTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          )}
        </For>
      </div>

      <Show when={props.activeTab === "billing"}>
        <article class="rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/75">
          <h3 class="text-lg font-semibold">Billing</h3>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Current plan: Pro, $79/month. Next invoice on April 1.</p>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p class="text-sm text-slate-500 dark:text-slate-400">Payment Method</p>
              <p class="mt-1 font-medium">Visa ending in 2481</p>
            </div>
            <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p class="text-sm text-slate-500 dark:text-slate-400">Seats</p>
              <p class="mt-1 font-medium">9 of 15 used</p>
            </div>
          </div>
        </article>
      </Show>

      <Show when={props.activeTab === "profile"}>
        <article class="rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/75">
          <h3 class="text-lg font-semibold">Profile</h3>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Manage display name, email, and security preferences.</p>
        </article>
      </Show>

      <Show when={props.activeTab === "team"}>
        <article class="rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/75">
          <h3 class="text-lg font-semibold">Team</h3>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Invite members, assign roles, and manage workspace permissions.</p>
        </article>
      </Show>

      <Show when={props.activeTab === "integrations"}>
        <article class="rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/75">
          <h3 class="text-lg font-semibold">Integrations</h3>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Connect Slack, Stripe, and analytics tools for automation and reporting.</p>
        </article>
      </Show>
    </section>
  );
}
