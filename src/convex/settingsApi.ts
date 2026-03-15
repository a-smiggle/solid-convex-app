import type { DefaultFunctionArgs, FunctionReference } from "convex/server";

type PublicMutation<Args extends DefaultFunctionArgs, ReturnValue> = FunctionReference<
  "mutation",
  "public",
  Args,
  ReturnValue
>;

export type SettingsActionKey =
  | "billing.upgrade"
  | "billing.updatePayment"
  | "billing.downloadInvoices"
  | "team.invite"
  | "team.manageRoles"
  | "integrations.connect"
  | "integrations.webhooks"
  | "security.enforce2fa"
  | "security.revokeSessions"
  | "notifications.save"
  | "notifications.sendTest"
  | "apiKeys.create"
  | "apiKeys.rotate"
  | "audit.export"
  | "audit.retention";

export const settingsApi = {
  performSettingsAction: "settings:performSettingsAction" as unknown as PublicMutation<
    {
      token: string;
      action: SettingsActionKey;
      sourceTab?: string;
    },
    {
      ok: true;
      auditLogId: string;
    }
  >,
};
