import React from 'react';

import { getEventBadgeStyles, getEventColor } from '@/lib/calendar';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/types';

import { EVENT_TYPE_LEGEND_LABELS, EVENT_TYPE_OPTIONS } from '../calendar.constants';

const WEEKDAY_LABELS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];
const WEEKEND_INDEXES = new Set([5, 6]);
/** Chips visibles por día antes de resumir el resto en "+N más". */
const MAX_CHIPS_PER_DAY = 2;

/**
 * Cuadrícula mensual (o semanal) del calendario general, con el mismo
 * lenguaje visual que usaba el calendario de Citaciones: celdas de día con número
 * circular, chips de evento por color/tipo, altura de fila ajustada a las
 * semanas reales del mes y una leyenda de tipos al pie.
 */
export const CalendarMonthGrid: React.FC<{
  currentMonthIndex: number;
  currentYear: number;
  viewMode: 'mes' | 'semana';
  selectedDay: number | null;
  onDayClick: (day: number) => void;
  eventsForDay: (day: number) => CalendarEvent[];
}> = ({ currentMonthIndex, currentYear, viewMode, selectedDay, onDayClick, eventsForDay }) => {
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const rawFirstDayIndex = new Date(currentYear, currentMonthIndex, 1).getDay();
  const firstDayIndex = rawFirstDayIndex === 0 ? 6 : rawFirstDayIndex - 1;
  // Solo las semanas que el mes realmente necesita (5 o 6) — nada de una
  // fila final en blanco sin días.
  const weeksInMonth = Math.ceil((firstDayIndex + daysInMonth) / 7);
  const calendarCells = Array.from({ length: weeksInMonth * 7 }, (_, i) =>
    i < firstDayIndex || i >= firstDayIndex + daysInMonth ? null : i - firstDayIndex + 1,
  );

  const monthLabel = new Date(currentYear, currentMonthIndex, 1).toLocaleDateString('es-ES', { month: 'long' });
  const today = new Date();

  // Vista semana: solo se pinta la fila que contiene el día seleccionado.
  const selectedRow =
    viewMode === 'semana' && selectedDay !== null ? Math.floor((firstDayIndex + selectedDay - 1) / 7) : null;
  const displayedCells = selectedRow !== null ? calendarCells.slice(selectedRow * 7, selectedRow * 7 + 7) : calendarCells;
  const rowCount = selectedRow !== null ? 1 : weeksInMonth;

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/60">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800/60">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={cn(
                'border-l border-slate-200 py-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400 first:border-l-0 dark:border-slate-800/60',
                WEEKEND_INDEXES.has(i) && 'bg-slate-50 dark:bg-slate-900/40',
              )}
            >
              {label}
            </div>
          ))}
        </div>

        <div
          className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800/60"
          style={{ gridTemplateRows: `repeat(${rowCount}, minmax(88px, 1fr))` }}
        >
          {displayedCells.map((day, i) => {
            if (day === null) {
              return <div key={i} className="bg-white dark:bg-slate-900" />;
            }

            const dayEvents = eventsForDay(day);
            const isSelected = selectedDay === day;
            const isToday =
              today.getDate() === day &&
              today.getMonth() === currentMonthIndex &&
              today.getFullYear() === currentYear;
            const visibleEvents = dayEvents.slice(0, MAX_CHIPS_PER_DAY);
            const overflowCount = dayEvents.length - visibleEvents.length;

            return (
              <button
                key={i}
                type="button"
                onClick={() => onDayClick(day)}
                aria-label={`Ver eventos del ${day} de ${monthLabel}`}
                className={cn(
                  'flex flex-col gap-1.5 overflow-hidden bg-white p-2 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary dark:bg-slate-900 dark:hover:bg-slate-800/60',
                  isSelected && 'ring-2 ring-inset ring-primary',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                    isToday ? 'bg-primary text-primary-foreground' : 'text-slate-500 dark:text-slate-400',
                  )}
                >
                  {day}
                </span>

                <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                  {visibleEvents.map((ev, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        'truncate rounded-lg border px-1.5 py-1 text-xs font-semibold leading-tight',
                        getEventBadgeStyles(ev.type),
                      )}
                    >
                      {ev.label}
                    </span>
                  ))}
                  {overflowCount > 0 && (
                    <span className="text-xs font-bold text-slate-400">+{overflowCount} más</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 dark:border-slate-800/60 dark:bg-slate-900">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Eventos</span>
        {EVENT_TYPE_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center gap-1.5">
            <span className={cn('h-2.5 w-2.5 rounded-full', getEventColor(option.value))} />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {EVENT_TYPE_LEGEND_LABELS[option.value]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
