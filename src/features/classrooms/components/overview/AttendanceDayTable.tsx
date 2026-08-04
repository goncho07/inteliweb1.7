import React from 'react';

import { formatStudentDisplayName } from '@/features/classrooms/overview.format';
import { ATTENDANCE_CELL_META, type AttendanceGridRow } from '@/features/classrooms/overview.rows';

/**
 * Tabla de un solo día (pestañas de periodo "Hoy" y "Día"): una fila por
 * alumno con su estado de ese día. Recibe las mismas `rows` que la
 * cuadrícula (cada una con un solo día) para que lo que se ve en pantalla y
 * lo que se descarga sean siempre el mismo dato — no hace falta la
 * cuadrícula de semanas de la vista de mes/bimestre para un único día.
 */
export const AttendanceDayTable: React.FC<{ rows: AttendanceGridRow[] }> = ({ rows }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
    <table className="w-full min-w-[480px] border-collapse text-left text-sm">
      <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
        <tr>
          <th className="w-14 p-3 text-center">N°</th>
          <th className="p-3">Estudiante</th>
          <th className="w-40 p-3 text-center">Estado</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {rows.map((row, index) => {
          const meta = ATTENDANCE_CELL_META[row.cells[0] ?? 'sin-clase'];
          return (
            <tr key={row.id}>
              <td className="p-3 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">{index + 1}</td>
              <td className="whitespace-nowrap p-3 font-semibold text-slate-800 dark:text-white">
                {formatStudentDisplayName(row.name)}
              </td>
              <td className="p-3 text-center">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${meta.badgeClassName}`}>
                  {meta.letter} · {meta.label}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
