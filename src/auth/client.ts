import { authApi } from "../convex/authApi";
import { getConvexClient, getConvexUrl } from "../convex/client";
import type { AuthResult, AuthUser } from "../types/auth";

export const AUTH_TOKEN_STORAGE_KEY = "auth-session-token";
export const AUTH_MOCK_USER_STORAGE_KEY = "auth-mock-user";
export const AUTH_GITHUB_STATE_STORAGE_KEY = "auth-github-oauth-state";

const isTestMode = import.meta.env.MODE === "test";

function readStoredToken() {
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

function storeSession(result: AuthResult) {
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, result.token);

  if (isTestMode) {
    window.localStorage.setItem(AUTH_MOCK_USER_STORAGE_KEY, JSON.stringify(result.user));
  }
}

function clearSession() {
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_MOCK_USER_STORAGE_KEY);
}

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function toSafeResetErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error) || !error.message.trim()) {
    return fallback;
  }

  if (
    error.message.includes("expired") ||
    error.message.includes("invalid") ||
    error.message.includes("already been used") ||
    error.message.includes("missing")
  ) {
    return error.message;
  }

  return fallback;
}

function readMockUser() {
  const rawUser = window.localStorage.getItem(AUTH_MOCK_USER_STORAGE_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawUser) as AuthUser;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (typeof parsed.id !== "string" || typeof parsed.email !== "string" || typeof parsed.fullName !== "string") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function ensureConvexAvailable() {
  const client = getConvexClient();
  if (client) {
    return client;
  }

  if (isTestMode) {
    return null;
  }

  if (!getConvexUrl()) {
    throw new Error("Convex URL is missing. Set VITE_CONVEX_URL (or CONVEX_URL) in .env.local.");
  }

  throw new Error("Unable to connect to Convex right now.");
}

function createMockAuthResult(email: string, fullName: string): AuthResult {
  const normalizedEmail = email.trim().toLowerCase();
  return {
    token: `test-token-${Date.now()}`,
    user: {
      id: "test-user",
      email: normalizedEmail,
      fullName: fullName.trim() || "Test User",
    },
  };
}

function randomStateToken() {
  const values = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
}

function readGitHubClientId() {
  const env = import.meta.env as ImportMetaEnv & {
    readonly GITHUB_CLIENT_ID?: string;
    readonly VITE_GITHUB_CLIENT_ID?: string;
  };

  return env.GITHUB_CLIENT_ID?.trim() || env.VITE_GITHUB_CLIENT_ID?.trim() || "";
}

function getGitHubRedirectUri() {
  const url = new URL(window.location.href);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function clearGitHubOAuthParams() {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  url.searchParams.delete("error");
  url.searchParams.delete("error_description");
  window.history.replaceState({}, "", url.toString());
}

export async function signUpWithEmailPassword(input: { fullName: string; email: string; password: string }) {
  const client = ensureConvexAvailable();

  if (!client) {
    const mockResult = createMockAuthResult(input.email, input.fullName);
    storeSession(mockResult);
    return mockResult.user;
  }

  try {
    const result = await client.mutation(authApi.signUp, input);
    storeSession(result);
    return result.user;
  } catch (error) {
    throw new Error(toErrorMessage(error, "Unable to create your account."));
  }
}

export async function signInWithEmailPassword(input: { email: string; password: string }) {
  const client = ensureConvexAvailable();

  if (!client) {
    const mockResult = createMockAuthResult(input.email, "Test User");
    storeSession(mockResult);
    return mockResult.user;
  }

  try {
    const result = await client.mutation(authApi.signIn, input);
    storeSession(result);
    return result.user;
  } catch (error) {
    throw new Error(toErrorMessage(error, "Unable to sign in with those credentials."));
  }
}

export async function restoreAuthSession() {
  const token = readStoredToken();
  if (!token) {
    return null;
  }

  const client = ensureConvexAvailable();
  if (!client) {
    return readMockUser();
  }

  try {
    const user = await client.query(authApi.getSession, { token });
    if (!user) {
      clearSession();
      return null;
    }

    return user;
  } catch {
    clearSession();
    return null;
  }
}

export async function signOutCurrentSession() {
  const token = readStoredToken();
  const client = getConvexClient();

  if (token && client) {
    try {
      await client.mutation(authApi.signOut, { token });
    } catch {
      // Best-effort cleanup: even if the backend request fails, clear local state.
    }
  }

  clearSession();
}

export async function requestPasswordResetEmail(email: string) {
  const client = ensureConvexAvailable();

  if (!client) {
    return;
  }

  try {
    await client.mutation(authApi.requestPasswordReset, { email });
  } catch (error) {
    throw new Error(toErrorMessage(error, "Unable to request a reset link right now."));
  }
}

export function startGitHubSignIn() {
  const clientId = readGitHubClientId();
  if (!clientId) {
    throw new Error("GitHub OAuth is not configured. Set GITHUB_CLIENT_ID.");
  }

  const state = randomStateToken();
  window.sessionStorage.setItem(AUTH_GITHUB_STATE_STORAGE_KEY, state);

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", getGitHubRedirectUri());
  authorizeUrl.searchParams.set("scope", "read:user user:email");
  authorizeUrl.searchParams.set("state", state);

  window.location.assign(authorizeUrl.toString());
}

export async function completeGitHubSignInFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code")?.trim() ?? "";
  const returnedState = params.get("state")?.trim() ?? "";
  const oauthError = params.get("error")?.trim();
  const oauthErrorDescription = params.get("error_description")?.trim();

  if (oauthError) {
    clearGitHubOAuthParams();
    throw new Error(oauthErrorDescription || "GitHub sign-in was cancelled or failed.");
  }

  if (!code) {
    return null;
  }

  const expectedState = window.sessionStorage.getItem(AUTH_GITHUB_STATE_STORAGE_KEY)?.trim() ?? "";
  window.sessionStorage.removeItem(AUTH_GITHUB_STATE_STORAGE_KEY);

  if (!returnedState || !expectedState || returnedState !== expectedState) {
    clearGitHubOAuthParams();
    throw new Error("GitHub sign-in could not be verified. Please try again.");
  }

  const client = ensureConvexAvailable();
  if (!client) {
    clearGitHubOAuthParams();
    const mockResult = createMockAuthResult("github@example.com", "GitHub User");
    storeSession(mockResult);
    return mockResult.user;
  }

  try {
    const result = await client.action(authApi.signInWithGitHub, {
      code,
      redirectUri: getGitHubRedirectUri(),
    });
    storeSession(result);
    clearGitHubOAuthParams();
    return result.user;
  } catch (error) {
    clearGitHubOAuthParams();
    throw new Error(toErrorMessage(error, "Unable to sign in with GitHub right now."));
  }
}

export async function verifyPasswordResetToken(token: string) {
  const normalizedToken = token.trim();
  if (!normalizedToken) {
    return {
      ok: false,
      reason: "missing_token",
    } as const;
  }

  const client = ensureConvexAvailable();
  if (!client) {
    return {
      ok: true,
    } as const;
  }

  try {
    return await client.query(authApi.verifyPasswordResetToken, { token: normalizedToken });
  } catch {
    return {
      ok: false,
      reason: "unknown",
    } as const;
  }
}

export async function completePasswordReset(input: { token: string; password: string }) {
  const client = ensureConvexAvailable();

  if (!client) {
    return;
  }

  try {
    await client.mutation(authApi.completePasswordReset, {
      token: input.token,
      password: input.password,
    });
  } catch (error) {
    throw new Error(toSafeResetErrorMessage(error, "Unable to reset your password right now. Please request a new link."));
  }
}