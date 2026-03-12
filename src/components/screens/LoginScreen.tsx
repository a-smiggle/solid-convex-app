import { AuthCard } from "../ui/AuthCard";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";

type LoginScreenProps = {
  onLogin: () => void;
  onShowSignup: () => void;
  onShowReset: () => void;
};

export function LoginScreen(props: LoginScreenProps) {
  return (
    <AuthCard title="Login" subtitle="Welcome back. Sign in to continue.">
      <form class="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
        <TextField label="Email" type="email" placeholder="you@company.com" />
        <TextField label="Password" type="password" placeholder="********" />
        <Button class="w-full" onClick={props.onLogin} type="button">
          Login
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
