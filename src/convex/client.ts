import { ConvexHttpClient } from "convex/browser";

type ConvexEnv = ImportMetaEnv & {
  readonly VITE_CONVEX_URL?: string;
  readonly CONVEX_URL?: string;
};

const env = import.meta.env as ConvexEnv;
const convexUrl = (env.VITE_CONVEX_URL ?? env.CONVEX_URL ?? "").trim();
const isTestMode = env.MODE === "test";

let convexClient: ConvexHttpClient | null = null;

export function getConvexUrl() {
  return convexUrl;
}

export function getConvexClient() {
  if (isTestMode || !convexUrl) {
    return null;
  }

  if (!convexClient) {
    convexClient = new ConvexHttpClient(convexUrl);
  }

  return convexClient;
}