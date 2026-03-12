import { createSignal, onCleanup } from "solid-js";
import { Button } from "../ui/Button";
import { ChevronDown, LogOut, Menu, Moon, Settings, Sun, User } from "lucide-solid";
import type { Theme } from "../../types/ui";

type AppHeaderProps = {
  theme: Theme;
  onToggleTheme: () => void;
  showSidebarToggle?: boolean;
  onToggleSidebar?: () => void;
  showLogout?: boolean;
  onLogout?: () => void;
  onUserSettings?: () => void;
};

export function AppHeader(props: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = createSignal(false);
  let menuRef: HTMLDivElement | undefined;

  const handleDocumentClick = (event: MouseEvent) => {
    if (!menuRef) {
      return;
    }

    const targetNode = event.target;
    if (targetNode instanceof Node && !menuRef.contains(targetNode)) {
      setMenuOpen(false);
    }
  };

  document.addEventListener("mousedown", handleDocumentClick);
  onCleanup(() => {
    document.removeEventListener("mousedown", handleDocumentClick);
  });

  return (
    <div class="mb-6 flex items-center justify-between rounded-xl border border-slate-200/60 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/75">
      <div class="flex items-center gap-3">
        {props.showSidebarToggle && (
          <Button aria-label="Toggle sidebar" variant="neutral" class="px-3 py-2" onClick={props.onToggleSidebar} type="button">
            <Menu aria-hidden="true" class="h-4 w-4" stroke-width={2} />
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
            <Sun aria-hidden="true" class="h-4 w-4" stroke-width={2} />
          ) : (
            <Moon aria-hidden="true" class="h-4 w-4" stroke-width={2} />
          )}
        </Button>
        {props.showLogout && (
          <div class="relative" ref={menuRef}>
            <Button
              aria-expanded={menuOpen()}
              aria-label="Open user menu"
              aria-haspopup="menu"
              variant="neutral"
              class="flex items-center gap-1 px-3 py-2"
              onClick={() => setMenuOpen(!menuOpen())}
              type="button"
            >
              <User aria-hidden="true" class="h-4 w-4" stroke-width={2} />
              <ChevronDown aria-hidden="true" class={`h-4 w-4 transition ${menuOpen() ? "rotate-180" : ""}`} stroke-width={2} />
            </Button>

            {menuOpen() && (
              <div
                class="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-soft dark:border-slate-700 dark:bg-slate-900"
                role="menu"
              >
                <button
                  class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => {
                    props.onUserSettings?.();
                    setMenuOpen(false);
                  }}
                  role="menuitem"
                  type="button"
                >
                  <Settings aria-hidden="true" class="h-4 w-4" stroke-width={2} />
                  User Settings
                </button>
                <button
                  class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/20"
                  onClick={() => {
                    props.onLogout?.();
                    setMenuOpen(false);
                  }}
                  role="menuitem"
                  type="button"
                >
                  <LogOut aria-hidden="true" class="h-4 w-4" stroke-width={2} />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
