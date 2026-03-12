import { Button } from "../ui/Button";
import type { Theme } from "../../types/ui";

type AppHeaderProps = {
  theme: Theme;
  onToggleTheme: () => void;
  showSidebarToggle?: boolean;
  onToggleSidebar?: () => void;
  showLogout?: boolean;
  onLogout?: () => void;
};

export function AppHeader(props: AppHeaderProps) {
  return (
    <div class="mb-6 flex items-center justify-between rounded-xl border border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/75">
      <div class="flex items-center gap-3">
        {props.showSidebarToggle && (
          <Button aria-label="Toggle sidebar" variant="neutral" class="px-3 py-2" onClick={props.onToggleSidebar} type="button">
            <span aria-hidden="true">☰</span>
          </Button>
        )}
        <div>
          <p class="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Solid + Convex</p>
          <h1 class="text-lg font-semibold">Starter UI Scaffold</h1>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Button
          aria-label={props.theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={props.theme === "dark" ? "Light mode" : "Dark mode"}
          variant="neutral"
          class="px-3 py-2"
          onClick={props.onToggleTheme}
          type="button"
        >
          {props.theme === "dark" ? (
            <svg aria-hidden="true" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.5M12 18.5V21M5.64 5.64l1.77 1.77M16.59 16.59l1.77 1.77M3 12h2.5M18.5 12H21M5.64 18.36l1.77-1.77M16.59 7.41l1.77-1.77M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
            </svg>
          ) : (
            <svg aria-hidden="true" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8Z" />
            </svg>
          )}
        </Button>
        {props.showLogout && (
          <Button class="px-3 py-2 text-sm" onClick={props.onLogout} type="button">
            Log out
          </Button>
        )}
      </div>
    </div>
  );
}
