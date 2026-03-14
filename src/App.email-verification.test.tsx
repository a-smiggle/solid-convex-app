import { render, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const { completeEmailVerificationFromUrlMock, completeGitHubSignInFromUrlMock, restoreAuthSessionMock } = vi.hoisted(() => ({
  completeEmailVerificationFromUrlMock: vi.fn(),
  completeGitHubSignInFromUrlMock: vi.fn(),
  restoreAuthSessionMock: vi.fn(),
}));

vi.mock("./auth/client", async () => {
  const actual = await vi.importActual<typeof import("./auth/client")>("./auth/client");

  return {
    ...actual,
    completeEmailVerificationFromUrl: completeEmailVerificationFromUrlMock,
    completeGitHubSignInFromUrl: completeGitHubSignInFromUrlMock,
    restoreAuthSession: restoreAuthSessionMock,
    signOutCurrentSession: vi.fn(),
  };
});

describe("App email verification bootstrap", () => {
  beforeEach(() => {
    completeEmailVerificationFromUrlMock.mockReset();
    completeGitHubSignInFromUrlMock.mockReset();
    restoreAuthSessionMock.mockReset();

    completeEmailVerificationFromUrlMock.mockResolvedValue(false);
    completeGitHubSignInFromUrlMock.mockResolvedValue(null);
    restoreAuthSessionMock.mockResolvedValue(null);
  });

  it("attempts email verification completion before restoring auth session", async () => {
    render(() => <App />);

    await waitFor(() => {
      expect(completeEmailVerificationFromUrlMock).toHaveBeenCalledTimes(1);
      expect(restoreAuthSessionMock).toHaveBeenCalledTimes(1);
    });

    expect(completeEmailVerificationFromUrlMock.mock.invocationCallOrder[0]).toBeLessThan(
      restoreAuthSessionMock.mock.invocationCallOrder[0]
    );
  });
});
