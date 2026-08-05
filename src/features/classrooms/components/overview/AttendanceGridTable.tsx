import React from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatStudentDisplayName } from '@/features/classrooms/overview.format';
import { isSameDay } from '@/features/classrooms/overview.period';
import { ATTENDANCE_CELL_META, type AttendanceGridRow, type DayGroup } from '@/features/classrooms/overview.rows';
import { cn } from '@/lib/utils';

const STICKY_HEAD_CLASS = 'sticky z-20 bg-slate-50 dark:bg-slate-800/50';
const STICKY_CELL_CLASS = 'sticky z-10 bg-white dark:bg-slate-900';

/** Fondo de la columna del día de hoy, en la cabecera y en las filas. */
const TODAY_HEAD_CLASS = 'bg-blue-100 dark:bg-blue-900/40';
const TODAY_CELL_CLASS = 'bg-blue-50 dark:bg-blue-900/20';

/**
 * Cuadrícula alumnos × días del mes en pantalla, agrupada por semana:
 * encabezado de dos filas, columnas "N°" y "Estudiante" fijas al desplazar
 * horizontalmente, y una celda por día con el estado de asistencia (nunca
 * solo color: siempre letra + tooltip con el nombre del estado). La columna
 * del día de hoy va remarcada, y con la etiqueta "HOY" para no depender solo
 * del color.
 */
export const AttendanceGridTable: React.FC<{
  groups: DayGroup[];
  rows: AttendanceGridRow[];
  today: Date;
}> = ({ groups, rows, today }) => {
  const days = groups.flatMap((group) => group.days);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="overflow-x-auto border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
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
              {days.map((day) => {
                const isToday = isSameDay(day.date, today);
                return (
                  <th
                    key={day.date.toISOString()}
                    aria-current={isToday ? 'date' : undefined}
                    className={cn(
                      'w-11 border-b border-l border-slate-200 p-1.5 text-center dark:border-slate-800',
                      isToday ? TODAY_HEAD_CLASS : 'bg-slate-50 dark:bg-slate-800/50',
                    )}
                  >
                    <span
                      className={cn(
                        'block text-sm font-bold leading-tight',
                        isToday
                          ? 'text-blue-800 dark:text-blue-200'
                          : 'text-slate-700 dark:text-slate-200',
                      )}
                    >
                      {day.dayLabel}
                    </span>
                    <span
                      className={cn(
                        'block text-xs font-semibold leading-tight',
                        isToday
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-slate-400 dark:text-slate-500',
                      )}
                    >
                      {isToday ? 'HOY' : day.weekdayLabel}
                    </span>
                  </th>
                );
              })}
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
                  const isToday = isSameDay(days[i].date, today);
                  return (
                    <td
                      key={days[i].date.toISOString()}
                      className={cn('p-1.5 text-center', isToday && TODAY_CELL_CLASS)}
                    >
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
