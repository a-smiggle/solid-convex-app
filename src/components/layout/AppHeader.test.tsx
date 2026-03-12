import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { AppHeader } from "./AppHeader";

describe("AppHeader menu interactions", () => {
  const baseProps = {
    theme: "light" as const,
    onToggleTheme: () => undefined,
    showLogout: true,
    onLogout: () => undefined,
    onUserSettings: () => undefined,
  };

  it("opens and closes user menu on click outside", async () => {
    render(() => <AppHeader {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Open user menu" }));
    expect(await screen.findByRole("menu")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("closes user menu when Escape is pressed", async () => {
    render(() => <AppHeader {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Open user menu" }));
    expect(await screen.findByRole("menu")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });
});
