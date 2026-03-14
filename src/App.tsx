import { Suspense, createEffect, createSignal, lazy, onMount } from "solid-js";
import { AppHeader } from "./components/layout/AppHeader";
import { AppFooter } from "./components/layout/AppFooter";
import { ToastProvider } from "./components/feedback/ToastProvider";
import { t } from "./i18n";
import { completeGitHubSignInFromUrl, restoreAuthSession, signOutCurrentSession } from "./auth/client";
import type { AuthUser } from "./types/auth";
import type { Screen, Theme } from "./types/ui";

const AuthPromo = lazy(() => import("./components/auth/AuthPromo").then((module) => ({ default: module.AuthPromo })));
const LoginScreen = lazy(() => import("./components/screens/LoginScreen").then((module) => ({ default: module.LoginScreen })));
const SignUpScreen = lazy(() => import("./components/screens/SignUpScreen").then((module) => ({ default: module.SignUpScreen })));
const ResetScreen = lazy(() => import("./components/screens/ResetScreen").then((module) => ({ default: module.ResetScreen })));
const DashboardScreen = lazy(() => import("./components/screens/DashboardScreen").then((module) => ({ default: module.DashboardScreen })));
const UserSettingsPage = lazy(() => import("./components/dashboard/UserSettingsPage").then((module) => ({ default: module.UserSettingsPage })));

const screenValues: Screen[] = ["login", "signup", "reset", "dashboard", "user-settings"];

function readResetTokenFromUrl(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = new URLSearchParams(window.location.search).get("resetToken");
  if (!token) {
    return null;
  }

  const normalizedToken = token.trim();
  return normalizedToken ? normalizedToken : null;
}

function isResetPathFromUrl() {
  if (typeof window === "undefined") {
    return false;
  }

  const pathname = window.location.pathname.toLowerCase();
  return pathname === "/reset" || pathname.startsWith("/reset/");
}

function updateResetTokenInUrl(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);

  if (token) {
    url.searchParams.set("resetToken", token);
  } else {
    url.searchParams.delete("resetToken");

    // Normalize back to app root after completing or cancelling reset flow.
    if (url.pathname.toLowerCase() === "/reset") {
      url.pathname = "/";
    }
  }

  window.history.replaceState({}, "", url.toString());
}

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

  if (readResetTokenFromUrl() || isResetPathFromUrl()) {
    return "reset";
  }

  const storedScreen = window.sessionStorage.getItem("ui-screen");
  if (storedScreen && screenValues.includes(storedScreen as Screen)) {
    return storedScreen as Screen;
  }

  return "login";
}

function App() {
  const [screen, setScreen] = createSignal<Screen>(getInitialScreen());
  const [resetToken, setResetToken] = createSignal<string | null>(readResetTokenFromUrl());
  const [theme, setTheme] = createSignal<Theme>("light");
  const [currentUser, setCurrentUser] = createSignal<AuthUser | null>(null);
  const [authReady, setAuthReady] = createSignal(false);
  const [sidebarCollapsed, setSidebarCollapsed] = createSignal(getInitialSidebarCollapsed());
  const [mobileSidebarOpen, setMobileSidebarOpen] = createSignal(false);
  const isAuthenticatedArea = () => (screen() === "dashboard" || screen() === "user-settings") && Boolean(currentUser());

  onMount(async () => {
    let user: AuthUser | null = null;

    try {
      user = await completeGitHubSignInFromUrl();
    } catch {
      user = null;
    }

    if (!user) {
      user = await restoreAuthSession();
    }

    setCurrentUser(user);
    setResetToken(readResetTokenFromUrl());

    if (resetToken() || isResetPathFromUrl()) {
      setScreen("reset");
    } else if (user) {
      setScreen("dashboard");
    } else if (screen() === "dashboard" || screen() === "user-settings") {
      setScreen("login");
    }

    setAuthReady(true);
  });

  const handleSidebarToggle = () => {
    if (screen() !== "dashboard" || !currentUser()) {
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

  createEffect(() => {
    if (!authReady()) {
      return;
    }

    if (!currentUser() && (screen() === "dashboard" || screen() === "user-settings")) {
      setScreen("login");
    }
  });

  const handleLogout = async () => {
    await signOutCurrentSession();
    setCurrentUser(null);
    setScreen("login");
  };

  const activeAuthScreen = () => (screen() === "dashboard" ? "login" : screen());

  return (
    <ToastProvider>
      <div class="app-shell-bg flex min-h-screen flex-col">
        <a class="surface-elevated sr-only skip-link px-3 py-2 text-sm font-semibold" href="#app-main-content">
          Skip to main content
        </a>
        <main
          class={`mx-auto flex min-h-0 w-full flex-1 flex-col px-4 py-5 sm:px-6 md:px-5 md:py-6 lg:px-8 ${
            isAuthenticatedArea() ? "max-w-none 2xl:max-w-[1600px]" : "max-w-6xl"
          }`}
        >
          <AppHeader
            theme={theme()}
            onToggleTheme={() => setTheme(theme() === "dark" ? "light" : "dark")}
            showSidebarToggle={screen() === "dashboard" && Boolean(currentUser())}
            onToggleSidebar={handleSidebarToggle}
            showLogout={isAuthenticatedArea()}
            onLogout={handleLogout}
            onUserSettings={() => setScreen("user-settings")}
          />

          <Suspense
            fallback={
              <div class="surface-panel text-subtle grid min-h-[420px] place-items-center text-sm shadow-soft">
                {t.app.loadingInterface}
              </div>
            }
          >
            {!authReady() ? (
              <div class="surface-panel text-subtle grid min-h-[420px] place-items-center text-sm shadow-soft" id="app-main-content" tabIndex={-1}>
                {t.app.loadingInterface}
              </div>
            ) : screen() === "login" || screen() === "signup" || screen() === "reset" ? (
              <section class="motion-enter-fade-up grid gap-6 lg:grid-cols-[1.1fr_1fr]" id="app-main-content" tabIndex={-1}>
                <AuthPromo />

                {activeAuthScreen() === "login" && (
                  <LoginScreen
                    onLogin={(user) => {
                      setCurrentUser(user);
                      setScreen("dashboard");
                    }}
                    onShowReset={() => setScreen("reset")}
                    onShowSignup={() => setScreen("signup")}
                  />
                )}

                {activeAuthScreen() === "signup" && (
                  <SignUpScreen
                    onBackToLogin={() => setScreen("login")}
                    onSignUp={(user) => {
                      setCurrentUser(user);
                      setScreen("dashboard");
                    }}
                  />
                )}

                {activeAuthScreen() === "reset" && (
                  <ResetScreen
                    resetToken={resetToken() ?? undefined}
                    onBackToLogin={() => {
                      setResetToken(null);
                      updateResetTokenInUrl(null);
                      setScreen("login");
                    }}
                    onResetComplete={() => {
                      setResetToken(null);
                      updateResetTokenInUrl(null);
                      setScreen("login");
                    }}
                  />
                )}
              </section>
            ) : screen() === "dashboard" ? (
              <div class="motion-enter-fade-up flex min-h-0 flex-1 flex-col" id="app-main-content" tabIndex={-1}>
                <DashboardScreen
                  sidebarCollapsed={sidebarCollapsed()}
                  mobileSidebarOpen={mobileSidebarOpen()}
                  onSetMobileSidebarOpen={setMobileSidebarOpen}
                />
              </div>
            ) : (
              <div class="motion-enter-fade-up flex min-h-0 flex-1 flex-col" id="app-main-content" tabIndex={-1}>
                {currentUser() && (
                  <UserSettingsPage
                    currentUser={currentUser()!}
                    onUserUpdated={(user) => setCurrentUser(user)}
                    onBackToDashboard={() => setScreen("dashboard")}
                  />
                )}
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
