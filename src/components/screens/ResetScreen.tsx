import { Show, createMemo, createSignal } from "solid-js";
import { AuthCard } from "../ui/AuthCard";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import { useToast } from "../feedback/ToastProvider";
import { t } from "../../i18n";

type ResetScreenProps = {
  onBackToLogin: () => void;
};

export function ResetScreen(props: ResetScreenProps) {
  const { pushToast } = useToast();
  const [email, setEmail] = createSignal("");
  const [submitted, setSubmitted] = createSignal(false);
  const [emailSent, setEmailSent] = createSignal(false);

  const emailError = createMemo(() => {
    if (!submitted()) {
      return "";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email()) ? "" : "Enter a valid account email.";
  });

  const handleSubmit = (event: SubmitEvent) => {
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

    setEmailSent(true);
    pushToast({
      type: "info",
      title: t.auth.reset.toastInfoTitle,
      description: t.auth.reset.toastInfoDescription,
    });
  };

  return (
    <AuthCard title={t.auth.reset.title} subtitle={t.auth.reset.subtitle}>
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
        <Button variant="secondary" class="w-full" type="submit">
          {t.auth.reset.submit}
        </Button>
        <Show when={emailSent()}>
          <p class="text-sm text-emerald-600 dark:text-emerald-400" role="status">
            {t.auth.reset.successInline}
          </p>
        </Show>
      </form>
      <Button variant="ghost" class="mt-4 justify-start px-0 py-0.5 text-sm font-medium" onClick={props.onBackToLogin} type="button">
        {t.auth.reset.backToLogin}
      </Button>
    </AuthCard>
  );
}
