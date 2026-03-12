type TextFieldProps = {
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  inputClass?: string;
};

export function TextField(props: TextFieldProps) {
  return (
    <label class="block text-sm font-medium">
      {props.label}
      <input
        class={`mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-800 ${props.inputClass ?? ""}`.trim()}
        type={props.type}
        placeholder={props.placeholder}
      />
    </label>
  );
}
