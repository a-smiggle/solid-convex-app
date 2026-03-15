import { mutationGeneric } from "convex/server";
import { v } from "convex/values";

const settingsActionKeyValidator = v.union(
  v.literal("billing.upgrade"),
  v.literal("billing.updatePayment"),
  v.literal("billing.downloadInvoices"),
  v.literal("team.invite"),
  v.literal("team.manageRoles"),
  v.literal("integrations.connect"),
  v.literal("integrations.webhooks"),
  v.literal("security.enforce2fa"),
  v.literal("security.revokeSessions"),
  v.literal("notifications.save"),
  v.literal("notifications.sendTest"),
  v.literal("apiKeys.create"),
  v.literal("apiKeys.rotate"),
  v.literal("audit.export"),
  v.literal("audit.retention")
);

type Role = "owner" | "admin" | "billing" | "user";
type ActionKey =
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

const rolePermissions: Record<Role, Set<ActionKey>> = {
  owner: new Set<ActionKey>([
    "billing.upgrade",
    "billing.updatePayment",
    "billing.downloadInvoices",
    "team.invite",
    "team.manageRoles",
    "integrations.connect",
    "integrations.webhooks",
    "security.enforce2fa",
    "security.revokeSessions",
    "notifications.save",
    "notifications.sendTest",
    "apiKeys.create",
    "apiKeys.rotate",
    "audit.export",
    "audit.retention",
  ]),
  admin: new Set<ActionKey>([
    "billing.upgrade",
    "billing.updatePayment",
    "billing.downloadInvoices",
    "team.invite",
    "team.manageRoles",
    "integrations.connect",
    "integrations.webhooks",
    "security.enforce2fa",
    "security.revokeSessions",
    "notifications.save",
    "notifications.sendTest",
    "apiKeys.create",
    "apiKeys.rotate",
    "audit.export",
    "audit.retention",
  ]),
  billing: new Set<ActionKey>(["billing.upgrade", "billing.updatePayment", "billing.downloadInvoices"]),
  user: new Set<ActionKey>(),
};

function normalizeRole(input: string | undefined): Role {
  if (input === "owner" || input === "admin" || input === "billing" || input === "user") {
    return input;
  }

  return "user";
}

async function getUserAndSession(ctx: { db: any }, tokenInput: string) {
  const token = tokenInput.trim();
  if (!token) {
    return null;
  }

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .unique();
  if (!session || session.expiresAt < Date.now()) {
    return null;
  }

  const user = await ctx.db.get(session.userId);
  if (!user) {
    return null;
  }

  return { session, user };
}

async function getOrCreateWorkspaceForUser(ctx: { db: any }, user: any) {
  const memberships = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_user_id", (q: any) => q.eq("userId", user._id))
    .collect();

  const activeMembership = memberships.find((membership: any) => membership.status === "active") ?? memberships[0];
  if (activeMembership) {
    const workspace = await ctx.db.get(activeMembership.workspaceId);
    if (workspace) {
      return {
        workspace,
        role: normalizeRole(activeMembership.role),
      };
    }
  }

  const now = Date.now();
  const slugSeed = user.email.split("@")[0] ?? "workspace";
  const slug = `${slugSeed.toLowerCase().replace(/[^a-z0-9-]+/g, "-") || "workspace"}-${String(now).slice(-6)}`;

  const workspaceId = await ctx.db.insert("workspaces", {
    name: `${user.fullName}'s Workspace`,
    slug,
    ownerUserId: user._id,
    createdAt: now,
    updatedAt: now,
  });

  const createdRole = normalizeRole(user.role);

  await ctx.db.insert("workspaceMembers", {
    workspaceId,
    userId: user._id,
    role: createdRole,
    status: "active",
    addedAt: now,
    updatedAt: now,
  });

  const workspace = await ctx.db.get(workspaceId);
  return {
    workspace,
    role: createdRole,
  };
}

async function ensureWorkspaceSettingRows(ctx: { db: any }, workspaceId: any, userId: any) {
  const now = Date.now();

  const billing = await ctx.db
    .query("workspaceBillingSettings")
    .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceId))
    .unique();
  if (!billing) {
    await ctx.db.insert("workspaceBillingSettings", {
      workspaceId,
      plan: "Pro",
      currency: "USD",
      seatLimit: 15,
      billingEmail: "billing@example.com",
      autoPayEnabled: true,
      updatedByUserId: userId,
      updatedAt: now,
    });
  }

  const integrations = await ctx.db
    .query("workspaceIntegrationSettings")
    .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceId))
    .unique();
  if (!integrations) {
    await ctx.db.insert("workspaceIntegrationSettings", {
      workspaceId,
      slackConnected: true,
      stripeConnected: true,
      webhooksEnabled: true,
      updatedByUserId: userId,
      updatedAt: now,
    });
  }

  const security = await ctx.db
    .query("workspaceSecuritySettings")
    .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceId))
    .unique();
  if (!security) {
    await ctx.db.insert("workspaceSecuritySettings", {
      workspaceId,
      enforceTwoFactorForAdmins: true,
      sessionTimeoutMinutes: 720,
      allowApiKeys: true,
      updatedByUserId: userId,
      updatedAt: now,
    });
  }

  const notifications = await ctx.db
    .query("workspaceNotificationSettings")
    .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceId))
    .unique();
  if (!notifications) {
    await ctx.db.insert("workspaceNotificationSettings", {
      workspaceId,
      productUpdatesEmail: true,
      productUpdatesInApp: true,
      securityAlertsEmail: true,
      securityAlertsSlack: true,
      billingNoticesEmail: true,
      updatedByUserId: userId,
      updatedAt: now,
    });
  }
}

async function writeAuditLog(ctx: { db: any }, input: {
  workspaceId: any;
  actorUserId: any;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  return await ctx.db.insert("workspaceAuditLogs", {
    workspaceId: input.workspaceId,
    actorType: "user",
    actorUserId: input.actorUserId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    metadataJson: input.metadata ? JSON.stringify(input.metadata) : undefined,
    occurredAt: Date.now(),
  });
}

export const performSettingsAction = mutationGeneric({
  args: {
    token: v.string(),
    action: settingsActionKeyValidator,
    sourceTab: v.optional(v.string()),
  },
  returns: v.object({
    ok: v.literal(true),
    auditLogId: v.id("workspaceAuditLogs"),
  }),
  handler: async (ctx, args) => {
    const auth = await getUserAndSession(ctx, args.token);
    if (!auth) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    const workspaceCtx = await getOrCreateWorkspaceForUser(ctx, auth.user);
    if (!workspaceCtx.workspace) {
      throw new Error("Unable to access workspace settings right now.");
    }

    const role = workspaceCtx.role;
    if (!rolePermissions[role].has(args.action as ActionKey)) {
      throw new Error("You do not have permission to perform this settings action.");
    }

    await ensureWorkspaceSettingRows(ctx, workspaceCtx.workspace._id, auth.user._id);

    const now = Date.now();
    let auditLogId;

    if (args.action.startsWith("billing.")) {
      const billing = await ctx.db
        .query("workspaceBillingSettings")
        .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceCtx.workspace._id))
        .unique();

      if (!billing) {
        throw new Error("Unable to load billing settings.");
      }

      const nextValues =
        args.action === "billing.upgrade"
          ? { plan: billing.plan === "Pro" ? "Scale" : "Pro" }
          : args.action === "billing.updatePayment"
            ? { autoPayEnabled: !billing.autoPayEnabled }
            : {};

      await ctx.db.patch(billing._id, {
        ...nextValues,
        updatedByUserId: auth.user._id,
        updatedAt: now,
      });

      auditLogId = await writeAuditLog(ctx, {
        workspaceId: workspaceCtx.workspace._id,
        actorUserId: auth.user._id,
        action: args.action,
        targetType: "workspaceBillingSettings",
        targetId: String(billing._id),
        metadata: { sourceTab: args.sourceTab, ...nextValues },
      });
    } else if (args.action.startsWith("integrations.")) {
      const integrations = await ctx.db
        .query("workspaceIntegrationSettings")
        .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceCtx.workspace._id))
        .unique();

      if (!integrations) {
        throw new Error("Unable to load integration settings.");
      }

      const nextValues =
        args.action === "integrations.connect"
          ? { slackConnected: true, stripeConnected: true }
          : { webhooksEnabled: !integrations.webhooksEnabled };

      await ctx.db.patch(integrations._id, {
        ...nextValues,
        updatedByUserId: auth.user._id,
        updatedAt: now,
      });

      auditLogId = await writeAuditLog(ctx, {
        workspaceId: workspaceCtx.workspace._id,
        actorUserId: auth.user._id,
        action: args.action,
        targetType: "workspaceIntegrationSettings",
        targetId: String(integrations._id),
        metadata: { sourceTab: args.sourceTab, ...nextValues },
      });
    } else if (args.action.startsWith("security.")) {
      const security = await ctx.db
        .query("workspaceSecuritySettings")
        .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceCtx.workspace._id))
        .unique();

      if (!security) {
        throw new Error("Unable to load security settings.");
      }

      const nextValues =
        args.action === "security.enforce2fa"
          ? { enforceTwoFactorForAdmins: !security.enforceTwoFactorForAdmins }
          : { sessionTimeoutMinutes: security.sessionTimeoutMinutes === 720 ? 480 : 720 };

      await ctx.db.patch(security._id, {
        ...nextValues,
        updatedByUserId: auth.user._id,
        updatedAt: now,
      });

      auditLogId = await writeAuditLog(ctx, {
        workspaceId: workspaceCtx.workspace._id,
        actorUserId: auth.user._id,
        action: args.action,
        targetType: "workspaceSecuritySettings",
        targetId: String(security._id),
        metadata: { sourceTab: args.sourceTab, ...nextValues },
      });
    } else if (args.action.startsWith("notifications.")) {
      const notifications = await ctx.db
        .query("workspaceNotificationSettings")
        .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceCtx.workspace._id))
        .unique();

      if (!notifications) {
        throw new Error("Unable to load notification settings.");
      }

      const nextValues =
        args.action === "notifications.save"
          ? {
              productUpdatesEmail: !notifications.productUpdatesEmail,
              productUpdatesInApp: !notifications.productUpdatesInApp,
            }
          : {
              securityAlertsEmail: !notifications.securityAlertsEmail,
              securityAlertsSlack: !notifications.securityAlertsSlack,
            };

      await ctx.db.patch(notifications._id, {
        ...nextValues,
        updatedByUserId: auth.user._id,
        updatedAt: now,
      });

      auditLogId = await writeAuditLog(ctx, {
        workspaceId: workspaceCtx.workspace._id,
        actorUserId: auth.user._id,
        action: args.action,
        targetType: "workspaceNotificationSettings",
        targetId: String(notifications._id),
        metadata: { sourceTab: args.sourceTab, ...nextValues },
      });
    } else if (args.action.startsWith("apiKeys.")) {
      let targetId;

      if (args.action === "apiKeys.create") {
        const createdId = await ctx.db.insert("workspaceApiKeys", {
          workspaceId: workspaceCtx.workspace._id,
          name: `Key ${new Date(now).toISOString().slice(0, 10)}`,
          scope: ["read:all"],
          keyPrefix: `key_${Math.random().toString(36).slice(2, 10)}`,
          status: "active",
          createdByUserId: auth.user._id,
          createdAt: now,
        });
        targetId = String(createdId);
      } else {
        const activeKey = await ctx.db
          .query("workspaceApiKeys")
          .withIndex("by_workspace_status", (q: any) => q.eq("workspaceId", workspaceCtx.workspace._id).eq("status", "active"))
          .first();

        if (activeKey) {
          await ctx.db.patch(activeKey._id, {
            status: "revoked",
            revokedAt: now,
            revokedByUserId: auth.user._id,
          });
        }

        const rotatedId = await ctx.db.insert("workspaceApiKeys", {
          workspaceId: workspaceCtx.workspace._id,
          name: `Rotated ${new Date(now).toISOString().slice(0, 10)}`,
          scope: ["read:all"],
          keyPrefix: `key_${Math.random().toString(36).slice(2, 10)}`,
          status: "active",
          createdByUserId: auth.user._id,
          createdAt: now,
        });
        targetId = String(rotatedId);
      }

      auditLogId = await writeAuditLog(ctx, {
        workspaceId: workspaceCtx.workspace._id,
        actorUserId: auth.user._id,
        action: args.action,
        targetType: "workspaceApiKeys",
        targetId,
        metadata: { sourceTab: args.sourceTab },
      });
    } else if (args.action.startsWith("team.")) {
      const members = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceCtx.workspace._id))
        .collect();

      if (args.action === "team.manageRoles" && members.length > 0) {
        const candidate = members.find((member: any) => member.userId !== auth.user._id) ?? members[0];
        const nextRole: Role = candidate.role === "admin" ? "user" : "admin";
        await ctx.db.patch(candidate._id, {
          role: nextRole,
          updatedAt: now,
        });
      }

      auditLogId = await writeAuditLog(ctx, {
        workspaceId: workspaceCtx.workspace._id,
        actorUserId: auth.user._id,
        action: args.action,
        targetType: "workspaceMembers",
        metadata: { sourceTab: args.sourceTab },
      });
    } else {
      auditLogId = await writeAuditLog(ctx, {
        workspaceId: workspaceCtx.workspace._id,
        actorUserId: auth.user._id,
        action: args.action,
        targetType: "workspace",
        targetId: String(workspaceCtx.workspace._id),
        metadata: { sourceTab: args.sourceTab },
      });
    }

    return {
      ok: true as const,
      auditLogId,
    };
  },
});
