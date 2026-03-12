export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="border-t border-slate-200/70 bg-white/75 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 sm:px-6 lg:px-8">
      <div class="mx-auto flex w-full max-w-[1600px] flex-col gap-2 text-sm text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
        <p>© {currentYear} Solid + Convex. All rights reserved.</p>
        <div class="flex items-center gap-4">
          <button class="transition hover:text-cyan-700 dark:hover:text-cyan-300" type="button">Docs</button>
          <button class="transition hover:text-cyan-700 dark:hover:text-cyan-300" type="button">Privacy</button>
          <button class="transition hover:text-cyan-700 dark:hover:text-cyan-300" type="button">Support</button>
        </div>
      </div>
    </footer>
  );
}
