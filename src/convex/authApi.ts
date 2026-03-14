import type { DefaultFunctionArgs, FunctionReference } from "convex/server";
import type { AuthResult, AuthUser } from "../types/auth";

type PublicQuery<Args extends DefaultFunctionArgs, ReturnValue> = FunctionReference<"query", "public", Args, ReturnValue>;
type PublicMutation<Args extends DefaultFunctionArgs, ReturnValue> = FunctionReference<"mutation", "public", Args, ReturnValue>;
type PublicAction<Args extends DefaultFunctionArgs, ReturnValue> = FunctionReference<"action", "public", Args, ReturnValue>;

export const authApi = {
  signUp: "auth:signUp" as unknown as PublicMutation<{ fullName: string; email: string; password: string }, AuthResult>,
  signIn: "auth:signIn" as unknown as PublicMutation<{ email: string; password: string }, AuthResult>,
  getSession: "auth:getSession" as unknown as PublicQuery<{ token: string }, AuthUser | null>,
  getUserSettings: "auth:getUserSettings" as unknown as PublicQuery<{ token: string }, { email: string; fullName: string; githubLinked: boolean } | null>,
  signOut: "auth:signOut" as unknown as PublicMutation<{ token: string }, null>,
  updateCurrentUserProfile: "auth:updateCurrentUserProfile" as unknown as PublicMutation<{ token: string; fullName: string }, AuthUser>,
  changeCurrentUserPassword: "auth:changeCurrentUserPassword" as unknown as PublicMutation<
    { token: string; currentPassword: string; newPassword: string },
    null
  >,
  requestPasswordReset: "auth:requestPasswordReset" as unknown as PublicMutation<{ email: string }, null>,
  verifyPasswordResetToken: "auth:verifyPasswordResetToken" as unknown as PublicQuery<
    { token: string },
    { ok: true } | { ok: false; reason: string }
  >,
  completePasswordReset: "auth:completePasswordReset" as unknown as PublicMutation<{ token: string; password: string }, null>,
  signInWithGitHub: "auth:signInWithGitHub" as unknown as PublicAction<{ code: string; redirectUri: string }, AuthResult>,
};