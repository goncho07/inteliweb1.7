import React from 'react';
import { CalendarDays } from 'lucide-react';

import { DAY_NAMES } from '@/data/calendar';
import { getEventBadgeStyles, getEventColor } from '@/lib/calendar';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/types';

/**
 * Vista Agenda del calendario general: los eventos del mes visible,
 * ordenados por día, en una lista — la alternativa a la cuadrícula para
 * quien prefiere leer una lista antes que escanear una grilla. Clic en un
 * día lleva a la vista Día con el detalle completo.
 */
export const CalendarAgendaView: React.FC<{
  monthIndex: number;
  year: number;
  monthLabel: string;
  getEventsFor: (monthIndex: number, day: number) => CalendarEvent[];
  onSelectDay: (day: number) => void;
}> = ({ monthIndex, year, monthLabel, getEventsFor, onSelectDay }) => {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const today = new Date();

  const daysWithEvents = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .map((day) => ({ day, events: getEventsFor(monthIndex, day) }))
    .filter(({ events }) => events.length > 0);

  if (daysWithEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400 dark:border-slate-700">
        <CalendarDays size={28} className="mb-2 opacity-50" />
        <p className="text-sm font-medium">No hay eventos en {monthLabel}.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {daysWithEvents.map(({ day, events }) => {
        const isToday = today.getDate() === day && today.getMonth() === monthIndex && today.getFullYear() === year;
        const weekday = DAY_NAMES[new Date(year, monthIndex, day).getDay()];
        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelectDay(day)}
            aria-label={`Ver eventos del ${day} de ${monthLabel}`}
            className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-slate-800/60 dark:bg-slate-900 dark:hover:bg-slate-800/60"
          >
            <div className="flex w-14 shrink-0 flex-col items-center">
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-base font-bold',
                  isToday
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
                )}
              >
                {day}
              </span>
              <span className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {weekday}
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {events.map((ev, i) => (
                <div
                  key={i}
                  className={cn('flex items-center gap-2 rounded-xl border px-3 py-2', getEventBadgeStyles(ev.type))}
                >
                  <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', getEventColor(ev.type))} />
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold">{ev.label}</p>
                  {ev.time && <span className="shrink-0 text-sm font-bold opacity-70">{ev.time}</span>}
                </div>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
};
