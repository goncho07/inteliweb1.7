import React from 'react';

import { STATUS_ACCENT_CLASSES } from '@/features/citations/citations.constants';
import type { CitationStatus } from '@/features/citations/types';

/**
 * "Estado:" de la pestaña Citaciones — solo los estados presentes en la
 * tabla visible, con el mismo color que usa el módulo Citaciones
 * (`STATUS_ACCENT_CLASSES`), nunca un estado inventado como "Asistió".
 */
export const OverviewStatusLegend: React.FC<{ statuses: CitationStatus[] }> = ({ statuses }) => {
  if (statuses.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-3">
      {statuses.map((status) => (
        <div key={status} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_ACCENT_CLASSES[status]}`} />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{status}</span>
        </div>
      ))}
    </div>
  );
};
