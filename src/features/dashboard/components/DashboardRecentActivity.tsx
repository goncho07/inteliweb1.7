import React from 'react';
import { CalendarCheck, ShieldAlert } from 'lucide-react';

import { ChartCard } from '@/components/charts/ChartCard';
import { EmptyState } from '@/components/common/EmptyState';
import { CitationsTable } from '@/features/classrooms/components/overview/CitationsTable';
import { IncidentsTable } from '@/features/classrooms/components/overview/IncidentsTable';
import type { Citation } from '@/features/citations/types';

import type { RecentIncident } from '../dashboard.recent';

/**
 * "Últimas incidencias" y "Últimas citaciones" del panel Inicio, para docentes
 * y auxiliares: lo que ha pasado en sus aulas desde la última vez que
 * entraron. Un directivo no las ve — su panel es el consolidado del colegio,
 * no el día a día de un aula concreta.
 *
 * Las dos tablas son las mismas de la Vista General del Aula
 * (`IncidentsTable`, `CitationsTable`), con su columna "Aula" activada porque
 * aquí conviven varias. Ni los datos ni las tablas se duplican: las
 * incidencias se registran en el perfil del alumno y las citaciones en su
 * módulo — este apartado solo las lista.
 */
export const DashboardRecentActivity: React.FC<{
  incidents: RecentIncident[];
  citations: Citation[];
}> = ({ incidents, citations }) => (
  <section>
    <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      Actividad reciente
    </h2>
    <div className="grid grid-cols-1 gap-4 lg:gap-6">
      <ChartCard title="Últimas incidencias" bodyClassName="overflow-visible">
        {incidents.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="Sin incidencias recientes"
            description="Cuando se registre una incidencia en las aulas que ves, aparecerá aquí."
            className="min-h-[160px]"
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <IncidentsTable rows={incidents} classroomLabels />
          </div>
        )}
      </ChartCard>

      <ChartCard title="Últimas citaciones" bodyClassName="overflow-visible">
        {citations.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="Sin citaciones registradas"
            description="Las citaciones a apoderados aparecerán aquí en cuanto se creen, desde el módulo Citaciones."
            className="min-h-[160px]"
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <CitationsTable citations={citations} classroomLabels />
          </div>
        )}
      </ChartCard>
    </div>
  </section>
);
