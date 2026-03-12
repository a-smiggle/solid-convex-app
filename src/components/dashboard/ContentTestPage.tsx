import { DataTable, type DataTableColumn } from "../ui/DataTable";

const contentCards = [
  { title: "Published Posts", value: "42", note: "8 scheduled" },
  { title: "Campaigns", value: "6", note: "2 in review" },
  { title: "Assets", value: "318", note: "12 added this week" },
];

const contentColumns: DataTableColumn[] = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated", align: "right" },
];

const contentRows = [
  { name: "Q2 Product Launch", type: "Campaign", owner: "Maya Reed", status: "Draft", updated: "2h ago" },
  { name: "Billing Onboarding Guide", type: "Article", owner: "Jordan Vega", status: "Published", updated: "1d ago" },
  { name: "Referral Promo Banner", type: "Asset", owner: "Kai Morgan", status: "In Review", updated: "3d ago" },
];

function statusBadge(status: string) {
  const toneClass =
    status === "Published"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
      : status === "In Review"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";

  return <span class={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass}`}>{status}</span>;
}

export function ContentTestPage() {
  const tableRows = contentRows.map((row) => ({
    ...row,
    status: statusBadge(row.status),
  }));

  return (
    <section class="space-y-6">
      <article class="rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
        <h3 class="text-xl font-semibold">Content Test Page</h3>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Use this page as a staging area for CMS, media workflows, and editor integrations.
        </p>
      </article>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contentCards.map((card) => (
          <article class="rounded-xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
            <p class="text-sm text-slate-500 dark:text-slate-400">{card.title}</p>
            <p class="mt-2 text-2xl font-semibold">{card.value}</p>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{card.note}</p>
          </article>
        ))}
      </div>

      <article class="space-y-3">
        <div>
          <h4 class="text-base font-semibold">Recent Content Activity</h4>
          <p class="text-sm text-slate-600 dark:text-slate-300">Reusable table pattern for content operations and moderation queues.</p>
        </div>
        <DataTable caption="Recent content activity" columns={contentColumns} rows={tableRows} emptyMessage="No content activity found." />
      </article>
    </section>
  );
}
