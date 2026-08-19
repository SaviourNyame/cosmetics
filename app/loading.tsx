export default function GlobalLoading() {
  return (
    <main className="pt-20 min-h-screen">
      <section className="max-w-5xl mx-auto px-5 py-16">
        <div className="glass-panel rounded-xl p-12 flex flex-col items-center justify-center gap-3 text-center">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          <p className="text-sm font-semibold tracking-[0.1em] uppercase text-on-surface">Loading page...</p>
          <p className="text-on-surface-variant text-sm">Please wait while we prepare your view.</p>
        </div>
      </section>
    </main>
  );
}
