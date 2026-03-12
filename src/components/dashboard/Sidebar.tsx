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
    <nav aria-label="Dashboard sections" class="space-y-2">
      <For each={props.tabs}>
        {(tab) => {
          const active = () => props.activeTab === tab.id;
          return (
            <button
              aria-label={tab.label}
              aria-current={active() ? "page" : undefined}
              class={`motion-interactive w-full rounded-xl border px-3 py-2 text-left ${
                active()
                  ? "tone-info"
                  : "border-transparent interactive-item hover:border-[var(--color-border-default)]"
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
                    <p class="text-subtle mt-0.5 text-xs">{tab.description}</p>
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
