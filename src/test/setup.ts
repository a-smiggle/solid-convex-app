import "@testing-library/jest-dom/vitest";
import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";

function createStorageMock() {
  const storage = new Map<string, string>();

  return {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
    key: (index: number) => Array.from(storage.keys())[index] ?? null,
    get length() {
      return storage.size;
    },
  };
}

Object.defineProperty(window, "localStorage", {
  writable: true,
  value: createStorageMock(),
});

Object.defineProperty(window, "sessionStorage", {
  writable: true,
  value: createStorageMock(),
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {
      // Deprecated but referenced by some libs.
    },
    removeListener: () => {
      // Deprecated but referenced by some libs.
    },
    addEventListener: () => {
      // No-op for tests.
    },
    removeEventListener: () => {
      // No-op for tests.
    },
    dispatchEvent: () => false,
  }),
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  document.documentElement.classList.remove("dark");
});
