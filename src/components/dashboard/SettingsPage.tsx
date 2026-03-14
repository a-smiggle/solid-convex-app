import { For, Show, createMemo } from "solid-js";
import type { SettingsTab } from "../../types/ui";
import { DataTable, type DataTableColumn } from "../ui/DataTable";
import { Button } from "../ui/Button";
import { useToast } from "../feedback/ToastProvider";
import { t } from "../../i18n";

const settingsTabs: Array<{ id: SettingsTab; label: string }> = [
  { id: "billing", label: t.settings.tabs.billing },
  { id: "team", label: t.settings.tabs.team },
  { id: "integrations", label: t.settings.tabs.integrations },
  { id: "security", label: t.settings.tabs.security },
  { id: "notifications", label: t.settings.tabs.notifications },
  { id: "apiKeys", label: t.settings.tabs.apiKeys },
  { id: "auditLog", label: t.settings.tabs.auditLog },
];

const invoiceColumns: DataTableColumn[] = [
  { key: "invoice", label: "Invoice" },
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount", align: "right" },
  { key: "status", label: "Status" },
];

const invoiceRows = [
  { invoice: "INV-2103", date: "Mar 01, 2026", amount: "$79.00", status: "Paid" },
  { invoice: "INV-2062", date: "Feb 01, 2026", amount: "$79.00", status: "Paid" },
  { invoice: "INV-2021", date: "Jan 01, 2026", amount: "$79.00", status: "Paid" },
];

const teamMemberColumns: DataTableColumn[] = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "lastActive", label: "Last Active", align: "right" },
];

const teamMemberRows = [
  { name: "Anthony Smigielski", role: "Owner", status: "Active", lastActive: "Now" },
  { name: "Jamie Rivera", role: "Admin", status: "Active", lastActive: "2h ago" },
  { name: "Priya Das", role: "Contributor", status: "Invited", lastActive: "Pending" },
];

const apiKeyColumns: DataTableColumn[] = [
  { key: "name", label: "Key Name" },
  { key: "scope", label: "Scope" },
  { key: "lastUsed", label: "Last Used", align: "right" },
  { key: "status", label: "Status" },
];

const apiKeyRows = [
  { name: "CI Deploy Key", scope: "read:all, write:deploy", lastUsed: "5m ago", status: "Active" },
  { name: "Analytics ETL", scope: "read:events", lastUsed: "1d ago", status: "Active" },
  { name: "Legacy Staging", scope: "read:all", lastUsed: "30d ago", status: "Revoked" },
];

const auditColumns: DataTableColumn[] = [
  { key: "actor", label: "Actor" },
  { key: "action", label: "Action" },
  { key: "target", label: "Target" },
  { key: "time", label: "Time", align: "right" },
];

const auditRows = [
  { actor: "A. Smigielski", action: "Updated plan", target: "Pro -> Scale", time: "Mar 12, 9:41 AM" },
  { actor: "J. Rivera", action: "Invited member", target: "priya@company.com", time: "Mar 11, 4:14 PM" },
  { actor: "System", action: "Rotated API key", target: "CI Deploy Key", time: "Mar 10, 1:02 AM" },
];

function invoiceStatus(status: string) {
  const toneClass =
    status === "Paid"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";

  return <span class={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass}`}>{status}</span>;
}

function statusPill(status: string) {
  const toneClass =
    status === "Active" || status === "Paid"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
      : status === "Invited"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";

  return <span class={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass}`}>{status}</span>;
}

type SettingsPageProps = {
  activeTab: SettingsTab;
  onSelectTab: (tab: SettingsTab) => void;
};

export function SettingsPage(props: SettingsPageProps) {
  const { pushToast } = useToast();
  const tabRefs: Partial<Record<SettingsTab, HTMLButtonElement>> = {};

  const activeIndex = createMemo(() => settingsTabs.findIndex((tab) => tab.id === props.activeTab));

  const tabId = (tab: SettingsTab) => `settings-tab-${tab}`;
  const panelId = (tab: SettingsTab) => `settings-panel-${tab}`;

  const selectByIndex = (index: number) => {
    const normalized = (index + settingsTabs.length) % settingsTabs.length;
    const nextTab = settingsTabs[normalized];
    props.onSelectTab(nextTab.id);
    tabRefs[nextTab.id]?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectByIndex(activeIndex() + 1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectByIndex(activeIndex() - 1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      selectByIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      selectByIndex(settingsTabs.length - 1);
    }
  };

  const runAction = (actionLabel: string) => {
    pushToast({
      type: "info",
      title: `${actionLabel}`,
      description: "Action queued. Connect this control to your backend workflow.",
    });
  };

  const invoiceTableRows = invoiceRows.map((row) => ({
    ...row,
    status: invoiceStatus(row.status),
  }));

  const teamRows = teamMemberRows.map((row) => ({
    ...row,
    status: statusPill(row.status),
  }));

  const keyRows = apiKeyRows.map((row) => ({
    ...row,
    status: statusPill(row.status),
  }));

  return (
    <section class="space-y-4">
      <div class="overflow-x-auto pb-1 pt-1">
        <div aria-label={t.settings.tabListLabel} class="flex min-w-max gap-2" role="tablist">
          <For each={settingsTabs}>
            {(tab) => (
              <button
                aria-controls={panelId(tab.id)}
                aria-selected={props.activeTab === tab.id}
                class={`motion-interactive rounded-lg border px-3 py-2 text-sm font-medium ${
                  props.activeTab === tab.id
                    ? "border-cyan-300 bg-cyan-50 text-cyan-900 dark:border-cyan-900/70 dark:bg-cyan-900/30 dark:text-cyan-100"
                    : "border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                }`}
                id={tabId(tab.id)}
                onClick={() => props.onSelectTab(tab.id)}
                onKeyDown={handleTabKeyDown}
                ref={(element) => {
                  tabRefs[tab.id] = element;
                }}
                role="tab"
                tabIndex={props.activeTab === tab.id ? 0 : -1}
                type="button"
              >
                {tab.label}
              </button>
            )}
          </For>
        </div>
      </div>

      <Show when={props.activeTab === "billing"}>
        <article aria-labelledby={tabId("billing")} class="motion-enter-fade-up motion-surface rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75" id={panelId("billing")} role="tabpanel" tabIndex={0}>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h3 class="text-lg font-semibold">Billing</h3>
            <div class="flex flex-wrap gap-2">
              <Button class="px-3 py-2 text-sm" onClick={() => runAction("Upgrade plan")} type="button">
                Upgrade Plan
              </Button>
              <Button class="px-3 py-2 text-sm" variant="neutral" onClick={() => runAction("Update payment method")} type="button">
                Update Payment
              </Button>
            </div>
          </div>
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

          <div class="mt-5 space-y-2">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h4 class="font-semibold">Invoice History</h4>
              <Button class="px-3 py-1.5 text-xs" variant="neutral" onClick={() => runAction("Download invoices")} type="button">
                Download Invoices
              </Button>
            </div>
            <DataTable caption="Billing invoice history" columns={invoiceColumns} rows={invoiceTableRows} emptyMessage="No invoices available." />
          </div>
        </article>
      </Show>

      <Show when={props.activeTab === "team"}>
        <article aria-labelledby={tabId("team")} class="motion-enter-fade-up motion-surface rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75" id={panelId("team")} role="tabpanel" tabIndex={0}>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h3 class="text-lg font-semibold">Team</h3>
            <div class="flex flex-wrap gap-2">
              <Button class="px-3 py-2 text-sm" onClick={() => runAction("Invite team member")} type="button">
                Invite Team Member
              </Button>
              <Button class="px-3 py-2 text-sm" variant="neutral" onClick={() => runAction("Manage roles")} type="button">
                Manage Roles
              </Button>
            </div>
          </div>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Invite members, assign roles, and manage workspace permissions.</p>
          <div class="mt-5 space-y-2">
            <h4 class="font-semibold">Members</h4>
            <DataTable caption="Team members" columns={teamMemberColumns} rows={teamRows} emptyMessage="No team members found." />
          </div>
        </article>
      </Show>

      <Show when={props.activeTab === "integrations"}>
        <article aria-labelledby={tabId("integrations")} class="motion-enter-fade-up motion-surface rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75" id={panelId("integrations")} role="tabpanel" tabIndex={0}>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h3 class="text-lg font-semibold">Integrations</h3>
            <div class="flex flex-wrap gap-2">
              <Button class="px-3 py-2 text-sm" onClick={() => runAction("Connect integration")} type="button">
                Connect App
              </Button>
              <Button class="px-3 py-2 text-sm" variant="neutral" onClick={() => runAction("Configure webhooks")} type="button">
                Configure Webhooks
              </Button>
            </div>
          </div>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Connect Slack, Stripe, and analytics tools for automation and reporting.</p>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p class="text-sm text-slate-500 dark:text-slate-400">Slack</p>
              <p class="mt-1 font-medium">Connected</p>
            </div>
            <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p class="text-sm text-slate-500 dark:text-slate-400">Stripe</p>
              <p class="mt-1 font-medium">Connected</p>
            </div>
          </div>
        </article>
      </Show>

      <Show when={props.activeTab === "security"}>
        <article aria-labelledby={tabId("security")} class="motion-enter-fade-up motion-surface rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75" id={panelId("security")} role="tabpanel" tabIndex={0}>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h3 class="text-lg font-semibold">Security</h3>
            <div class="flex flex-wrap gap-2">
              <Button class="px-3 py-2 text-sm" onClick={() => runAction("Enforce 2FA")} type="button">
                Enforce 2FA
              </Button>
              <Button class="px-3 py-2 text-sm" variant="neutral" onClick={() => runAction("Revoke active sessions")} type="button">
                Revoke Sessions
              </Button>
            </div>
          </div>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Manage authentication requirements, sessions, and workspace protection rules.</p>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p class="text-sm text-slate-500 dark:text-slate-400">Two-Factor Authentication</p>
              <p class="mt-1 font-medium">Required for admins</p>
            </div>
            <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p class="text-sm text-slate-500 dark:text-slate-400">Session Timeout</p>
              <p class="mt-1 font-medium">12 hours</p>
            </div>
          </div>
        </article>
      </Show>

      <Show when={props.activeTab === "notifications"}>
        <article aria-labelledby={tabId("notifications")} class="motion-enter-fade-up motion-surface rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75" id={panelId("notifications")} role="tabpanel" tabIndex={0}>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h3 class="text-lg font-semibold">Notifications</h3>
            <div class="flex flex-wrap gap-2">
              <Button class="px-3 py-2 text-sm" onClick={() => runAction("Save notification preferences")} type="button">
                Save Preferences
              </Button>
              <Button class="px-3 py-2 text-sm" variant="neutral" onClick={() => runAction("Send test notification")} type="button">
                Send Test
              </Button>
            </div>
          </div>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Control where alerts, billing notices, and security events are delivered.</p>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p class="text-sm text-slate-500 dark:text-slate-400">Product Updates</p>
              <p class="mt-1 font-medium">Email + In-app</p>
            </div>
            <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p class="text-sm text-slate-500 dark:text-slate-400">Security Alerts</p>
              <p class="mt-1 font-medium">Email + Slack</p>
            </div>
          </div>
        </article>
      </Show>

      <Show when={props.activeTab === "apiKeys"}>
        <article aria-labelledby={tabId("apiKeys")} class="motion-enter-fade-up motion-surface rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75" id={panelId("apiKeys")} role="tabpanel" tabIndex={0}>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h3 class="text-lg font-semibold">API Keys</h3>
            <div class="flex flex-wrap gap-2">
              <Button class="px-3 py-2 text-sm" onClick={() => runAction("Create API key")} type="button">
                Create Key
              </Button>
              <Button class="px-3 py-2 text-sm" variant="neutral" onClick={() => runAction("Rotate API keys")} type="button">
                Rotate Keys
              </Button>
            </div>
          </div>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Create and rotate programmatic credentials with scoped access policies.</p>
          <div class="mt-5 space-y-2">
            <h4 class="font-semibold">Keys</h4>
            <DataTable caption="API keys" columns={apiKeyColumns} rows={keyRows} emptyMessage="No API keys created yet." />
          </div>
        </article>
      </Show>

      <Show when={props.activeTab === "auditLog"}>
        <article aria-labelledby={tabId("auditLog")} class="motion-enter-fade-up motion-surface rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75" id={panelId("auditLog")} role="tabpanel" tabIndex={0}>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h3 class="text-lg font-semibold">Audit Log</h3>
            <div class="flex flex-wrap gap-2">
              <Button class="px-3 py-2 text-sm" onClick={() => runAction("Export audit log CSV")} type="button">
                Export CSV
              </Button>
              <Button class="px-3 py-2 text-sm" variant="neutral" onClick={() => runAction("Open retention policy")} type="button">
                Retention Policy
              </Button>
            </div>
          </div>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Track workspace-level changes for compliance and operational troubleshooting.</p>
          <div class="mt-5 space-y-2">
            <h4 class="font-semibold">Recent Events</h4>
            <DataTable caption="Audit log" columns={auditColumns} rows={auditRows} emptyMessage="No events recorded." />
          </div>
        </article>
      </Show>
    </section>
  );
}
