import React from 'react';

import { MONTH_NAMES } from '@/data/calendar';
import { getEventColor } from '@/lib/calendar';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/types';

const WEEKDAY_INITIALS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/**
 * Un mes en miniatura dentro de la vista Año: solo vista previa, no un
 * segundo selector de día — el único control es el nombre del mes, que
 * lleva directo a la vista Mes de ese mes.
 */
const MiniMonth: React.FC<{
  monthIndex: number;
  year: number;
  onSelect: () => void;
  getEventsFor: (monthIndex: number, day: number) => CalendarEvent[];
}> = ({ monthIndex, year, onSelect, getEventsFor }) => {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const rawFirstDayIndex = new Date(year, monthIndex, 1).getDay();
  const firstDayIndex = rawFirstDayIndex === 0 ? 6 : rawFirstDayIndex - 1;
  const cells = Array.from({ length: Math.ceil((firstDayIndex + daysInMonth) / 7) * 7 }, (_, i) =>
    i < firstDayIndex || i >= firstDayIndex + daysInMonth ? null : i - firstDayIndex + 1,
  );
  const today = new Date();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800/60 dark:bg-slate-900">
      <button
        type="button"
        onClick={onSelect}
        className="mb-3 flex h-10 w-full items-center rounded-lg px-2 text-left text-base font-bold text-slate-800 transition-colors hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800/60"
      >
        {MONTH_NAMES[monthIndex]}
      </button>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_INITIALS.map((label, i) => (
          <span
            key={i}
            className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
          >
            {label}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />;
          const dayEvents = getEventsFor(monthIndex, day);
          const isToday = today.getDate() === day && today.getMonth() === monthIndex && today.getFullYear() === year;
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 py-0.5">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                  isToday ? 'bg-primary text-primary-foreground' : 'text-slate-600 dark:text-slate-300',
                )}
              >
                {day}
              </span>
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  dayEvents.length > 0 ? getEventColor(dayEvents[0].type) : 'bg-transparent',
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Vista Año del calendario general: los 12 meses en miniatura, con un punto
 * de color bajo los días que tienen algún evento. Solo el nombre del mes es
 * interactivo (lleva a la vista Mes); los días son una vista previa.
 */
export const CalendarYearGrid: React.FC<{
  year: number;
  onSelectMonth: (monthIndex: number) => void;
  getEventsFor: (monthIndex: number, day: number) => CalendarEvent[];
}> = ({ year, onSelectMonth, getEventsFor }) => (
  <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
    {MONTH_NAMES.map((_, monthIndex) => (
      <MiniMonth
        key={monthIndex}
        monthIndex={monthIndex}
        year={year}
        onSelect={() => onSelectMonth(monthIndex)}
        getEventsFor={getEventsFor}
      />
    ))}
  </div>
);
