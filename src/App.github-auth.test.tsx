import { render, screen, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const { completeGitHubSignInFromUrlMock, restoreAuthSessionMock } = vi.hoisted(() => ({
  completeGitHubSignInFromUrlMock: vi.fn(),
  restoreAuthSessionMock: vi.fn(),
}));

vi.mock("./auth/client", async () => {
  const actual = await vi.importActual<typeof import("./auth/client")>("./auth/client");

  return {
    ...actual,
    completeGitHubSignInFromUrl: completeGitHubSignInFromUrlMock,
    restoreAuthSession: restoreAuthSessionMock,
    signOutCurrentSession: vi.fn(),
  };
});

describe("App GitHub auth bootstrap", () => {
  beforeEach(() => {
    completeGitHubSignInFromUrlMock.mockReset();
    restoreAuthSessionMock.mockReset();
    restoreAuthSessionMock.mockResolvedValue(null);
  });

  it("shows dashboard when GitHub callback signs a user in", async () => {
    completeGitHubSignInFromUrlMock.mockResolvedValue({
      id: "github-user",
      email: "github@example.com",
      fullName: "GitHub User",
      role: "user",
    });

    render(() => <App />);

    expect(await screen.findByText("Manage your product data and workspace from one place.")).toBeInTheDocument();
    expect(restoreAuthSessionMock).not.toHaveBeenCalled();
  });

  it("falls back to restoreAuthSession when GitHub callback fails", async () => {
    completeGitHubSignInFromUrlMock.mockRejectedValue(new Error("OAuth failed"));
    restoreAuthSessionMock.mockResolvedValue(null);

    render(() => <App />);

    expect(await screen.findByRole("heading", { name: "Login" })).toBeInTheDocument();

    await waitFor(() => {
      expect(restoreAuthSessionMock).toHaveBeenCalledTimes(1);
    });
  });
});
