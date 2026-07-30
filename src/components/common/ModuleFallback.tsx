import { Loader2 } from 'lucide-react';

/** Placeholder mostrado mientras se descarga el chunk de un módulo. */
export const ModuleFallback = () => (
  <div
    role="status"
    aria-live="polite"
    className="flex h-full w-full flex-1 items-center justify-center gap-3 py-20 text-slate-500 dark:text-slate-400"
  >
    <Loader2 className="h-6 w-6 animate-spin" />
    <span className="text-sm font-bold">Cargando módulo…</span>
  </div>
);
