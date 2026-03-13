import { createMemo, createSignal } from "solid-js";
import { AuthCard } from "../ui/AuthCard";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import { useToast } from "../feedback/ToastProvider";
import { t } from "../../i18n";
import { signInWithEmailPassword, startGitHubSignIn } from "../../auth/client";
import type { AuthUser } from "../../types/auth";

type LoginScreenProps = {
  onLogin: (user: AuthUser) => void;
  onShowSignup: () => void;
  onShowReset: () => void;
};

export function LoginScreen(props: LoginScreenProps) {
  const { pushToast } = useToast();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [submitted, setSubmitted] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isGitHubLoading, setIsGitHubLoading] = createSignal(false);

  const emailError = createMemo(() => {
    if (!submitted()) {
      return "";
    }

    if (!email().trim()) {
      return "Email is required.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email()) ? "" : "Enter a valid email address.";
  });

  const passwordError = createMemo(() => {
    if (!submitted()) {
      return "";
    }

    if (!password()) {
      return "Password is required.";
    }

    return password().length < 8 ? "Password must be at least 8 characters." : "";
  });

  const formValid = createMemo(() => !emailError() && !passwordError());

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setSubmitted(true);

    if (!formValid()) {
      pushToast({
        type: "error",
        title: t.auth.login.toastErrorTitle,
        description: t.auth.login.toastErrorDescription,
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = await signInWithEmailPassword({
        email: email(),
        password: password(),
      });

      pushToast({
        type: "success",
        title: t.auth.login.toastSuccessTitle,
        description: t.auth.login.toastSuccessDescription,
      });
      props.onLogin(user);
    } catch (error) {
      pushToast({
        type: "error",
        title: t.auth.login.toastErrorTitle,
        description: error instanceof Error ? error.message : t.auth.login.toastErrorDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = () => {
    setIsGitHubLoading(true);

    try {
      startGitHubSignIn();
    } catch (error) {
      setIsGitHubLoading(false);
      pushToast({
        type: "error",
        title: t.auth.login.githubErrorTitle,
        description: error instanceof Error ? error.message : t.auth.login.githubErrorDescription,
      });
    }
  };

  return (
    <AuthCard title={t.auth.login.title} subtitle={t.auth.login.subtitle}>
      <form class="mt-6 space-y-4" onSubmit={handleSubmit}>
        <TextField
          autoComplete="email"
          error={emailError()}
          hint={t.auth.login.emailHint}
          label={t.auth.login.emailLabel}
          name="email"
          onInput={setEmail}
          placeholder={t.auth.login.emailPlaceholder}
          required
          type="email"
          value={email()}
        />
        <TextField
          autoComplete="current-password"
          error={passwordError()}
          label={t.auth.login.passwordLabel}
          name="password"
          onInput={setPassword}
          placeholder={t.auth.login.passwordPlaceholder}
          required
          type="password"
          value={password()}
        />
        <Button class="w-full" disabled={isLoading()} type="submit">
          {isLoading() ? t.auth.login.submitting : t.auth.login.submit}
        </Button>
        <Button variant="secondary" class="w-full" disabled={isLoading() || isGitHubLoading()} onClick={handleGitHubSignIn} type="button">
          {isGitHubLoading() ? t.auth.login.githubSubmitting : t.auth.login.githubSubmit}
        </Button>
      </form>
      <div class="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:justify-between">
        <Button variant="ghost" class="justify-start px-0 py-0.5 text-sm font-medium" onClick={props.onShowReset} type="button">
          {t.auth.login.forgotPassword}
        </Button>
        <Button variant="ghost" class="justify-start px-0 py-0.5 text-sm font-medium" onClick={props.onShowSignup} type="button">
          {t.auth.login.createAccount}
        </Button>
      </div>
    </AuthCard>
  );
}
