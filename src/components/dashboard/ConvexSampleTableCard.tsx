import { Show, createMemo, createResource, createSignal } from "solid-js";
import { getConvexClient, getConvexUrl } from "../../convex/client";
import { sampleRowsApi } from "../../convex/sampleRowsApi";
import { useToast } from "../feedback/ToastProvider";
import { Button } from "../ui/Button";
import { DataTable, type DataTableColumn } from "../ui/DataTable";

const columns: DataTableColumn[] = [
  { key: "label", label: "Label" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created", align: "right" },
];

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

function buildSampleLabel() {
  return `Demo row ${new Date().toLocaleTimeString()}`;
}

export function ConvexSampleTableCard() {
  const { pushToast } = useToast();
  const [isAdding, setIsAdding] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);
  const hasConvexUrl = () => Boolean(getConvexUrl());

  const [rows, { refetch }] = createResource(async () => {
    const client = getConvexClient();
    if (!client) {
      return [];
    }

    return await client.query(sampleRowsApi.list, {});
  });

  const tableRows = createMemo(() =>
    (rows() ?? []).map((row) => ({
      label: row.label,
      status: row.status,
      createdAt: formatTimestamp(row.createdAt),
    }))
  );

  const handleInsertRow = async () => {
    const client = getConvexClient();
    if (!client) {
      setErrorMessage("Convex URL is missing. Add VITE_CONVEX_URL (or CONVEX_URL) in .env.local.");
      return;
    }

    setIsAdding(true);
    setErrorMessage(null);

    try {
      await client.mutation(sampleRowsApi.add, { label: buildSampleLabel() });
      await refetch();
      pushToast({
        title: "Row inserted",
        description: "Saved a sample row to Convex and refreshed the table.",
        type: "success",
      });
    } catch {
      setErrorMessage("Convex request failed. Confirm convex dev is running and the deployment URL is valid.");
      pushToast({
        title: "Convex request failed",
        description: "Check your Convex deployment URL and try again.",
        type: "error",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <section class="motion-surface rounded-xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="font-semibold">Convex Sample Table</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Live rows from the sampleRows table in your Convex deployment.</p>
        </div>

        <Button disabled={isAdding() || !hasConvexUrl()} onClick={handleInsertRow} type="button" variant="secondary">
          {isAdding() ? "Inserting..." : "Insert sample row"}
        </Button>
      </div>

      <Show when={!hasConvexUrl()}>
        <p class="mt-3 text-sm text-amber-700 dark:text-amber-300">Set VITE_CONVEX_URL (or keep CONVEX_URL) in .env.local to enable live data calls.</p>
      </Show>

      <Show when={rows.error}>
        <p class="mt-3 text-sm text-rose-700 dark:text-rose-300">Unable to load rows from Convex right now.</p>
      </Show>

      <Show when={errorMessage()}>
        {(message) => <p class="mt-3 text-sm text-rose-700 dark:text-rose-300">{message()}</p>}
      </Show>

      <div class="mt-4">
        <DataTable
          caption="Convex sample rows"
          columns={columns}
          rows={tableRows()}
          emptyMessage={rows.loading ? "Loading rows from Convex..." : "No sample rows yet. Insert one to verify the connection."}
        />
      </div>
    </section>
  );
}