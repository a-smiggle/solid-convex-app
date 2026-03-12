const contentCards = [
  { title: "Published Posts", value: "42", note: "8 scheduled" },
  { title: "Campaigns", value: "6", note: "2 in review" },
  { title: "Assets", value: "318", note: "12 added this week" },
];

export function ContentTestPage() {
  return (
    <section class="space-y-6">
      <article class="rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/75">
        <h3 class="text-xl font-semibold">Content Test Page</h3>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Use this page as a staging area for CMS, media workflows, and editor integrations.
        </p>
      </article>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contentCards.map((card) => (
          <article class="rounded-xl border border-slate-200/70 bg-white/90 p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900/75">
            <p class="text-sm text-slate-500 dark:text-slate-400">{card.title}</p>
            <p class="mt-2 text-2xl font-semibold">{card.value}</p>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{card.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
