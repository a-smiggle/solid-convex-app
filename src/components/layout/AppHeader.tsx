import { createEffect, createSignal, onCleanup } from "solid-js";
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
  const menuId = "user-menu";

  const handleDocumentClick = (event: MouseEvent) => {
    if (!menuRef) {
      return;
    }

    const targetNode = event.target;
    if (targetNode instanceof Node && !menuRef.contains(targetNode)) {
      setMenuOpen(false);
    }
  };

  const handleDocumentKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  };

  createEffect(() => {
    if (!menuOpen()) {
      return;
    }

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeyDown);
    onCleanup(() => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    });
  });

  return (
    <div class="motion-enter-fade motion-surface surface-elevated relative z-40 mb-5 flex flex-wrap items-center justify-between gap-3 px-3 py-3 backdrop-blur sm:mb-6 sm:px-4 md:flex-nowrap">
      <div class="flex min-w-0 items-center gap-2.5 sm:gap-3">
        {props.showSidebarToggle && (
          <Button aria-label="Toggle sidebar" variant="neutral" class="px-3 py-2" onClick={props.onToggleSidebar} type="button">
            <Menu aria-hidden="true" class="h-4 w-4" stroke-width={2} />
          </Button>
        )}
        <div class="min-w-0">
          <p class="text-subtle text-xs uppercase tracking-[0.22em]">Solid + Convex</p>
          <h1 class="truncate text-base font-semibold sm:text-lg">Starter UI Scaffold</h1>
        </div>
      </div>
      <div class="flex items-center gap-2 self-end md:self-auto">
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
              aria-controls={menuId}
              aria-expanded={menuOpen()}
              aria-label="Open user menu"
              aria-haspopup="menu"
              variant="neutral"
              class="flex items-center gap-1 px-3 py-2"
              onClick={() => setMenuOpen(!menuOpen())}
              type="button"
            >
              <User aria-hidden="true" class="h-4 w-4" stroke-width={2} />
              <ChevronDown aria-hidden="true" class={`motion-transition h-4 w-4 ${menuOpen() ? "rotate-180" : ""}`} stroke-width={2} />
            </Button>

            {menuOpen() && (
              <div
                id={menuId}
                class="motion-enter-slide-down motion-surface surface-flyout absolute right-0 z-[90] mt-2 w-48 p-1.5 shadow-soft"
                role="menu"
              >
                <button
                  class="interactive-item flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm"
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
                  class="interactive-item interactive-item-danger flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm"
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
