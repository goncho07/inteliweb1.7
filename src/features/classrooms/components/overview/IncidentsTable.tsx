import React from 'react';

import { CATEGORY_BADGE_CLASSES, CATEGORY_ORDER } from '@/features/classrooms/incident.badges';
import { formatStudentDisplayName } from '@/features/classrooms/overview.format';
import type { IncidentReportRow } from '@/features/classrooms/overview.rows';
import { cn } from '@/lib/utils';

/**
 * Tabla del reporte de incidencias del aula y periodo seleccionados. Abre con
 * "N°" y "Estudiante" igual que la tabla de asistencia, para que las tres
 * pestañas de la Vista General se lean de la misma forma.
 *
 * `classroomLabels` añade la columna "Aula": en la Vista General del Aula
 * sobra (todas las filas son de la misma), pero el panel Inicio junta varias
 * aulas en una sola tarjeta y ahí hace falta saber de cuál viene cada incidencia.
 */
export const IncidentsTable: React.FC<{
  rows: (IncidentReportRow & { classroomLabel?: string })[];
  classroomLabels?: boolean;
}> = ({ rows, classroomLabels = false }) => (
  <div className="overflow-x-auto border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
      <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
        <tr>
          <th className="w-14 p-3 text-center">N°</th>
          <th className="p-3">Estudiante</th>
          {classroomLabels && <th className="w-28 p-3">Aula</th>}
          <th className="w-36 p-3">Fecha y hora</th>
          <th className="w-56 p-3">Tipo</th>
          <th className="w-52 p-3">Registrado por</th>
          <th className="p-3">Descripción</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {rows.map((row, index) => {
          const Icon = row.type.icon;
          return (
            <tr key={row.id}>
              <td className="p-3 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">{index + 1}</td>
              <td className="whitespace-nowrap p-3 font-semibold text-slate-800 dark:text-white">
                {formatStudentDisplayName(row.studentName)}
              </td>
              {classroomLabels && (
                <td className="whitespace-nowrap p-3 font-semibold text-slate-600 dark:text-slate-300">
                  {row.classroomLabel}
                </td>
              )}
              <td className="whitespace-nowrap p-3 text-slate-600 dark:text-slate-300">
                {row.dateLabel} · {row.timeLabel}
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
              <td className="whitespace-nowrap p-3 text-slate-600 dark:text-slate-300">{row.teacherName}</td>
              <td className="p-3 text-slate-600 dark:text-slate-300">{row.description}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

/**
 * Leyenda de gravedad de la pestaña Incidencias: explica el color de la
 * insignia de "Tipo", que si no hay que adivinar. Mismo formato que la
 * leyenda de asistencia y la de estados de citación.
 */
export const IncidentsSeverityLegend: React.FC = () => (
  <div className="flex flex-wrap items-center gap-3">
    {CATEGORY_ORDER.map((category) => (
      <div key={category} className="flex items-center gap-1.5">
        <span className={cn('h-5 w-5 shrink-0 rounded-full border', CATEGORY_BADGE_CLASSES[category])} />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{category}</span>
      </div>
    ))}
  </div>
);
