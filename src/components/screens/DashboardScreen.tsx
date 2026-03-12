import { Match, Show, Suspense, Switch, createEffect, createMemo, createSignal, lazy } from "solid-js";
import { Sidebar } from "../dashboard/Sidebar";
import type { DashboardTab, SettingsTab } from "../../types/ui";

const DashboardOverviewPage = lazy(() =>
  import("../dashboard/DashboardOverviewPage").then((module) => ({ default: module.DashboardOverviewPage }))
);
const ContentTestPage = lazy(() => import("../dashboard/ContentTestPage").then((module) => ({ default: module.ContentTestPage })));
const SettingsPage = lazy(() => import("../dashboard/SettingsPage").then((module) => ({ default: module.SettingsPage })));

const dashboardTabs: DashboardTab[] = ["dashboard", "content", "settings"];
const settingsTabs: SettingsTab[] = ["billing", "profile", "team", "integrations", "security", "notifications", "apiKeys", "auditLog"];

function getStoredDashboardTab(): DashboardTab {
  if (typeof window === "undefined") {
    return "dashboard";
  }

  const tab = window.sessionStorage.getItem("ui-dashboard-tab");
  if (tab && dashboardTabs.includes(tab as DashboardTab)) {
    return tab as DashboardTab;
  }

  return "dashboard";
}

function getStoredSettingsTab(): SettingsTab {
  if (typeof window === "undefined") {
    return "billing";
  }

  const tab = window.sessionStorage.getItem("ui-settings-tab");
  if (tab && settingsTabs.includes(tab as SettingsTab)) {
    return tab as SettingsTab;
  }

  return "billing";
}

type DashboardScreenProps = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  onSetMobileSidebarOpen: (value: boolean) => void;
};

export function DashboardScreen(props: DashboardScreenProps) {
  const [activeTab, setActiveTab] = createSignal<DashboardTab>(getStoredDashboardTab());
  const [activeSettingsTab, setActiveSettingsTab] = createSignal<SettingsTab>(getStoredSettingsTab());

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

  createEffect(() => {
    window.sessionStorage.setItem("ui-dashboard-tab", activeTab());
  });

  createEffect(() => {
    window.sessionStorage.setItem("ui-settings-tab", activeSettingsTab());
  });

  return (
    <section class="flex min-h-0 flex-1 flex-col">
      <Show when={props.mobileSidebarOpen}>
        <button
          aria-label="Close menu overlay"
          class="motion-enter-fade fixed inset-0 z-40 bg-slate-950/50 md:hidden"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              props.onSetMobileSidebarOpen(false);
            }
          }}
          onClick={() => props.onSetMobileSidebarOpen(false)}
          type="button"
        />
        <aside aria-label="Mobile sidebar" aria-modal="true" class="motion-enter-slide-left motion-surface surface-panel fixed left-0 top-0 z-50 h-full w-72 rounded-none border-r p-4 md:hidden" role="dialog">
          <Sidebar tabs={tabs} activeTab={activeTab()} collapsed={false} onSelectTab={handleSelectTab} />
        </aside>
      </Show>

      <div class="grid min-h-0 flex-1 gap-3 md:grid-cols-[auto_1fr] md:gap-4">
        <aside
          class={`motion-enter-fade-up motion-surface surface-panel hidden h-full min-h-0 overflow-y-auto p-2.5 shadow-sm md:block md:p-3 ${
            props.sidebarCollapsed ? "w-16 md:w-20" : "w-56 md:w-64 lg:w-72"
          }`}
        >
          <Sidebar tabs={tabs} activeTab={activeTab()} collapsed={props.sidebarCollapsed} onSelectTab={handleSelectTab} />
        </aside>

        <div class="motion-enter-fade-up motion-stagger-1 motion-surface surface-panel flex h-full min-h-0 flex-col p-3.5 shadow-sm sm:p-4 md:p-5">
          <div class="mb-4 border-b pb-3" style={{ "border-color": "var(--color-border-muted)" }}>
            <h3 class="text-xl font-semibold">{pageTitle()}</h3>
            <p class="text-muted mt-1 text-sm">Manage your product data and workspace from one place.</p>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto pr-1">
            <Suspense
              fallback={
                <div class="surface-card text-subtle grid min-h-[260px] place-items-center text-sm">
                  Loading section...
                </div>
              }
            >
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
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
