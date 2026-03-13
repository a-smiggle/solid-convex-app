import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { vi } from "vitest";
import { ToastProvider } from "../feedback/ToastProvider";
import { LoginScreen } from "./LoginScreen";
import { SignUpScreen } from "./SignUpScreen";
import { ResetScreen } from "./ResetScreen";

const { startGitHubSignInMock } = vi.hoisted(() => ({
  startGitHubSignInMock: vi.fn(),
}));

vi.mock("../../auth/client", async () => {
  const actual = await vi.importActual<typeof import("../../auth/client")>("../../auth/client");

  return {
    ...actual,
    startGitHubSignIn: startGitHubSignInMock,
  };
});

describe("Auth screen flows", () => {
  beforeEach(() => {
    startGitHubSignInMock.mockReset();
  });

  it("shows login validation errors and blocks submit when form is invalid", async () => {
    const onLogin = vi.fn();

    render(() => (
      <ToastProvider>
        <LoginScreen onLogin={onLogin} onShowReset={() => undefined} onShowSignup={() => undefined} />
      </ToastProvider>
    ));

    fireEvent.submit(screen.getByRole("button", { name: "Login" }).closest("form") as HTMLFormElement);

    expect(await screen.findByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("submits login flow when form is valid", async () => {
    const onLogin = vi.fn();

    render(() => (
      <ToastProvider>
        <LoginScreen onLogin={onLogin} onShowReset={() => undefined} onShowSignup={() => undefined} />
      </ToastProvider>
    ));

    fireEvent.input(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
    fireEvent.input(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: "Login" }).closest("form") as HTMLFormElement);

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledTimes(1);
    });
  });

  it("shows signup inline success on valid data", async () => {
    render(() => (
      <ToastProvider>
        <SignUpScreen onBackToLogin={() => undefined} onSignUp={() => undefined} />
      </ToastProvider>
    ));

    fireEvent.input(screen.getByLabelText("Full Name"), { target: { value: "Jamie Doe" } });
    fireEvent.input(screen.getByLabelText("Work Email"), { target: { value: "jamie@company.com" } });
    fireEvent.input(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByText(/Redirecting to your dashboard/i)).toBeInTheDocument();
  });

  it("shows reset inline success on valid email", async () => {
    render(() => (
      <ToastProvider>
        <ResetScreen onBackToLogin={() => undefined} />
      </ToastProvider>
    ));

    fireEvent.input(screen.getByLabelText("Account Email"), { target: { value: "user@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Reset Link" }));

    expect(await screen.findByText(/Reset link sent/i)).toBeInTheDocument();
  });

  it("starts GitHub sign-in flow when clicking the GitHub button", async () => {
    render(() => (
      <ToastProvider>
        <LoginScreen onLogin={() => undefined} onShowReset={() => undefined} onShowSignup={() => undefined} />
      </ToastProvider>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Continue with GitHub" }));

    expect(startGitHubSignInMock).toHaveBeenCalledTimes(1);
  });

  it("shows toast when GitHub sign-in cannot start", async () => {
    startGitHubSignInMock.mockImplementation(() => {
      throw new Error("GitHub OAuth is not configured. Set GITHUB_CLIENT_ID.");
    });

    render(() => (
      <ToastProvider>
        <LoginScreen onLogin={() => undefined} onShowReset={() => undefined} onShowSignup={() => undefined} />
      </ToastProvider>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Continue with GitHub" }));

    expect(await screen.findByText("GitHub OAuth is not configured. Set GITHUB_CLIENT_ID.")).toBeInTheDocument();
  });
});
