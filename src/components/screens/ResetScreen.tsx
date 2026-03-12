import { Show, createMemo, createSignal } from "solid-js";
import { AuthCard } from "../ui/AuthCard";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import { useToast } from "../feedback/ToastProvider";

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
        title: "Invalid email",
        description: "Enter a valid account email to receive a reset link.",
      });
      return;
    }

    setEmailSent(true);
    pushToast({
      type: "info",
      title: "Reset link requested",
      description: "If this account exists, a reset email has been queued.",
    });
  };

  return (
    <AuthCard title="Reset Password" subtitle="We will send a secure reset link to your email.">
      <form class="mt-6 space-y-4" onSubmit={handleSubmit}>
        <TextField
          autoComplete="email"
          error={emailError()}
          label="Account Email"
          name="email"
          onInput={setEmail}
          placeholder="you@company.com"
          required
          type="email"
          value={email()}
        />
        <Button variant="secondary" class="w-full" type="submit">
          Send Reset Link
        </Button>
        <Show when={emailSent()}>
          <p class="text-sm text-emerald-600 dark:text-emerald-400" role="status">
            Reset link sent. Check your inbox for next steps.
          </p>
        </Show>
      </form>
      <Button variant="ghost" class="mt-4 justify-start px-0 py-0.5 text-sm font-medium" onClick={props.onBackToLogin} type="button">
        Back to login
      </Button>
    </AuthCard>
  );
}
