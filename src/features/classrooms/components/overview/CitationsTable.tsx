import React from 'react';

import { CitationStatusBadge } from '@/features/citations/components/CitationStatusBadge';
import type { Citation } from '@/features/citations/types';

/**
 * Tabla N°/Estudiante/Fecha/Motivo/Apoderado/Estado de la pestaña
 * Citaciones: lectura de `INITIAL_CITATIONS` (el mismo dato que gestiona el
 * módulo Citaciones), filtrado por aula y periodo — las citaciones se crean
 * y editan solo allí, aquí solo se consultan.
 */
export const CitationsTable: React.FC<{ citations: Citation[] }> = ({ citations }) => (
  <div className="overflow-x-auto border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <table className="w-full min-w-[820px] border-collapse text-left text-sm">
      <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
        <tr>
          <th className="w-14 p-3 text-center">N°</th>
          <th className="p-3">Estudiante</th>
          <th className="w-32 p-3">Fecha citación</th>
          <th className="p-3">Motivo de citación</th>
          <th className="p-3">Apoderado citado</th>
          <th className="w-36 p-3">Estado</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {citations.map((citation, index) => (
          <tr key={citation.id}>
            <td className="p-3 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">{index + 1}</td>
            <td className="whitespace-nowrap p-3 font-semibold text-slate-800 dark:text-white">{citation.student}</td>
            <td className="whitespace-nowrap p-3 text-slate-600 dark:text-slate-300">
              {citation.date} · {citation.time}
            </td>
            <td className="p-3 text-slate-600 dark:text-slate-300">{citation.reason}</td>
            <td className="whitespace-nowrap p-3 text-slate-600 dark:text-slate-300">
              {citation.parent}
              <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">({citation.relationship})</span>
            </td>
            <td className="p-3">
              <CitationStatusBadge status={citation.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
