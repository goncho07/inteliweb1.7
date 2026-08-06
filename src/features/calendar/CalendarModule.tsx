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
  getStudentSchedule,
  SCHEDULE_TIME_SLOTS,
  TEACHER_SCHEDULE,
} from '@/data/calendar';
import { useSession } from '@/features/auth/SessionContext';
import { cn } from '@/lib/utils';
import type { CalendarEvent, ModuleProps } from '@/types';

import { CalendarMonthGrid } from './components/CalendarMonthGrid';

const getDayName = (date: Date) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Módulo "Calendario": pantalla propia (accesible desde "Herramientas") con
 * la anatomía estándar de módulo — sidebar con el horario docente; panel
 * principal con la cuadrícula del mes y sus eventos. Una sola vista, la
 * mensual: el selector Día/Semana/Mes/Año/Agenda multiplicaba las formas de
 * ver lo mismo sin que ninguna aportara algo que el mes no mostrara ya.
 */
export const CalendarModule: React.FC<ModuleProps> = ({ globalDate, setGlobalDate }) => {
  const session = useSession();
  const isGuardian = session.role === 'apoderado';
  const child = isGuardian ? session.children[0] : null;

  const today = globalDate ?? new Date();
  const [calendarDate, setCalendarDate] = useState(new Date(today));
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const currentMonthIndex = calendarDate.getMonth();
  const currentYear = calendarDate.getFullYear();

  const getEventsFor = (monthIndex: number, day: number): CalendarEvent[] => {
    const key = `${monthIndex}-${day}`;
    // El apoderado solo ve las citaciones de su propio hijo, nunca las del resto del alumnado.
    const citations = (CITATIONS_2026[key] ?? []).filter(
      (citation) => !isGuardian || citation.student === child?.name,
    );
    return [...(EVENTS_2026[key] ?? []), ...citations];
  };

  const eventsForDay = (day: number): CalendarEvent[] => getEventsFor(currentMonthIndex, day);

  const goToMonth = (offset: number) => setCalendarDate(new Date(currentYear, currentMonthIndex + offset, 1));

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

  const selectedWeekday = selectedDay ? getDayName(new Date(currentYear, currentMonthIndex, selectedDay)) : null;
  const todayScheduleDay = getDayName(today);
  const monthLabel = capitalize(calendarDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));

  const scheduleWeekday = selectedWeekday ?? todayScheduleDay;
  const guardianDaySchedule =
    isGuardian && child
      ? getStudentSchedule(child.level ?? 'Primaria', child.grade ?? '', child.section ?? '', scheduleWeekday)
      : null;
  const sidebarLabel = isGuardian
    ? `Horario de ${child?.name.split(' ')[0] ?? 'tu hijo'}: ${scheduleWeekday}`
    : `Tu horario: ${scheduleWeekday}`;

  return (
    <ModuleShell>
      <ModuleSidebar title="Calendario" icon={CalendarDays}>
        <ModuleSidebarBody>
          <ModuleSidebarSection label={sidebarLabel}>
            {SCHEDULE_TIME_SLOTS.map((slot, i) => {
              const classData = isGuardian
                ? guardianDaySchedule?.[i]
                : TEACHER_SCHEDULE[scheduleWeekday]?.find((t) => t.start === slot.start);
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
            <h2 className="truncate text-lg font-bold text-slate-800 dark:text-white">{monthLabel}</h2>
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
                  onClick={() => goToMonth(-1)}
                  aria-label="Mes anterior"
                  className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <ChevronLeft size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mes anterior</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => goToMonth(1)}
                  aria-label="Mes siguiente"
                  className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <ChevronRight size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mes siguiente</TooltipContent>
            </Tooltip>
          </div>
        </ModulePaneHeader>

        {/* A sangre, como la tabla de Usuarios: la pantalla *es* la
            cuadrícula, así que llega a los bordes del panel y estira sus
            filas al alto real disponible, sin margen ni ancho máximo. */}
        <ModuleBody flush className="flex min-h-0 flex-col overflow-hidden">
          <CalendarMonthGrid
            currentMonthIndex={currentMonthIndex}
            currentYear={currentYear}
            selectedDay={selectedDay}
            onDayClick={handleDayClick}
            eventsForDay={eventsForDay}
          />
        </ModuleBody>
      </ModulePane>
    </ModuleShell>
  );
};
