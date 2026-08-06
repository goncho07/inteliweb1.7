import React from 'react';
import { CalendarCheck, Download, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ATTENDANCE_LEGEND,
  ATTENDANCE_STATUS_STYLES,
} from '@/features/classrooms/student-detail.attendance';
import { type AttendanceCalendarDay, isJustifiable } from '@/features/classrooms/types';
import { cn } from '@/lib/utils';

import { DetailCard } from './DetailCard';

/** Cabeceras de la rejilla: la semana empieza en lunes, como el calendario escolar. */
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Asistencia del mes del estudiante, día a día.
 *
 * Justificar una falta se hace pulsando su día, así que cada día justificable
 * es un `button` de verdad —alcanzable con el tabulador, con foco visible— y
 * lleva un escudo dibujado encima: la acción se ve sin pasar el ratón, que era
 * el problema del diseño anterior (un panel negro que solo aparecía al hacer
 * hover y que el teclado nunca llegaba a mostrar).
 *
 * Usa las tres bandas de `DetailCard` en el mismo orden que Incidencias: el
 * cuerpo abre directo con la rejilla de días —el mes se elige una sola vez,
 * arriba en la cabecera de la ficha, y gobierna esta tarjeta y la de
 * Incidencias a la vez— y la leyenda va en el pie.
 */
export const AttendanceHeatmapCard: React.FC<{
  calendarData: (AttendanceCalendarDay | null)[];
  onDownloadAttendance: () => void;
  onDayClick: (record: AttendanceCalendarDay) => void;
  /** Justificar una falta/tardanza es una acción del docente: el apoderado solo consulta. */
  canJustify?: boolean;
  className?: string;
}> = ({ className, calendarData, onDownloadAttendance, onDayClick, canJustify = true }) => (
  <TooltipProvider delayDuration={200}>
    <DetailCard
      className={className}
      icon={CalendarCheck}
      tone="emerald"
      title="Asistencia"
      action={
        <Button
          type="button"
          variant="outline"
          onClick={onDownloadAttendance}
          className="h-11 shrink-0 gap-2 rounded-xl px-4 text-sm font-semibold"
        >
          <Download size={20} strokeWidth={2} /> Descargar
        </Button>
      }
      footer={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {ATTENDANCE_LEGEND.map((status) => (
              <div key={status} className="flex items-center gap-2">
                <span
                  className={cn(
                    'h-4 w-4 shrink-0 rounded-full border-2',
                    ATTENDANCE_STATUS_STYLES[status].dot,
                  )}
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {status}
                </span>
              </div>
            ))}
          </div>

          {canJustify && (
            <p className="flex items-center justify-center gap-2 text-center text-sm text-slate-500 dark:text-slate-400">
              <ShieldCheck size={16} strokeWidth={2} className="shrink-0" />
              Pulsa un día marcado con el escudo para justificar la falta o la tardanza.
            </p>
          )}
        </div>
      }
    >
      {/* Cabecera y días son dos rejillas, no una: así las filas de días
          pueden repartirse el alto sobrante (`auto-rows-fr`) sin que la fila
          de "LUN MAR MIÉ…" se estire con ellas. */}
      <div className="grid w-full grid-cols-7 gap-2 pb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Siempre 6 filas (`buildAttendanceMonth` rellena hasta 42 celdas), así
          que el bloque mide lo mismo en febrero que en un mes de 31 días.
          Las celdas son rectangulares —ancho el que toque, alto el que sobre—
          en vez de cuadradas: cuadradas, a 1000px de panel, cada día sería un
          bloque de 130px y el mes dejaría de leerse de un vistazo. */}
      <div className="grid w-full flex-1 auto-rows-fr grid-cols-7 gap-2">
        {calendarData.map((record, index) => {
          if (!record) return <div key={`hueco-${index}`} className="min-h-16" />;

          const style = ATTENDANCE_STATUS_STYLES[record.status];
          const cellClasses = cn(
            'relative flex h-full min-h-16 w-full items-center justify-center rounded-xl border-2 text-lg font-bold',
            record.isWeekend
              ? 'border-transparent bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-500'
              : style.cell,
          );

          if (!canJustify || !isJustifiable(record)) {
            return (
              <div key={record.date} className={cellClasses}>
                <span>{record.dayNumber}</span>
                <span className="sr-only">
                  {record.isWeekend ? 'Fin de semana' : record.status}
                </span>
              </div>
            );
          }

          return (
            <Tooltip key={record.date}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onDayClick(record)}
                  className={cn(
                    cellClasses,
                    'transition-shadow hover:ring-2 hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                  )}
                >
                  <span>{record.dayNumber}</span>
                  {/* Marca siempre visible: este día se puede justificar. */}
                  <ShieldCheck
                    size={16}
                    strokeWidth={2.5}
                    className="absolute bottom-1 right-1"
                    aria-hidden
                  />
                  <span className="sr-only">{`${record.status} — justificar`}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>{`${record.status} · Pulsa para justificar`}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </DetailCard>
  </TooltipProvider>
);
