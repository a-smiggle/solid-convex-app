export function AuthPromo() {
  return (
    <div class="hidden rounded-2xl border border-slate-200/70 bg-white/70 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/55 lg:block">
      <h2 class="text-3xl font-semibold leading-tight">Launch your Convex-backed SaaS in days, not weeks.</h2>
      <p class="mt-4 text-slate-600 dark:text-slate-300">
        This starter gives you a clean auth and dashboard foundation. Wire these screens to Convex auth/actions and you are off.
      </p>
      <ul class="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
        <li class="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">Mobile-first responsive structure</li>
        <li class="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">Accessible form controls + states</li>
        <li class="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">Dark mode with stored user preference</li>
      </ul>
    </div>
  );
}
