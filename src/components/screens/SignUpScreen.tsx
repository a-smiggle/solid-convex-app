import { Show, createMemo, createSignal } from "solid-js";
import { AuthCard } from "../ui/AuthCard";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import { useToast } from "../feedback/ToastProvider";
import { t } from "../../i18n";
import { signUpWithEmailPassword } from "../../auth/client";
import type { AuthUser } from "../../types/auth";

type SignUpScreenProps = {
  onBackToLogin: () => void;
  onSignUp: (user: AuthUser) => void;
};

export function SignUpScreen(props: SignUpScreenProps) {
  const { pushToast } = useToast();
  const [fullName, setFullName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [submitted, setSubmitted] = createSignal(false);
  const [created, setCreated] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);

  const fullNameError = createMemo(() => {
    if (!submitted()) {
      return "";
    }

    return fullName().trim().length >= 2 ? "" : "Please enter your full name.";
  });

  const emailError = createMemo(() => {
    if (!submitted()) {
      return "";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email()) ? "" : "Enter a valid work email.";
  });

  const passwordError = createMemo(() => {
    if (!submitted()) {
      return "";
    }

    return password().length >= 8 ? "" : "Password must be at least 8 characters.";
  });

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setSubmitted(true);

    if (fullNameError() || emailError() || passwordError()) {
      pushToast({
        type: "error",
        title: t.auth.signup.toastErrorTitle,
        description: t.auth.signup.toastErrorDescription,
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = await signUpWithEmailPassword({
        fullName: fullName(),
        email: email(),
        password: password(),
      });

      setCreated(true);
      pushToast({
        type: "success",
        title: t.auth.signup.toastSuccessTitle,
        description: t.auth.signup.toastSuccessDescription,
      });
      props.onSignUp(user);
    } catch (error) {
      pushToast({
        type: "error",
        title: t.auth.signup.toastErrorTitle,
        description: error instanceof Error ? error.message : t.auth.signup.toastErrorDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title={t.auth.signup.title} subtitle={t.auth.signup.subtitle}>
      <form class="mt-6 space-y-4" onSubmit={handleSubmit}>
        <TextField
          autoComplete="name"
          error={fullNameError()}
          label={t.auth.signup.fullNameLabel}
          name="name"
          onInput={setFullName}
          placeholder={t.auth.signup.fullNamePlaceholder}
          required
          type="text"
          value={fullName()}
        />
        <TextField
          autoComplete="email"
          error={emailError()}
          label={t.auth.signup.workEmailLabel}
          name="email"
          onInput={setEmail}
          placeholder={t.auth.signup.workEmailPlaceholder}
          required
          type="email"
          value={email()}
        />
        <TextField
          autoComplete="new-password"
          error={passwordError()}
          hint={t.auth.signup.passwordHint}
          label={t.auth.signup.passwordLabel}
          name="password"
          onInput={setPassword}
          placeholder={t.auth.signup.passwordPlaceholder}
          required
          type="password"
          value={password()}
        />
        <Button variant="warning" class="w-full" disabled={isLoading()} type="submit">
          {isLoading() ? t.auth.signup.submitting : t.auth.signup.submit}
        </Button>
        <Show when={created()}>
          <p class="text-sm text-emerald-600 dark:text-emerald-400" role="status">
            {t.auth.signup.successInline}
          </p>
        </Show>
      </form>
      <Button variant="ghost" class="mt-4 justify-start px-0 py-0.5 text-sm font-medium" onClick={props.onBackToLogin} type="button">
        {t.auth.signup.backToLogin}
      </Button>
    </AuthCard>
  );
}
