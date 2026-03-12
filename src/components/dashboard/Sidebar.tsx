import { For } from "solid-js";
import { FileText, LayoutDashboard, Settings2 } from "lucide-solid";
import type { DashboardTab } from "../../types/ui";

type SidebarProps = {
  tabs: Array<{ id: DashboardTab; label: string; description: string }>;
  activeTab: DashboardTab;
  collapsed: boolean;
  onSelectTab: (tab: DashboardTab) => void;
};

function TabIcon(props: { tab: DashboardTab }) {
  if (props.tab === "dashboard") {
    return <LayoutDashboard aria-hidden="true" class="h-4 w-4" stroke-width={2} />;
  }

  if (props.tab === "content") {
    return <FileText aria-hidden="true" class="h-4 w-4" stroke-width={2} />;
  }

  return <Settings2 aria-hidden="true" class="h-4 w-4" stroke-width={2} />;
}

export function Sidebar(props: SidebarProps) {
  return (
    <nav class="space-y-2">
      <For each={props.tabs}>
        {(tab) => {
          const active = () => props.activeTab === tab.id;
          return (
            <button
              aria-label={tab.label}
              class={`w-full rounded-xl border px-3 py-2 text-left transition ${
                active()
                  ? "border-cyan-200 bg-cyan-50 text-cyan-900 dark:border-cyan-900/60 dark:bg-cyan-900/25 dark:text-cyan-100"
                  : "border-transparent hover:border-slate-200 hover:bg-slate-100/80 dark:hover:border-slate-700 dark:hover:bg-slate-800"
              } ${props.collapsed ? "flex items-center justify-center" : ""}`}
              onClick={() => props.onSelectTab(tab.id)}
              title={props.collapsed ? tab.label : undefined}
              type="button"
            >
              <div class={`flex ${props.collapsed ? "items-center justify-center" : "items-start gap-2"}`}>
                <span class={props.collapsed ? "" : "mt-0.5"}>
                  <TabIcon tab={tab.id} />
                </span>
                {!props.collapsed && (
                  <div>
                    <p class="text-sm font-semibold">{tab.label}</p>
                    <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{tab.description}</p>
                  </div>
                )}
              </div>
            </button>
          );
        }}
      </For>
    </nav>
  );
}
