import { Suspense, createEffect, createSignal, lazy } from "solid-js";
import { AppHeader } from "./components/layout/AppHeader";
import { AppFooter } from "./components/layout/AppFooter";
import { ToastProvider } from "./components/feedback/ToastProvider";
import type { Screen, Theme } from "./types/ui";

const AuthPromo = lazy(() => import("./components/auth/AuthPromo").then((module) => ({ default: module.AuthPromo })));
const LoginScreen = lazy(() => import("./components/screens/LoginScreen").then((module) => ({ default: module.LoginScreen })));
const SignUpScreen = lazy(() => import("./components/screens/SignUpScreen").then((module) => ({ default: module.SignUpScreen })));
const ResetScreen = lazy(() => import("./components/screens/ResetScreen").then((module) => ({ default: module.ResetScreen })));
const DashboardScreen = lazy(() => import("./components/screens/DashboardScreen").then((module) => ({ default: module.DashboardScreen })));

const screenValues: Screen[] = ["login", "signup", "reset", "dashboard"];

function getInitialSidebarCollapsed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  // Keep sidebar compact by default on tablet widths.
  return window.matchMedia("(max-width: 1279px)").matches;
}

function getInitialScreen(): Screen {
  if (typeof window === "undefined") {
    return "login";
  }

  const storedScreen = window.sessionStorage.getItem("ui-screen");
  if (storedScreen && screenValues.includes(storedScreen as Screen)) {
    return storedScreen as Screen;
  }

  return "login";
}

function App() {
  const [screen, setScreen] = createSignal<Screen>(getInitialScreen());
  const [theme, setTheme] = createSignal<Theme>("light");
  const [sidebarCollapsed, setSidebarCollapsed] = createSignal(getInitialSidebarCollapsed());
  const [mobileSidebarOpen, setMobileSidebarOpen] = createSignal(false);
  const isDashboard = () => screen() === "dashboard";

  const handleSidebarToggle = () => {
    if (!isDashboard()) {
      return;
    }

    if (window.matchMedia("(min-width: 768px)").matches) {
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

  createEffect(() => {
    window.sessionStorage.setItem("ui-screen", screen());
  });

  return (
    <ToastProvider>
      <div class="app-shell-bg flex min-h-screen flex-col">
        <a class="surface-elevated sr-only skip-link px-3 py-2 text-sm font-semibold" href="#app-main-content">
          Skip to main content
        </a>
        <main
          class={`mx-auto flex min-h-0 w-full flex-1 flex-col px-4 py-5 sm:px-6 md:px-5 md:py-6 lg:px-8 ${
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

          <Suspense
            fallback={
              <div class="surface-panel text-subtle grid min-h-[420px] place-items-center text-sm shadow-soft">
                Loading interface...
              </div>
            }
          >
            {screen() !== "dashboard" ? (
              <section class="grid gap-6 lg:grid-cols-[1.1fr_1fr]" id="app-main-content" tabIndex={-1}>
                <AuthPromo />

                {screen() === "login" && (
                  <LoginScreen
                    onLogin={() => setScreen("dashboard")}
                    onShowReset={() => setScreen("reset")}
                    onShowSignup={() => setScreen("signup")}
                  />
                )}

                {screen() === "signup" && <SignUpScreen onBackToLogin={() => setScreen("login")} />}

                {screen() === "reset" && <ResetScreen onBackToLogin={() => setScreen("login")} />}
              </section>
            ) : (
              <div class="flex min-h-0 flex-1 flex-col" id="app-main-content" tabIndex={-1}>
                <DashboardScreen
                  sidebarCollapsed={sidebarCollapsed()}
                  mobileSidebarOpen={mobileSidebarOpen()}
                  onSetMobileSidebarOpen={setMobileSidebarOpen}
                />
              </div>
            )}
          </Suspense>
        </main>
        <AppFooter />
      </div>
    </ToastProvider>
  );
}

export default App;
