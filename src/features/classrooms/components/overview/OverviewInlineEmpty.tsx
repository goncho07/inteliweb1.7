import React from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';

/** Aviso vacío para una tabla puntual (sin resultados en el periodo/búsqueda actual) de la Vista General del Aula. */
export const OverviewInlineEmpty: React.FC<{ title: string; description: string; icon?: LucideIcon }> = ({
  title,
  description,
  icon: Icon = Inbox,
}) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
    <Icon size={28} strokeWidth={2} className="text-slate-300 dark:text-slate-600" />
    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
    <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
  </div>
);
