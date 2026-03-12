import { For, Show, createContext, createSignal, onCleanup, useContext, type ParentProps } from "solid-js";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-solid";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  title: string;
  description?: string;
  type: ToastType;
};

type ToastInput = {
  title: string;
  description?: string;
  type?: ToastType;
  durationMs?: number;
};

type ToastContextValue = {
  pushToast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue>();

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

function typeStyles(type: ToastType) {
  if (type === "success") {
    return {
      icon: <CheckCircle2 class="h-4 w-4" stroke-width={2} aria-hidden="true" />,
      wrapper: "tone-success",
    };
  }

  if (type === "error") {
    return {
      icon: <TriangleAlert class="h-4 w-4" stroke-width={2} aria-hidden="true" />,
      wrapper: "tone-danger",
    };
  }

  return {
    icon: <Info class="h-4 w-4" stroke-width={2} aria-hidden="true" />,
    wrapper: "tone-info",
  };
}

export function ToastProvider(props: ParentProps) {
  const [toasts, setToasts] = createSignal<Toast[]>([]);
  let nextId = 1;
  const timeoutIds = new Set<number>();

  const removeToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const pushToast = (input: ToastInput) => {
    const id = nextId;
    nextId += 1;

    const toast: Toast = {
      id,
      title: input.title,
      description: input.description,
      type: input.type ?? "info",
    };

    setToasts((current) => [...current, toast]);

    const timeoutId = window.setTimeout(() => {
      removeToast(id);
      timeoutIds.delete(timeoutId);
    }, input.durationMs ?? 3000);

    timeoutIds.add(timeoutId);
  };

  onCleanup(() => {
    timeoutIds.forEach((id) => window.clearTimeout(id));
    timeoutIds.clear();
  });

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {props.children}

      <div class="pointer-events-none fixed inset-x-0 top-3 z-[70] flex justify-center px-3 sm:inset-x-auto sm:right-4 sm:top-4 sm:block sm:w-[24rem] sm:px-0">
        <div class="space-y-2">
          <For each={toasts()}>
            {(toast) => {
              const styles = typeStyles(toast.type);
              return (
                <article
                  aria-live="polite"
                  class={`pointer-events-auto w-full rounded-xl border p-3 shadow-soft transition ${styles.wrapper}`}
                  role="status"
                >
                  <div class="flex items-start gap-2">
                    <span class="mt-0.5">{styles.icon}</span>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-semibold">{toast.title}</p>
                      <Show when={toast.description}>
                        <p class="mt-0.5 text-xs opacity-90">{toast.description}</p>
                      </Show>
                    </div>
                    <button
                      aria-label="Dismiss notification"
                      class="interactive-item rounded-md p-1"
                      onClick={() => removeToast(toast.id)}
                      type="button"
                    >
                      <X class="h-4 w-4" stroke-width={2} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            }}
          </For>
        </div>
      </div>
    </ToastContext.Provider>
  );
}
