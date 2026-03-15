import type { AuthRole } from "../types/auth";
import type { DashboardTab, SettingsTab } from "../types/ui";

const allDashboardTabs: DashboardTab[] = ["dashboard", "content", "settings"];
const allSettingsTabs: SettingsTab[] = [
  "billing",
  "team",
  "integrations",
  "security",
  "notifications",
  "apiKeys",
  "auditLog",
];

const dashboardTabsByRole: Record<AuthRole, DashboardTab[]> = {
  owner: allDashboardTabs,
  admin: allDashboardTabs,
  billing: ["settings"],
  user: ["dashboard", "content"],
};

const settingsTabsByRole: Record<AuthRole, SettingsTab[]> = {
  owner: allSettingsTabs,
  admin: allSettingsTabs,
  billing: ["billing"],
  user: [],
};

export function normalizeAuthRole(input: string | undefined | null): AuthRole {
  if (input === "owner" || input === "admin" || input === "billing" || input === "user") {
    return input;
  }

  return "user";
}

export function getDashboardTabsForRole(role: AuthRole) {
  return dashboardTabsByRole[role];
}

export function getSettingsTabsForRole(role: AuthRole) {
  return settingsTabsByRole[role];
}

export function canAccessSettings(role: AuthRole) {
  return settingsTabsByRole[role].length > 0;
}

export function canAccessDashboardTab(role: AuthRole, tab: DashboardTab) {
  return dashboardTabsByRole[role].includes(tab);
}

export function canAccessSettingsTab(role: AuthRole, tab: SettingsTab) {
  return settingsTabsByRole[role].includes(tab);
}
