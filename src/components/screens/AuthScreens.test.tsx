import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { vi } from "vitest";
import { ToastProvider } from "../feedback/ToastProvider";
import { LoginScreen } from "./LoginScreen";
import { SignUpScreen } from "./SignUpScreen";
import { ResetScreen } from "./ResetScreen";

describe("Auth screen flows", () => {
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
    vi.useFakeTimers();
    const onLogin = vi.fn();

    render(() => (
      <ToastProvider>
        <LoginScreen onLogin={onLogin} onShowReset={() => undefined} onShowSignup={() => undefined} />
      </ToastProvider>
    ));

    fireEvent.input(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
    fireEvent.input(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: "Login" }).closest("form") as HTMLFormElement);

    await vi.advanceTimersByTimeAsync(500);

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledTimes(1);
    });

    vi.useRealTimers();
  });

  it("shows signup inline success on valid data", async () => {
    render(() => (
      <ToastProvider>
        <SignUpScreen onBackToLogin={() => undefined} />
      </ToastProvider>
    ));

    fireEvent.input(screen.getByLabelText("Full Name"), { target: { value: "Jamie Doe" } });
    fireEvent.input(screen.getByLabelText("Work Email"), { target: { value: "jamie@company.com" } });
    fireEvent.input(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByText(/Account details look good/i)).toBeInTheDocument();
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
});
