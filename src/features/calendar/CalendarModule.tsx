import React, { useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  ModuleBody,
  ModulePane,
  ModulePaneHeader,
  ModuleShell,
  ModuleSidebar,
  ModuleSidebarBody,
  ModuleSidebarSection,
} from '@/components/layout/ModuleShell';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  CITATIONS_2026,
  EVENTS_2026,
  SCHEDULE_TIME_SLOTS,
  TEACHER_SCHEDULE,
} from '@/data/calendar';
import { getEventBadgeStyles, getEventColor } from '@/lib/calendar';
import { cn } from '@/lib/utils';
import type { CalendarEvent, ModuleProps } from '@/types';

import { CalendarAgendaView } from './components/CalendarAgendaView';
import { CalendarMonthGrid } from './components/CalendarMonthGrid';
import { CalendarYearGrid } from './components/CalendarYearGrid';

type CalendarViewMode = 'dia' | 'semana' | 'mes' | 'año' | 'agenda';

const getDayName = (date: Date) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Módulo "Calendario": pantalla propia (accesible desde "Herramientas") con
 * la anatomía estándar de módulo — sidebar con el horario docente; panel
 * principal con el selector Mes/Semana/Día, la cuadrícula del mes (con sus
 * eventos) y el detalle de eventos del día seleccionado.
 */
export const CalendarModule: React.FC<ModuleProps> = ({ globalDate, setGlobalDate }) => {
  const today = globalDate ?? new Date();
  const [viewMode, setViewMode] = useState<CalendarViewMode>('mes');
  const [calendarDate, setCalendarDate] = useState(new Date(today));
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const currentMonthIndex = calendarDate.getMonth();
  const currentYear = calendarDate.getFullYear();

  const getEventsFor = (monthIndex: number, day: number): CalendarEvent[] => {
    const key = `${monthIndex}-${day}`;
    return [...(EVENTS_2026[key] ?? []), ...(CITATIONS_2026[key] ?? [])];
  };

  const eventsForDay = (day: number): CalendarEvent[] => getEventsFor(currentMonthIndex, day);

  const goToMonth = (offset: number) => setCalendarDate(new Date(currentYear, currentMonthIndex + offset, 1));
  const goToYear = (offset: number) => setCalendarDate(new Date(currentYear + offset, currentMonthIndex, 1));
  const goPrev = () => (viewMode === 'año' ? goToYear(-1) : goToMonth(-1));
  const goNext = () => (viewMode === 'año' ? goToYear(1) : goToMonth(1));

  const goToToday = () => {
    const now = new Date();
    setCalendarDate(new Date(now));
    setSelectedDay(now.getDate());
    setGlobalDate?.(now);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setGlobalDate?.(new Date(currentYear, currentMonthIndex, day));
  };

  const selectedDayEvents = selectedDay ? eventsForDay(selectedDay) : [];
  const selectedWeekday = selectedDay ? getDayName(new Date(currentYear, currentMonthIndex, selectedDay)) : null;
  const todayScheduleDay = getDayName(today);
  const monthLabel = capitalize(calendarDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
  const headerLabel = viewMode === 'año' ? String(currentYear) : monthLabel;
  const stepLabel = viewMode === 'año' ? 'año' : 'mes';

  return (
    <ModuleShell>
      <ModuleSidebar title="Calendario" icon={CalendarDays}>
        <ModuleSidebarBody>
          <ModuleSidebarSection label={`Tu horario: ${selectedWeekday ?? todayScheduleDay}`}>
            {SCHEDULE_TIME_SLOTS.map((slot, i) => {
              const weekday = selectedWeekday ?? todayScheduleDay;
              const classData = TEACHER_SCHEDULE[weekday]?.find((t) => t.start === slot.start);
              // Alto e interlineado únicos para las tres variantes de franja,
              // para que el horario lea como una sola lista.
              const rowClass = 'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2';
              if (slot.isRecreo) {
                return (
                  <div key={i} className={cn(rowClass, 'bg-slate-50 dark:bg-slate-800/60')}>
                    <span className="w-12 shrink-0 text-sm font-bold text-slate-400">{slot.start}</span>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Recreo</span>
                  </div>
                );
              }
              if (!classData || classData.subject === 'LIBRE') {
                return (
                  <div
                    key={i}
                    className={cn(rowClass, 'border border-dashed border-slate-200 dark:border-slate-700')}
                  >
                    <span className="w-12 shrink-0 text-sm font-bold text-slate-400">{slot.start}</span>
                    <span className="text-sm font-semibold italic text-slate-400">Hora libre</span>
                  </div>
                );
              }
              return (
                <div key={i} className={cn(rowClass, 'border', classData.color)}>
                  <span className="w-12 shrink-0 text-sm font-bold opacity-70">{slot.start}</span>
                  <span className="flex-1 truncate text-sm font-bold">{classData.subject}</span>
                  {classData.section && (
                    <span className="shrink-0 text-sm font-bold opacity-70">{classData.section}</span>
                  )}
                </div>
              );
            })}
          </ModuleSidebarSection>
        </ModuleSidebarBody>
      </ModuleSidebar>

      <ModulePane>
        <ModulePaneHeader>
          <div className="flex min-w-0 items-center gap-3">
            <h2 className="truncate text-lg font-bold text-slate-800 dark:text-white">{headerLabel}</h2>
            <div className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {([
                ['dia', 'Día'],
                ['semana', 'Semana'],
                ['mes', 'Mes'],
                ['año', 'Año'],
                ['agenda', 'Agenda'],
              ] as [CalendarViewMode, string][]).map(([mode, label]) => (
                <Button
                  key={mode}
                  type="button"
                  variant="ghost"
                  onClick={() => setViewMode(mode)}
                  aria-pressed={viewMode === mode}
                  className={cn(
                    'h-auto rounded-lg px-4 py-2 text-sm font-bold transition-colors hover:bg-transparent',
                    viewMode === mode
                      ? 'bg-white text-blue-700 shadow-sm hover:bg-white dark:bg-slate-700 dark:text-blue-400 dark:hover:bg-slate-700'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                  )}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-xl border-slate-300 font-semibold dark:border-slate-700"
              onClick={goToToday}
            >
              Hoy
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={goPrev}
                  aria-label={`${capitalize(stepLabel)} anterior`}
                  className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <ChevronLeft size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{capitalize(stepLabel)} anterior</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={goNext}
                  aria-label={`${capitalize(stepLabel)} siguiente`}
                  className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <ChevronRight size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{capitalize(stepLabel)} siguiente</TooltipContent>
            </Tooltip>
          </div>
        </ModulePaneHeader>

        <ModuleBody centered>
          {viewMode === 'dia' ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {selectedDay
                  ? new Date(currentYear, currentMonthIndex, selectedDay).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })
                  : 'Selecciona un día'}
              </p>
              {selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400 dark:border-slate-700">
                  <CalendarDays size={28} className="mb-2 opacity-50" />
                  <p className="text-sm font-medium">No hay eventos para este día.</p>
                </div>
              ) : (
                selectedDayEvents.map((ev, i) => (
                  <div
                    key={i}
                    className={cn('flex items-center gap-3 rounded-2xl border px-4 py-3', getEventBadgeStyles(ev.type))}
                  >
                    <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', getEventColor(ev.type))} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold">{ev.label}</p>
                      {ev.reason && <p className="truncate text-sm opacity-70">{ev.reason}</p>}
                    </div>
                    {ev.time && <span className="shrink-0 text-sm font-bold opacity-70">{ev.time}</span>}
                  </div>
                ))
              )}
            </div>
          ) : viewMode === 'año' ? (
            <CalendarYearGrid
              year={currentYear}
              getEventsFor={getEventsFor}
              onSelectMonth={(monthIndex) => {
                setCalendarDate(new Date(currentYear, monthIndex, 1));
                setViewMode('mes');
              }}
            />
          ) : viewMode === 'agenda' ? (
            <CalendarAgendaView
              monthIndex={currentMonthIndex}
              year={currentYear}
              monthLabel={monthLabel}
              getEventsFor={getEventsFor}
              onSelectDay={(day) => {
                handleDayClick(day);
                setViewMode('dia');
              }}
            />
          ) : (
            <CalendarMonthGrid
              currentMonthIndex={currentMonthIndex}
              currentYear={currentYear}
              viewMode={viewMode === 'semana' ? 'semana' : 'mes'}
              selectedDay={selectedDay}
              onDayClick={handleDayClick}
              eventsForDay={eventsForDay}
            />
          )}
        </ModuleBody>
      </ModulePane>
    </ModuleShell>
  );
};
