import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "../feedback/ToastProvider";
import { ResetScreen } from "./ResetScreen";

const { verifyPasswordResetTokenMock, completePasswordResetMock } = vi.hoisted(() => ({
  verifyPasswordResetTokenMock: vi.fn(),
  completePasswordResetMock: vi.fn(),
}));

vi.mock("../../auth/client", async () => {
  const actual = await vi.importActual<typeof import("../../auth/client")>("../../auth/client");

  return {
    ...actual,
    verifyPasswordResetToken: verifyPasswordResetTokenMock,
    completePasswordReset: completePasswordResetMock,
  };
});

describe("Reset completion flow", () => {
  beforeEach(() => {
    verifyPasswordResetTokenMock.mockReset();
    completePasswordResetMock.mockReset();
    verifyPasswordResetTokenMock.mockResolvedValue({ ok: true });
  });

  it("shows an expired token message when token verification fails", async () => {
    verifyPasswordResetTokenMock.mockResolvedValue({ ok: false, reason: "expired_token" });

    render(() => (
      <ToastProvider>
        <ResetScreen resetToken="expired-token" onBackToLogin={() => undefined} />
      </ToastProvider>
    ));

    expect(await screen.findByText("This reset link has expired.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update Password" })).toBeDisabled();
  });

  it("submits a new password when token is valid", async () => {
    render(() => (
      <ToastProvider>
        <ResetScreen resetToken="valid-token" onBackToLogin={() => undefined} />
      </ToastProvider>
    ));

    fireEvent.input(screen.getByLabelText("New Password"), { target: { value: "password123" } });
    fireEvent.input(screen.getByLabelText("Confirm Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));

    await waitFor(() => {
      expect(completePasswordResetMock).toHaveBeenCalledWith({ token: "valid-token", password: "password123" });
    });

    expect(await screen.findByText("Password updated. You can now sign in.")).toBeInTheDocument();
  });

  it("surfaces one-time token reuse errors returned by completion", async () => {
    completePasswordResetMock.mockRejectedValue(new Error("This reset link has already been used."));

    render(() => (
      <ToastProvider>
        <ResetScreen resetToken="used-token" onBackToLogin={() => undefined} />
      </ToastProvider>
    ));

    fireEvent.input(screen.getByLabelText("New Password"), { target: { value: "password123" } });
    fireEvent.input(screen.getByLabelText("Confirm Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));

    expect(await screen.findByText("This reset link has already been used.")).toBeInTheDocument();
  });
});
