import { render, screen } from "@solidjs/testing-library";
import type { JSX } from "solid-js";
import { AppErrorBoundary } from "./AppErrorBoundary";

function CrashingComponent(): JSX.Element {
  throw new Error("Crash from test");
}

describe("AppErrorBoundary", () => {
  it("renders fallback UI when child throws", async () => {
    render(() => (
      <AppErrorBoundary>
        <CrashingComponent />
      </AppErrorBoundary>
    ));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Crash from test")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload app" })).toBeInTheDocument();
  });
});
