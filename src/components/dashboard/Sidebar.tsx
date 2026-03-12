import { For } from "solid-js";
import type { DashboardTab } from "../../types/ui";

type SidebarProps = {
  tabs: Array<{ id: DashboardTab; label: string; description: string }>;
  activeTab: DashboardTab;
  collapsed: boolean;
  onSelectTab: (tab: DashboardTab) => void;
};

function TabIcon(props: { tab: DashboardTab }) {
  if (props.tab === "dashboard") {
    return (
      <svg aria-hidden="true" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-10h8V3h-8v8Z" />
      </svg>
    );
  }

  if (props.tab === "content") {
    return (
      <svg aria-hidden="true" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 4h12a2 2 0 0 1 2 2v12l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M10.2 4.32a1 1 0 0 1 .95-.82h1.7a1 1 0 0 1 .95.82l.3 1.45c.22.1.44.22.65.35l1.4-.48a1 1 0 0 1 1.16.4l.86 1.48a1 1 0 0 1-.22 1.2l-1.1.98c.03.25.05.5.05.75s-.02.5-.05.75l1.1.98a1 1 0 0 1 .22 1.2l-.86 1.48a1 1 0 0 1-1.16.4l-1.4-.48c-.21.13-.43.25-.65.35l-.3 1.45a1 1 0 0 1-.95.82h-1.7a1 1 0 0 1-.95-.82l-.3-1.45a5.7 5.7 0 0 1-.65-.35l-1.4.48a1 1 0 0 1-1.16-.4l-.86-1.48a1 1 0 0 1 .22-1.2l1.1-.98a6.2 6.2 0 0 1 0-1.5l-1.1-.98a1 1 0 0 1-.22-1.2l.86-1.48a1 1 0 0 1 1.16-.4l1.4.48c.21-.13.43-.25.65-.35l.3-1.45ZM12 14.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z"
      />
    </svg>
  );
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
