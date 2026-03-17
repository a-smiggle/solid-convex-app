import { For } from "solid-js";

export function TableSkeleton(props: { columns: number; rows?: number }) {
  const rowCount = props.rows ?? 5;
  return (
    <div class="animate-pulse">
      <table class="min-w-full border-collapse text-sm md:text-[0.92rem]">
        <thead>
          <tr>
            <For each={Array(props.columns)}>{() => <th class="px-4 py-3">&nbsp;</th>}</For>
          </tr>
        </thead>
        <tbody>
          <For each={Array(rowCount)}>
            {() => (
              <tr>
                <For each={Array(props.columns)}>
                  {() => (
                    <td class="px-4 py-3">
                      <div class="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}
