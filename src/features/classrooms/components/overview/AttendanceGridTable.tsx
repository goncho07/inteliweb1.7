import React from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatStudentDisplayName } from '@/features/classrooms/overview.format';
import { ATTENDANCE_CELL_META, type AttendanceGridRow, type DayGroup } from '@/features/classrooms/overview.rows';

const STICKY_HEAD_CLASS = 'sticky z-20 bg-slate-50 dark:bg-slate-800/50';
const STICKY_CELL_CLASS = 'sticky z-10 bg-white dark:bg-slate-900';

/**
 * Cuadrícula alumnos × días agrupada por semana (periodo "Mes") o por mes
 * (periodo "Bimestre"): encabezado de dos filas, columnas "N°" y "Estudiante"
 * fijas al desplazar horizontalmente, y una celda por día con el estado de
 * asistencia (nunca solo color: siempre letra + tooltip con el nombre del
 * estado).
 */
export const AttendanceGridTable: React.FC<{
  groups: DayGroup[];
  rows: AttendanceGridRow[];
}> = ({ groups, rows }) => {
  const days = groups.flatMap((group) => group.days);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-max border-collapse text-left text-sm">
          <thead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <tr>
              <th
                rowSpan={2}
                className={`${STICKY_HEAD_CLASS} left-0 w-12 border-b border-r border-slate-200 p-2 text-center dark:border-slate-800`}
              >
                N°
              </th>
              <th
                rowSpan={2}
                className={`${STICKY_HEAD_CLASS} left-12 min-w-[220px] border-b border-r border-slate-200 p-3 dark:border-slate-800`}
              >
                Estudiante
              </th>
              {groups.map((group) => (
                <th
                  key={group.label}
                  colSpan={group.days.length}
                  className="border-b border-l border-slate-200 bg-slate-50 p-2 text-center dark:border-slate-800 dark:bg-slate-800/50"
                >
                  {group.label.toUpperCase()}
                </th>
              ))}
            </tr>
            <tr>
              {days.map((day) => (
                <th
                  key={day.date.toISOString()}
                  className="w-11 border-b border-l border-slate-200 bg-slate-50 p-1.5 text-center dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <span className="block text-sm font-bold leading-tight text-slate-700 dark:text-slate-200">
                    {day.dayLabel}
                  </span>
                  <span className="block text-xs font-semibold leading-tight text-slate-400 dark:text-slate-500">
                    {day.weekdayLabel}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td className={`${STICKY_CELL_CLASS} left-0 border-r border-slate-100 p-2 text-center text-sm font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400`}>
                  {index + 1}
                </td>
                <td className={`${STICKY_CELL_CLASS} left-12 whitespace-nowrap border-r border-slate-100 p-3 font-semibold text-slate-800 dark:border-slate-800 dark:text-white`}>
                  {formatStudentDisplayName(row.name)}
                </td>
                {row.cells.map((state, i) => {
                  const meta = ATTENDANCE_CELL_META[state];
                  return (
                    <td key={days[i].date.toISOString()} className="p-1.5 text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${meta.badgeClassName}`}
                            aria-label={meta.label}
                          >
                            {meta.letter}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{meta.label}</TooltipContent>
                      </Tooltip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
};

/** Leyenda de los 4 estados de asistencia posibles (nunca "sin-clase", que no es un estado real). */
export const AttendanceGridLegend: React.FC = () => (
  <div className="flex flex-wrap items-center gap-3">
    {(Object.entries(ATTENDANCE_CELL_META) as [keyof typeof ATTENDANCE_CELL_META, (typeof ATTENDANCE_CELL_META)[keyof typeof ATTENDANCE_CELL_META]][])
      .filter(([key]) => key !== 'sin-clase')
      .map(([key, meta]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${meta.badgeClassName}`}>
            {meta.letter}
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{meta.label}</span>
        </div>
      ))}
  </div>
);
