import React from 'react';
import { AlertTriangle, Briefcase, Calendar, CheckCircle2, Clock, Download } from 'lucide-react';

import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { CATEGORY_BADGE_CLASSES, CATEGORY_ORDER } from '@/features/classrooms/incident.badges';
import { INCIDENT_TONE_STYLES } from '@/features/classrooms/student-detail.attendance';
import type { PersonalIncidentEntry } from '@/features/classrooms/types';
import { cn } from '@/lib/utils';

import { DetailCard } from './DetailCard';

/**
 * Historial de incidencias de conducta del estudiante en el mes, de la más
 * reciente a la más antigua — completo, sin paginar: el volumen mensual de
 * un solo alumno es bajo, así que recortarlo solo obligaba a un clic de más.
 *
 * Comparte las tres bandas de `DetailCard` con la columna de Asistencia y en
 * el mismo orden —cabecera con "Descargar", cuerpo y pie—, así que las líneas
 * de las dos columnas caen a la misma altura. El pie repite la leyenda de
 * gravedad (`CATEGORY_ORDER`/`CATEGORY_BADGE_CLASSES`, la misma que usa la
 * Vista General del Aula) para que el pie de esta columna mida lo mismo que
 * la leyenda de Asistencia, en vez de quedar más corto. El mes se elige una
 * sola vez en la cabecera de la ficha (`MonthNavigator`), así que esta
 * tarjeta no repite ninguna etiqueta de periodo.
 */
export const PersonalIncidentsCard: React.FC<{
  incidents: PersonalIncidentEntry[];
  onDownloadIncidents: () => void;
  className?: string;
}> = ({ className, incidents, onDownloadIncidents }) => {
  const hasIncidents = incidents.length > 0;

  return (
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
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {CATEGORY_ORDER.map((category) => (
              <div key={category} className="flex items-center gap-2">
                <span
                  className={cn('h-4 w-4 shrink-0 rounded-full border-2', CATEGORY_BADGE_CLASSES[category])}
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{category}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Incidencias de conducta del mes, de la más reciente a la más antigua.
          </p>
        </div>
      }
    >
      {hasIncidents ? (
        <ul className="flex flex-col gap-3">
          {incidents.map((incident) => {
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
                        <Briefcase size={16} strokeWidth={2} />
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
          description="No hay incidencias de conducta registradas. Cambia de mes con las flechas de Asistencia para revisar otro periodo."
        />
      )}
    </DetailCard>
  );
};
