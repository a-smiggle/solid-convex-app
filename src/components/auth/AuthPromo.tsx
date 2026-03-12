export function AuthPromo() {
  return (
    <div class="motion-enter-fade-up motion-stagger-1 motion-surface surface-muted hidden p-8 shadow-soft lg:block">
      <h2 class="text-3xl font-semibold leading-tight">Launch your Convex-backed SaaS in days, not weeks.</h2>
      <p class="text-muted mt-4">
        This starter gives you a clean auth and dashboard foundation. Wire these screens to Convex auth/actions and you are off.
      </p>
      <ul class="text-muted mt-6 space-y-3 text-sm">
        <li class="surface-card px-3 py-2">Mobile-first responsive structure</li>
        <li class="surface-card px-3 py-2">Accessible form controls + states</li>
        <li class="surface-card px-3 py-2">Dark mode with stored user preference</li>
      </ul>
    </div>
  );
}
