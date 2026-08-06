import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  User,
} from 'lucide-react';

import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { CATEGORY_BADGE_CLASSES } from '@/features/classrooms/incident.badges';
import { INCIDENT_TONE_STYLES } from '@/features/classrooms/student-detail.attendance';
import type { PersonalIncidentEntry } from '@/features/classrooms/types';
import { cn } from '@/lib/utils';

import { DetailCard } from './DetailCard';

/**
 * Historial de incidencias del estudiante en el mes: incidencias de conducta
 * registradas por los docentes más las faltas y tardanzas del calendario, de
 * la más reciente a la más antigua.
 *
 * Comparte las tres bandas de `DetailCard` con la columna de Asistencia y en
 * el mismo orden —cabecera con "Descargar", cuerpo y pie—, así que las líneas
 * de las dos columnas caen a la misma altura. El mes se elige una sola vez en
 * la cabecera de la ficha (`MonthNavigator`), así que esta tarjeta no repite
 * ninguna etiqueta de periodo: las dos miran siempre el mismo mes.
 */
export const PersonalIncidentsCard: React.FC<{
  paginatedIncidents: PersonalIncidentEntry[];
  hasIncidents: boolean;
  incidentsPage: number;
  totalIncidentPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onDownloadIncidents: () => void;
  className?: string;
}> = ({
  className,
  paginatedIncidents,
  hasIncidents,
  incidentsPage,
  totalIncidentPages,
  onPrevPage,
  onNextPage,
  onDownloadIncidents,
}) => (
  <DetailCard
    className={className}
    icon={AlertTriangle}
    tone="rose"
    title="Incidencias"
    action={
      <Button
        type="button"
        variant="outline"
        onClick={onDownloadIncidents}
        className="h-11 shrink-0 gap-2 rounded-xl px-4 text-sm font-semibold"
      >
        <Download size={20} strokeWidth={2} /> Descargar
      </Button>
    }
    footer={
      // Se muestra siempre que haya historial, aunque solo haya una página: si
      // apareciera y desapareciera según el mes, el pie de esta columna dejaría
      // de coincidir con la leyenda de la de Asistencia.
      hasIncidents ? (
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevPage}
            disabled={incidentsPage === 1}
            className="h-11 gap-2 rounded-xl px-4 text-sm font-semibold"
          >
            <ChevronLeft size={20} strokeWidth={2} /> Anterior
          </Button>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Página {incidentsPage} de {totalIncidentPages}
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={onNextPage}
            disabled={incidentsPage === totalIncidentPages}
            className="h-11 gap-2 rounded-xl px-4 text-sm font-semibold"
          >
            Siguiente <ChevronRight size={20} strokeWidth={2} />
          </Button>
        </div>
      ) : undefined
    }
  >
    {hasIncidents ? (
      <ul className="flex flex-col gap-3">
        {paginatedIncidents.map((incident) => {
          const Icon = incident.icon;
          return (
            <li
              key={incident.id}
              className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <span
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2',
                  INCIDENT_TONE_STYLES[incident.tone],
                )}
              >
                <Icon size={24} strokeWidth={2} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">{incident.label}</h3>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                      CATEGORY_BADGE_CLASSES[incident.category],
                    )}
                  >
                    {incident.category}
                  </span>
                </div>

                <p className="mt-1 text-base text-slate-600 dark:text-slate-300">{incident.description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={16} strokeWidth={2} />
                    {incident.dateLabel}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} strokeWidth={2} />
                    {incident.time}
                  </span>
                  {incident.teacher && (
                    <span className="flex items-center gap-1.5">
                      <User size={16} strokeWidth={2} />
                      {incident.teacher}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    ) : (
      <EmptyState
        icon={CheckCircle2}
        title="Sin incidencias este mes"
        description="No hay faltas, tardanzas ni incidencias de conducta registradas. Cambia de mes con las flechas de Asistencia para revisar otro periodo."
      />
    )}
  </DetailCard>
);
