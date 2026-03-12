import { Match, Show, Switch, createMemo, createSignal } from "solid-js";
import { Sidebar } from "../dashboard/Sidebar";
import { DashboardOverviewPage } from "../dashboard/DashboardOverviewPage";
import { ContentTestPage } from "../dashboard/ContentTestPage";
import { SettingsPage } from "../dashboard/SettingsPage";
import type { DashboardTab, SettingsTab } from "../../types/ui";

type DashboardScreenProps = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  onSetMobileSidebarOpen: (value: boolean) => void;
};

export function DashboardScreen(props: DashboardScreenProps) {
  const [activeTab, setActiveTab] = createSignal<DashboardTab>("dashboard");
  const [activeSettingsTab, setActiveSettingsTab] = createSignal<SettingsTab>("billing");

  const tabs: Array<{ id: DashboardTab; label: string; description: string }> = [
    { id: "dashboard", label: "Dashboard", description: "Core metrics and pipeline" },
    { id: "content", label: "Content", description: "Test page and content modules" },
    { id: "settings", label: "Settings", description: "Billing and workspace controls" },
  ];

  const pageTitle = createMemo(() => {
    if (activeTab() === "settings") {
      return `Settings / ${activeSettingsTab().charAt(0).toUpperCase()}${activeSettingsTab().slice(1)}`;
    }

    if (activeTab() === "content") {
      return "Content";
    }

    return "Dashboard";
  });

  const handleSelectTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    props.onSetMobileSidebarOpen(false);
  };

  return (
    <section class="flex min-h-0 flex-1 flex-col">
      <Show when={props.mobileSidebarOpen}>
        <button
          aria-label="Close menu overlay"
          class="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => props.onSetMobileSidebarOpen(false)}
          type="button"
        />
        <aside class="fixed left-0 top-0 z-50 h-full w-72 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          <Sidebar tabs={tabs} activeTab={activeTab()} collapsed={false} onSelectTab={handleSelectTab} />
        </aside>
      </Show>

      <div class="grid min-h-0 flex-1 gap-4 lg:grid-cols-[auto_1fr]">
        <aside
          class={`hidden h-full min-h-0 overflow-y-auto rounded-2xl border border-slate-200/70 bg-white/90 p-3 shadow-soft dark:border-slate-800 dark:bg-slate-900/80 lg:block ${
            props.sidebarCollapsed ? "w-20" : "w-72"
          }`}
        >
          <Sidebar tabs={tabs} activeTab={activeTab()} collapsed={props.sidebarCollapsed} onSelectTab={handleSelectTab} />
        </aside>

        <div class="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900/80 sm:p-5">
          <div class="mb-4 border-b border-slate-200 pb-3 dark:border-slate-800">
            <h3 class="text-xl font-semibold">{pageTitle()}</h3>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Manage your product data and workspace from one place.</p>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto pr-1">
            <Switch>
              <Match when={activeTab() === "dashboard"}>
                <DashboardOverviewPage />
              </Match>
              <Match when={activeTab() === "content"}>
                <ContentTestPage />
              </Match>
              <Match when={activeTab() === "settings"}>
                <SettingsPage activeTab={activeSettingsTab()} onSelectTab={setActiveSettingsTab} />
              </Match>
            </Switch>
          </div>
        </div>
      </div>
    </section>
  );
}
