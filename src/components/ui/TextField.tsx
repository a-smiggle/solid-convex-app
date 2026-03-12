import { createUniqueId } from "solid-js";

type TextFieldProps = {
  id?: string;
  name?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  hint?: string;
  error?: string;
  onInput?: (value: string) => void;
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  inputClass?: string;
};

export function TextField(props: TextFieldProps) {
  const fallbackId = createUniqueId();
  const inputId = () => props.id ?? `field-${fallbackId}`;
  const messageId = () => `${inputId()}-message`;
  const hasMessage = () => Boolean(props.error || props.hint);

  return (
    <label class="block text-sm font-medium" for={inputId()}>
      {props.label}
      <input
        aria-describedby={hasMessage() ? messageId() : undefined}
        aria-invalid={props.error ? "true" : "false"}
        class={`mt-1 w-full rounded-lg border bg-white px-3 py-2 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-800 ${
          props.error ? "border-rose-400 dark:border-rose-500" : "border-slate-300 dark:border-slate-700"
        } ${props.inputClass ?? ""}`.trim()}
        disabled={props.disabled}
        id={inputId()}
        name={props.name}
        onInput={(event) => props.onInput?.(event.currentTarget.value)}
        autocomplete={props.autoComplete}
        required={props.required}
        type={props.type}
        placeholder={props.placeholder}
        value={props.value ?? ""}
      />
      {hasMessage() && (
        <p class={`mt-1 text-xs ${props.error ? "text-rose-600 dark:text-rose-300" : "text-slate-500 dark:text-slate-400"}`} id={messageId()}>
          {props.error ?? props.hint}
        </p>
      )}
    </label>
  );
}
