import { Match, Show, Switch, createMemo, createResource, createSignal } from "solid-js";
import { AuthCard } from "../ui/AuthCard";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import { useToast } from "../feedback/ToastProvider";
import { t } from "../../i18n";
import { completePasswordReset, requestPasswordResetEmail, verifyPasswordResetToken } from "../../auth/client";

type ResetScreenProps = {
  onBackToLogin: () => void;
  resetToken?: string;
  onResetComplete?: () => void;
};

export function ResetScreen(props: ResetScreenProps) {
  const activeResetToken = () => props.resetToken?.trim() ?? "";
  const inCompletionFlow = () => activeResetToken().length > 0;
  const { pushToast } = useToast();
  const [email, setEmail] = createSignal("");
  const [submitted, setSubmitted] = createSignal(false);
  const [emailSent, setEmailSent] = createSignal(false);
  const [newPassword, setNewPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [completeSubmitted, setCompleteSubmitted] = createSignal(false);
  const [passwordUpdated, setPasswordUpdated] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);

  const [tokenStatus] = createResource(
    () => activeResetToken(),
    async (token) => {
      if (!token) {
        return { ok: false, reason: "missing_token" } as const;
      }

      return verifyPasswordResetToken(token);
    }
  );

  const emailError = createMemo(() => {
    if (!submitted()) {
      return "";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email()) ? "" : "Enter a valid account email.";
  });

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setSubmitted(true);

    if (emailError()) {
      pushToast({
        type: "error",
        title: t.auth.reset.toastErrorTitle,
        description: t.auth.reset.toastErrorDescription,
      });
      return;
    }

    setIsLoading(true);

    try {
      await requestPasswordResetEmail(email());
      setEmailSent(true);
      pushToast({
        type: "info",
        title: t.auth.reset.toastInfoTitle,
        description: t.auth.reset.toastInfoDescription,
      });
    } catch (error) {
      pushToast({
        type: "error",
        title: t.auth.reset.toastErrorTitle,
        description: error instanceof Error ? error.message : t.auth.reset.toastErrorDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordError = createMemo(() => {
    if (!completeSubmitted()) {
      return "";
    }

    return newPassword().length >= 8 ? "" : "Password must be at least 8 characters.";
  });

  const confirmPasswordError = createMemo(() => {
    if (!completeSubmitted()) {
      return "";
    }

    return newPassword() === confirmPassword() ? "" : t.auth.reset.passwordMismatch;
  });

  const tokenErrorMessage = createMemo(() => {
    const status = tokenStatus();
    if (!status || status.ok) {
      return "";
    }

    switch (status.reason) {
      case "missing_token":
        return t.auth.reset.tokenMissing;
      case "expired_token":
        return t.auth.reset.tokenExpired;
      case "used_token":
        return t.auth.reset.tokenUsed;
      default:
        return t.auth.reset.tokenInvalid;
    }
  });

  const handleCompleteSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setCompleteSubmitted(true);

    if (tokenErrorMessage()) {
      pushToast({
        type: "error",
        title: t.auth.reset.completeErrorTitle,
        description: tokenErrorMessage(),
      });
      return;
    }

    if (passwordError() || confirmPasswordError()) {
      pushToast({
        type: "error",
        title: t.auth.reset.completeErrorTitle,
        description: t.auth.reset.completeErrorDescription,
      });
      return;
    }

    setIsLoading(true);

    try {
      await completePasswordReset({
        token: activeResetToken(),
        password: newPassword(),
      });
      setPasswordUpdated(true);
      pushToast({
        type: "success",
        title: t.auth.reset.completeSuccessTitle,
        description: t.auth.reset.completeSuccessDescription,
      });
      props.onResetComplete?.();
    } catch (error) {
      pushToast({
        type: "error",
        title: t.auth.reset.completeErrorTitle,
        description: error instanceof Error ? error.message : t.auth.reset.completeErrorDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title={inCompletionFlow() ? t.auth.reset.completeTitle : t.auth.reset.title} subtitle={inCompletionFlow() ? t.auth.reset.completeSubtitle : t.auth.reset.subtitle}>
      <Switch>
        <Match when={!inCompletionFlow()}>
          <form class="mt-6 space-y-4" onSubmit={handleSubmit}>
            <TextField
              autoComplete="email"
              error={emailError()}
              label={t.auth.reset.emailLabel}
              name="email"
              onInput={setEmail}
              placeholder={t.auth.reset.emailPlaceholder}
              required
              type="email"
              value={email()}
            />
            <Button variant="secondary" class="w-full" disabled={isLoading()} type="submit">
              {isLoading() ? t.auth.reset.submitting : t.auth.reset.submit}
            </Button>
            <Show when={emailSent()}>
              <p class="text-sm text-emerald-600 dark:text-emerald-400" role="status">
                {t.auth.reset.successInline}
              </p>
            </Show>
          </form>
        </Match>
        <Match when={inCompletionFlow()}>
          <form class="mt-6 space-y-4" onSubmit={handleCompleteSubmit}>
            <Show when={tokenStatus.loading}>
              <p class="text-sm text-muted" role="status">
                {t.app.loadingSection}
              </p>
            </Show>
            <Show when={Boolean(tokenErrorMessage())}>
              <p class="text-sm text-danger" role="status">
                {tokenErrorMessage()}
              </p>
            </Show>
            <TextField
              autoComplete="new-password"
              error={passwordError()}
              label={t.auth.reset.newPasswordLabel}
              name="newPassword"
              onInput={setNewPassword}
              placeholder={t.auth.reset.newPasswordPlaceholder}
              required
              type="password"
              value={newPassword()}
            />
            <TextField
              autoComplete="new-password"
              error={confirmPasswordError()}
              label={t.auth.reset.confirmPasswordLabel}
              name="confirmPassword"
              onInput={setConfirmPassword}
              placeholder={t.auth.reset.confirmPasswordPlaceholder}
              required
              type="password"
              value={confirmPassword()}
            />
            <Button variant="secondary" class="w-full" disabled={isLoading() || Boolean(tokenErrorMessage())} type="submit">
              {isLoading() ? t.auth.reset.completeSubmitting : t.auth.reset.completeSubmit}
            </Button>
            <Show when={passwordUpdated()}>
              <p class="text-sm text-emerald-600 dark:text-emerald-400" role="status">
                {t.auth.reset.completeSuccessInline}
              </p>
            </Show>
          </form>
        </Match>
      </Switch>
      <Button variant="ghost" class="mt-4 justify-start px-0 py-0.5 text-sm font-medium" onClick={props.onBackToLogin} type="button">
        {t.auth.reset.backToLogin}
      </Button>
    </AuthCard>
  );
}
