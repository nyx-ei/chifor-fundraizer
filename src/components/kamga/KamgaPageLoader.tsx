import { LoaderCircle } from 'lucide-react';

type KamgaPageLoaderProps = {
  label?: string;
};

export function KamgaPageLoader({ label = 'Chargement en cours' }: KamgaPageLoaderProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-page px-6 py-12 text-body">
      <div className="inline-flex items-center gap-3 rounded-sm border border-border bg-card px-5 py-4 text-sm font-semibold text-secondary shadow-card" role="status">
        <LoaderCircle aria-hidden="true" className="animate-spin text-brand" size={20} />
        <span>{label}</span>
      </div>
    </main>
  );
}
