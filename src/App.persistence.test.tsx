import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import App from "./App";
import { AUTH_MOCK_USER_STORAGE_KEY, AUTH_TOKEN_STORAGE_KEY } from "./auth/client";

describe("App persistence", () => {
  it("hydrates dashboard when ui-screen and auth session are stored", async () => {
    window.sessionStorage.setItem("ui-screen", "dashboard");
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "test-token");
    window.localStorage.setItem(
      AUTH_MOCK_USER_STORAGE_KEY,
      JSON.stringify({
        id: "test-user",
        email: "user@example.com",
        fullName: "Test User",
      })
    );

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
