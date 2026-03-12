import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { vi } from "vitest";
import { ToastProvider, useToast } from "./ToastProvider";

function ToastHarness() {
  const { pushToast } = useToast();

  return (
    <button
      onClick={() =>
        pushToast({
          title: "Toast title",
          description: "Toast description",
          type: "info",
          durationMs: 1000,
        })
      }
      type="button"
    >
      Trigger Toast
    </button>
  );
}

describe("ToastProvider", () => {
  it("renders and dismisses toasts", async () => {
    vi.useFakeTimers();

    render(() => (
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Trigger Toast" }));
    expect(await screen.findByText("Toast title")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));

    await waitFor(() => {
      expect(screen.queryByText("Toast title")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Trigger Toast" }));
    expect(await screen.findByText("Toast title")).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(1000);

    await waitFor(() => {
      expect(screen.queryByText("Toast title")).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});
