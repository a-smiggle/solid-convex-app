import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import App from "./App";

describe("App persistence", () => {
  it("hydrates dashboard when ui-screen is stored in sessionStorage", async () => {
    window.sessionStorage.setItem("ui-screen", "dashboard");

    render(() => <App />);

    expect(await screen.findByText("Manage your product data and workspace from one place.")).toBeInTheDocument();
  });

  it("applies dark theme when ui-theme is stored in localStorage", async () => {
    window.localStorage.setItem("ui-theme", "dark");

    render(() => <App />);

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  it("persists screen changes to sessionStorage during auth navigation", async () => {
    render(() => <App />);

    fireEvent.click(await screen.findByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(window.sessionStorage.getItem("ui-screen")).toBe("signup");
    });
  });
});
