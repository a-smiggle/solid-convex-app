import { AuthCard } from "../ui/AuthCard";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";

type ResetScreenProps = {
  onBackToLogin: () => void;
};

export function ResetScreen(props: ResetScreenProps) {
  return (
    <AuthCard title="Reset Password" subtitle="We will send a secure reset link to your email.">
      <form class="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
        <TextField label="Account Email" type="email" placeholder="you@company.com" />
        <Button variant="secondary" class="w-full" type="button">
          Send Reset Link
        </Button>
      </form>
      <Button variant="ghost" class="mt-4 justify-start px-0 py-0.5 text-sm font-medium" onClick={props.onBackToLogin} type="button">
        Back to login
      </Button>
    </AuthCard>
  );
}
