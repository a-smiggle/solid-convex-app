import { For, Show } from "solid-js";
import type { JSX } from "solid-js";

type DataCell = string | number | JSX.Element;

export type DataTableColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  class?: string;
};

type DataTableProps = {
  caption?: string;
  columns: DataTableColumn[];
  rows: Array<Record<string, DataCell>>;
  emptyMessage?: string;
};

function alignClass(align?: "left" | "center" | "right") {
  if (align === "center") {
    return "text-center";
  }

  if (align === "right") {
    return "text-right";
  }

  return "text-left";
}

export function DataTable(props: DataTableProps) {
  return (
    <div class="overflow-x-auto rounded-xl border border-slate-200/70 bg-white/90 shadow-soft dark:border-slate-800 dark:bg-slate-900/75">
      <table class="min-w-full border-collapse text-sm md:text-[0.92rem]">
        <Show when={props.caption}>
          <caption class="sr-only">{props.caption}</caption>
        </Show>
        <thead class="bg-slate-50/80 dark:bg-slate-800/60 md:sticky md:top-0 md:z-10">
          <tr>
            <For each={props.columns}>
              {(column) => (
                <th
                  class={`border-b border-slate-200 px-4 py-3 font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200 ${alignClass(column.align)} ${column.class ?? ""}`.trim()}
                  scope="col"
                >
                  {column.label}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <Show
            when={props.rows.length > 0}
            fallback={
              <tr>
                <td class="px-4 py-5 text-center text-slate-500 dark:text-slate-400" colSpan={props.columns.length}>
                  {props.emptyMessage ?? "No rows to show."}
                </td>
              </tr>
            }
          >
            <For each={props.rows}>
              {(row) => (
                <tr class="border-b border-slate-200/80 last:border-b-0 dark:border-slate-800">
                  <For each={props.columns}>
                    {(column) => (
                      <td class={`px-4 py-3 text-slate-700 dark:text-slate-200 md:py-3.5 ${alignClass(column.align)} ${column.class ?? ""}`.trim()}>
                        {row[column.key]}
                      </td>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </Show>
        </tbody>
      </table>
    </div>
  );
}
