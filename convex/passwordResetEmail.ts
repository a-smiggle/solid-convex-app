"use node";

import { internalActionGeneric } from "convex/server";
import { v } from "convex/values";

function readEnv(name: string) {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  const value = env?.[name];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function buildMessage(appName: string, resetUrl: string | undefined) {
  const subject = `${appName} password reset request`;

  if (resetUrl) {
    const text = [
      `A password reset was requested for your ${appName} account.`,
      "",
      "Use this link to continue:",
      resetUrl,
      "",
      "If you did not request this, you can ignore this message.",
    ].join("\n");

    const html = [
      `<p>A password reset was requested for your ${appName} account.</p>`,
      `<p><a href=\"${resetUrl}\">Reset your password</a></p>`,
      `<p>If you did not request this, you can ignore this message.</p>`,
    ].join("");

    return { subject, text, html };
  }

  const text = [
    `A password reset was requested for your ${appName} account.`,
    "",
    "No reset URL is configured yet, so this email is informational only.",
    "Set RESET_PASSWORD_URL in Convex env vars to include a clickable reset link.",
    "",
    "If you did not request this, you can ignore this message.",
  ].join("\n");

  const html = [
    `<p>A password reset was requested for your ${appName} account.</p>`,
    "<p>No reset URL is configured yet, so this email is informational only.</p>",
    "<p>Set <code>RESET_PASSWORD_URL</code> in Convex env vars to include a clickable reset link.</p>",
    "<p>If you did not request this, you can ignore this message.</p>",
  ].join("");

  return { subject, text, html };
}

export const sendPasswordResetEmail = internalActionGeneric({
  args: {
    email: v.string(),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const apiKey = readEnv("RESEND_API_KEY");
    if (!apiKey) {
      console.warn("[auth] RESEND_API_KEY is missing; skipping password reset email delivery.");
      return null;
    }

    const from = readEnv("RESET_EMAIL_FROM") ?? "onboarding@resend.dev";
    const appName = readEnv("RESET_EMAIL_APP_NAME") ?? "Solid + Convex";
    const resetUrl = readEnv("RESET_PASSWORD_URL");
    const recipient = args.email.trim().toLowerCase();
    const message = buildMessage(appName, resetUrl);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[auth] Failed to send password reset email (${response.status}): ${errorBody}`);
    }

    return null;
  },
});