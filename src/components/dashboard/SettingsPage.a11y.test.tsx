import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { SettingsPage } from "./SettingsPage";
import type { SettingsTab } from "../../types/ui";
import { ToastProvider } from "../feedback/ToastProvider";
import type { AuthRole } from "../../types/auth";

function SettingsHarness(props: { role?: AuthRole }) {
  const [tab, setTab] = createSignal<SettingsTab>("billing");

  return (
    <ToastProvider>
      <SettingsPage role={props.role ?? "owner"} activeTab={tab()} onSelectTab={setTab} />
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
    expect(screen.getByRole("tab", { name: "Team" })).toHaveAttribute("aria-selected", "true");

    const teamTab = screen.getByRole("tab", { name: "Team" });
    fireEvent.keyDown(teamTab, { key: "End" });
    expect(screen.getByRole("tab", { name: "Audit Log" })).toHaveAttribute("aria-selected", "true");

    const auditTab = screen.getByRole("tab", { name: "Audit Log" });
    fireEvent.keyDown(auditTab, { key: "Home" });
    expect(screen.getByRole("tab", { name: "Billing" })).toHaveAttribute("aria-selected", "true");
  });

  it("limits billing role to billing settings tab", () => {
    render(() => <SettingsHarness role="billing" />);

    expect(screen.getByRole("tab", { name: "Billing" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Team" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Security" })).not.toBeInTheDocument();
  });

  it("shows no settings access for standard user role", () => {
    render(() => <SettingsHarness role="user" />);

    expect(screen.getByText("No settings access")).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Billing" })).not.toBeInTheDocument();
  });
});
