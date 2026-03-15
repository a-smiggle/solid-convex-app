import { ErrorBoundary, type ParentProps } from "solid-js";
import { Button } from "../ui/Button";

type AppErrorBoundaryProps = ParentProps;

export function AppErrorBoundary(props: AppErrorBoundaryProps) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <ErrorBoundary
      fallback={(error) => (
        <main class="app-shell-bg flex min-h-screen items-center justify-center px-4 py-10">
          <section class="surface-panel w-full max-w-lg p-6 shadow-soft sm:p-8" role="alert" aria-live="assertive">
            <h1 class="text-xl font-semibold">Something went wrong</h1>
            <p class="text-muted mt-2 text-sm">
              We hit an unexpected error while rendering this page. Try reloading, and if the issue continues please
              check logs.
            </p>
            <p class="text-danger mt-3 text-sm">{error.message || "Unexpected application error."}</p>
            <div class="mt-5 flex items-center gap-3">
              <Button type="button" onClick={handleReload}>
                Reload app
              </Button>
            </div>
          </section>
        </main>
      )}
    >
      {props.children}
    </ErrorBoundary>
  );
}
