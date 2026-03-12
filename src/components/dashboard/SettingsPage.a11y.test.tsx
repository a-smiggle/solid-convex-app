import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { SettingsPage } from "./SettingsPage";
import type { SettingsTab } from "../../types/ui";
import { ToastProvider } from "../feedback/ToastProvider";

function SettingsHarness() {
  const [tab, setTab] = createSignal<SettingsTab>("billing");

  return (
    <ToastProvider>
      <SettingsPage activeTab={tab()} onSelectTab={setTab} />
    </ToastProvider>
  );
}

describe("SettingsPage accessibility", () => {
  it("renders semantic tabs and tabpanel linkage", async () => {
    render(() => <SettingsHarness />);

    expect(screen.getByRole("tablist", { name: "Settings sections" })).toBeInTheDocument();

    const billingTab = screen.getByRole("tab", { name: "Billing" });
    expect(billingTab).toHaveAttribute("aria-selected", "true");

    const billingPanel = await screen.findByRole("tabpanel", { name: "Billing" });
    expect(billingPanel).toHaveAttribute("id", "settings-panel-billing");
    expect(billingTab).toHaveAttribute("aria-controls", "settings-panel-billing");
  });

  it("supports keyboard arrow navigation across tabs", () => {
    render(() => <SettingsHarness />);

    const billingTab = screen.getByRole("tab", { name: "Billing" });
    billingTab.focus();

    fireEvent.keyDown(billingTab, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true");

    const profileTab = screen.getByRole("tab", { name: "Profile" });
    fireEvent.keyDown(profileTab, { key: "End" });
    expect(screen.getByRole("tab", { name: "Audit Log" })).toHaveAttribute("aria-selected", "true");

    const auditTab = screen.getByRole("tab", { name: "Audit Log" });
    fireEvent.keyDown(auditTab, { key: "Home" });
    expect(screen.getByRole("tab", { name: "Billing" })).toHaveAttribute("aria-selected", "true");
  });
});
