export type RunApiActionOptions = {
  fallbackMessage: string;
  retries?: number;
};

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function getUserSafeErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export async function runApiAction<T>(action: () => Promise<T>, options: RunApiActionOptions): Promise<T> {
  const retries = Math.max(0, options.retries ?? 0);
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        // Minimal backoff keeps retries deterministic in UI tests and responsive in dev.
        await wait(120 * (attempt + 1));
      }
    }
  }

  throw new Error(getUserSafeErrorMessage(lastError, options.fallbackMessage));
}
