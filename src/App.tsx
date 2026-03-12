import { createEffect, createSignal, Show } from "solid-js";
import { AppHeader } from "./components/layout/AppHeader";
import { AppFooter } from "./components/layout/AppFooter";
import { AuthPromo } from "./components/auth/AuthPromo";
import { LoginScreen } from "./components/screens/LoginScreen";
import { SignUpScreen } from "./components/screens/SignUpScreen";
import { ResetScreen } from "./components/screens/ResetScreen";
import { DashboardScreen } from "./components/screens/DashboardScreen";
import type { Screen, Theme } from "./types/ui";

function App() {
  const [screen, setScreen] = createSignal<Screen>("login");
  const [theme, setTheme] = createSignal<Theme>("light");
  const [sidebarCollapsed, setSidebarCollapsed] = createSignal(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = createSignal(false);
  const isDashboard = () => screen() === "dashboard";

  const handleSidebarToggle = () => {
    if (!isDashboard()) {
      return;
    }

    if (window.matchMedia("(min-width: 1024px)").matches) {
      setSidebarCollapsed(!sidebarCollapsed());
      return;
    }

    setMobileSidebarOpen(!mobileSidebarOpen());
  };

  createEffect(() => {
    const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("ui-theme");
    const initialTheme = savedTheme === "dark" || (!savedTheme && preferredDark) ? "dark" : "light";
    setTheme(initialTheme);
  });

  createEffect(() => {
    const root = document.documentElement;
    const currentTheme = theme();
    root.classList.toggle("dark", currentTheme === "dark");
    localStorage.setItem("ui-theme", currentTheme);
  });

  return (
    <div class="flex min-h-screen flex-col bg-gradient-to-b from-cyan-50 via-white to-amber-50 bg-hero-grid [background-size:24px_24px] dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <main
        class={`mx-auto flex min-h-0 w-full flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8 ${
          isDashboard() ? "max-w-none 2xl:max-w-[1600px]" : "max-w-6xl"
        }`}
      >
        <AppHeader
          theme={theme()}
          onToggleTheme={() => setTheme(theme() === "dark" ? "light" : "dark")}
          showSidebarToggle={isDashboard()}
          onToggleSidebar={handleSidebarToggle}
          showLogout={isDashboard()}
          onLogout={() => setScreen("login")}
        />

        <Show when={screen() !== "dashboard"}>
          <section class="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <AuthPromo />

            <Show when={screen() === "login"}>
              <LoginScreen
                onLogin={() => setScreen("dashboard")}
                onShowReset={() => setScreen("reset")}
                onShowSignup={() => setScreen("signup")}
              />
            </Show>

            <Show when={screen() === "signup"}>
              <SignUpScreen onBackToLogin={() => setScreen("login")} />
            </Show>

            <Show when={screen() === "reset"}>
              <ResetScreen onBackToLogin={() => setScreen("login")} />
            </Show>
          </section>
        </Show>

        <Show when={screen() === "dashboard"}>
          <div class="flex min-h-0 flex-1 flex-col">
            <DashboardScreen
              sidebarCollapsed={sidebarCollapsed()}
              mobileSidebarOpen={mobileSidebarOpen()}
              onSetMobileSidebarOpen={setMobileSidebarOpen}
            />
          </div>
        </Show>
      </main>
      <AppFooter />
    </div>
  );
}

export default App;
