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
    <div class="surface-card overflow-x-auto shadow-sm">
      <table class="min-w-full border-collapse text-sm md:text-[0.92rem]">
        <Show when={props.caption}>
          <caption class="sr-only">{props.caption}</caption>
        </Show>
        <thead class="md:sticky md:top-0 md:z-10" style={{ "background-color": "var(--color-surface-subtle)" }}>
          <tr>
            <For each={props.columns}>
              {(column) => (
                <th
                  class={`px-4 py-3 font-semibold ${alignClass(column.align)} ${column.class ?? ""}`.trim()}
                  style={{
                    "border-bottom": "1px solid var(--color-border-muted)",
                    color: "var(--color-text-muted)",
                  }}
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
                <td class="text-subtle px-4 py-5 text-center" colSpan={props.columns.length}>
                  {props.emptyMessage ?? "No rows to show."}
                </td>
              </tr>
            }
          >
            <For each={props.rows}>
              {(row) => (
                <tr class="last:border-b-0" style={{ "border-bottom": "1px solid var(--color-border-default)" }}>
                  <For each={props.columns}>
                    {(column) => (
                      <td
                        class={`px-4 py-3 md:py-3.5 ${alignClass(column.align)} ${column.class ?? ""}`.trim()}
                        style={{ color: "var(--color-text-primary)" }}
                      >
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
