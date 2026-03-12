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
        class={`input-field mt-1 w-full rounded-lg px-3 py-2 outline-none transition disabled:cursor-not-allowed disabled:opacity-70 ${
          props.error ? "input-error" : ""
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
        <p class={`mt-1 text-xs ${props.error ? "text-danger" : "text-subtle"}`} id={messageId()}>
          {props.error ?? props.hint}
        </p>
      )}
    </label>
  );
}
