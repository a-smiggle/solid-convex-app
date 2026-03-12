import { createMemo, createSignal } from "solid-js";
import { AuthCard } from "../ui/AuthCard";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import { useToast } from "../feedback/ToastProvider";

type LoginScreenProps = {
  onLogin: () => void;
  onShowSignup: () => void;
  onShowReset: () => void;
};

export function LoginScreen(props: LoginScreenProps) {
  const { pushToast } = useToast();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [submitted, setSubmitted] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);

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
        title: "Fix form errors",
        description: "Please correct the highlighted fields before logging in.",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    pushToast({
      type: "success",
      title: "Logged in",
      description: "Welcome back. Redirecting to dashboard.",
    });
    props.onLogin();
    setIsLoading(false);
  };

  return (
    <AuthCard title="Login" subtitle="Welcome back. Sign in to continue.">
      <form class="mt-6 space-y-4" onSubmit={handleSubmit}>
        <TextField
          autoComplete="email"
          error={emailError()}
          hint="Use your account email"
          label="Email"
          name="email"
          onInput={setEmail}
          placeholder="you@company.com"
          required
          type="email"
          value={email()}
        />
        <TextField
          autoComplete="current-password"
          error={passwordError()}
          label="Password"
          name="password"
          onInput={setPassword}
          placeholder="********"
          required
          type="password"
          value={password()}
        />
        <Button class="w-full" disabled={isLoading()} type="submit">
          {isLoading() ? "Signing in..." : "Login"}
        </Button>
      </form>
      <div class="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:justify-between">
        <Button variant="ghost" class="justify-start px-0 py-0.5 text-sm font-medium" onClick={props.onShowReset} type="button">
          Forgot password?
        </Button>
        <Button variant="ghost" class="justify-start px-0 py-0.5 text-sm font-medium" onClick={props.onShowSignup} type="button">
          Create account
        </Button>
      </div>
    </AuthCard>
  );
}
