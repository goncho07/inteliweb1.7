import React from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Estado vacío único de la app: icono, qué pasa y qué hacer a continuación.
 * Nunca un «No hay resultados.» suelto.
 *
 * Se centra y ocupa todo el alto disponible, así que dentro de una ventana de
 * alto fijo rellena el cuerpo en vez de encogerlo — una pestaña sin datos ya no
 * hace que el modal cambie de tamaño.
 */
export const EmptyState: React.FC<{
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  /** Acción sugerida (un `Button`), cuando existe una que resuelva el vacío. */
  action?: React.ReactNode;
  className?: string;
}> = ({ icon: Icon, title, description, action, className }) => (
  <div
    className={cn(
      'flex h-full min-h-[200px] flex-1 flex-col items-center justify-center gap-3 p-8 text-center',
      className,
    )}
  >
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
      <Icon size={24} strokeWidth={2} />
    </span>
    <p className="text-base font-bold text-slate-700 dark:text-slate-200">{title}</p>
    {description && (
      <p className="max-w-sm text-base text-slate-500 dark:text-slate-400">{description}</p>
    )}
    {action}
  </div>
);
