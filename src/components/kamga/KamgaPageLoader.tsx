import { LoaderCircle } from 'lucide-react';

type KamgaPageLoaderProps = {
  eyebrow?: string;
  label?: string;
  variant?: 'page' | 'workspace';
};

export function KamgaPageLoader({ eyebrow = 'Kamga', label = 'Chargement en cours', variant = 'page' }: KamgaPageLoaderProps) {
  const isWorkspace = variant === 'workspace';

  return (
    <main className={`min-h-screen bg-page text-body ${isWorkspace ? 'grid md:grid-cols-[280px_1fr]' : ''}`}>
      {isWorkspace ? (
        <aside className="hidden border-r border-[#314371] bg-[#243b8f] p-6 md:block">
          <div className="h-8 w-32 rounded-sm bg-white/20" />
          <div className="mt-16 grid gap-4">
            <div className="h-12 rounded-sm bg-white/20" />
            <div className="h-12 rounded-sm bg-white/10" />
            <div className="h-12 rounded-sm bg-white/10" />
            <div className="h-12 rounded-sm bg-white/10" />
          </div>
        </aside>
      ) : null}

      <section className="grid min-h-screen place-items-center px-6 py-12">
        <div className="w-full max-w-3xl rounded-md border border-border bg-card p-8 shadow-card">
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-sm bg-[#eef3ff] text-[#3454b8]">
              <LoaderCircle aria-hidden="true" className="animate-spin" size={26} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{eyebrow}</p>
              <h1 className="mt-1 text-2xl font-semibold text-heading">{label}</h1>
            </div>
          </div>

          <div className="mt-8 grid gap-3" aria-hidden="true">
            <div className="h-4 w-11/12 animate-pulse rounded-sm bg-[#edf1f8]" />
            <div className="h-4 w-8/12 animate-pulse rounded-sm bg-[#edf1f8]" />
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="h-24 animate-pulse rounded-sm border border-border bg-sunken" />
              <div className="h-24 animate-pulse rounded-sm border border-border bg-sunken" />
              <div className="h-24 animate-pulse rounded-sm border border-border bg-sunken" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}