import { Show, createMemo, createSignal } from "solid-js";
import { AuthCard } from "../ui/AuthCard";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import { useToast } from "../feedback/ToastProvider";

type SignUpScreenProps = {
  onBackToLogin: () => void;
};

export function SignUpScreen(props: SignUpScreenProps) {
  const { pushToast } = useToast();
  const [fullName, setFullName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [submitted, setSubmitted] = createSignal(false);
  const [created, setCreated] = createSignal(false);

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

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    setSubmitted(true);

    if (fullNameError() || emailError() || passwordError()) {
      pushToast({
        type: "error",
        title: "Sign-up form incomplete",
        description: "Please review required fields and try again.",
      });
      return;
    }

    setCreated(true);
    pushToast({
      type: "success",
      title: "Account details validated",
      description: "Connect this step to Convex auth to finalize signup.",
    });
  };

  return (
    <AuthCard title="Sign Up" subtitle="Create your team workspace.">
      <form class="mt-6 space-y-4" onSubmit={handleSubmit}>
        <TextField
          autoComplete="name"
          error={fullNameError()}
          label="Full Name"
          name="name"
          onInput={setFullName}
          placeholder="Jamie Doe"
          required
          type="text"
          value={fullName()}
        />
        <TextField
          autoComplete="email"
          error={emailError()}
          label="Work Email"
          name="email"
          onInput={setEmail}
          placeholder="jamie@company.com"
          required
          type="email"
          value={email()}
        />
        <TextField
          autoComplete="new-password"
          error={passwordError()}
          hint="At least 8 characters"
          label="Password"
          name="password"
          onInput={setPassword}
          placeholder="At least 8 characters"
          required
          type="password"
          value={password()}
        />
        <Button variant="warning" class="w-full" type="submit">
          Create Account
        </Button>
        <Show when={created()}>
          <p class="text-sm text-emerald-600 dark:text-emerald-400" role="status">
            Account details look good. Connect this action to Convex auth to complete signup.
          </p>
        </Show>
      </form>
      <Button variant="ghost" class="mt-4 justify-start px-0 py-0.5 text-sm font-medium" onClick={props.onBackToLogin} type="button">
        Back to login
      </Button>
    </AuthCard>
  );
}
