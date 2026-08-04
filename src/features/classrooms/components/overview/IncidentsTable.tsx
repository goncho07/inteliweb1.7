import React from 'react';

import { formatStudentDisplayName } from '@/features/classrooms/overview.format';
import type { IncidentReportRow } from '@/features/classrooms/overview.rows';
import { cn } from '@/lib/utils';
import type { IncidentType } from '@/types';

/**
 * Color de la insignia por gravedad: `amber` = atención (Moderada), `rose` =
 * negativo (Grave), y un tono neutro para Leve — el mismo mapeo semántico
 * que usa el resto de la app (`DESIGN_SYSTEM.md` § Color).
 */
const CATEGORY_BADGE_CLASSES: Record<IncidentType['category'], string> = {
  Leve: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  Moderada: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  Grave: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
};

/** Tabla Fecha/Estudiante/Tipo/Descripción del reporte de incidencias del aula y periodo seleccionados. */
export const IncidentsTable: React.FC<{ rows: IncidentReportRow[] }> = ({ rows }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
    <table className="w-full min-w-[720px] border-collapse text-left text-sm">
      <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
        <tr>
          <th className="w-28 p-3">Fecha</th>
          <th className="p-3">Estudiante</th>
          <th className="w-56 p-3">Tipo</th>
          <th className="p-3">Descripción</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {rows.map((row) => {
          const Icon = row.type.icon;
          return (
            <tr key={row.id}>
              <td className="whitespace-nowrap p-3 text-slate-500 dark:text-slate-400">{row.dateLabel}</td>
              <td className="whitespace-nowrap p-3 font-semibold text-slate-800 dark:text-white">
                {formatStudentDisplayName(row.studentName)}
              </td>
              <td className="p-3">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
                    CATEGORY_BADGE_CLASSES[row.type.category],
                  )}
                >
                  <Icon size={16} strokeWidth={2} />
                  {row.type.label}
                </span>
              </td>
              <td className="p-3 text-slate-600 dark:text-slate-300">{row.description}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
