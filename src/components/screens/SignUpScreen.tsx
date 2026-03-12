import { AuthCard } from "../ui/AuthCard";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";

type SignUpScreenProps = {
  onBackToLogin: () => void;
};

export function SignUpScreen(props: SignUpScreenProps) {
  return (
    <AuthCard title="Sign Up" subtitle="Create your team workspace.">
      <form class="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
        <TextField label="Full Name" type="text" placeholder="Jamie Doe" />
        <TextField label="Work Email" type="email" placeholder="jamie@company.com" />
        <TextField label="Password" type="password" placeholder="At least 8 characters" />
        <Button variant="warning" class="w-full" type="button">
          Create Account
        </Button>
      </form>
      <Button variant="ghost" class="mt-4 justify-start px-0 py-0.5 text-sm font-medium" onClick={props.onBackToLogin} type="button">
        Back to login
      </Button>
    </AuthCard>
  );
}
