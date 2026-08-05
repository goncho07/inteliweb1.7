import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CustomCalendarProps {
  mode: 'date' | 'week';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  align?: 'left' | 'right';
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];

export const getWeekNumber = (d: Date) => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

export const getWeekString = (date: Date) => {
  const week = getWeekNumber(date);
  const year = date.getFullYear();
  return `${year}-W${week.toString().padStart(2, '0')}`;
};

export const getDateFromWeekString = (weekStr: string) => {
  if (!weekStr) return new Date();
  const [yearStr, weekPart] = weekStr.split('-W');
  if (!yearStr || !weekPart) return new Date();
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekPart, 10);
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
};

export const CustomCalendar: React.FC<CustomCalendarProps> = ({ mode, value, onChange, placeholder, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value 
    ? (mode === 'date' ? new Date(value + 'T12:00:00') : getDateFromWeekString(value)) 
    : new Date();

  const [currentDate, setCurrentDate] = useState(initialDate);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayClick = (day: number) => {
    const selectedDate = new Date(year, month, day);
    if (mode === 'date') {
      const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      onChange(dateString);
    } else {
      onChange(getWeekString(selectedDate));
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    if (mode === 'date') {
      const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      onChange(dateString);
    } else {
      onChange(getWeekString(today));
    }
    setIsOpen(false);
  };

  // Generate calendar grid
  const grid = [];
  let dayCounter = 1;
  
  const numWeeks = Math.ceil((daysInMonth + firstDayOfMonth) / 7);

  for (let i = 0; i < numWeeks; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDayOfMonth) {
        week.push(null);
      } else if (dayCounter <= daysInMonth) {
        week.push(dayCounter);
        dayCounter++;
      } else {
        week.push(null);
      }
    }
    grid.push(week);
  }

  const isDaySelected = (day: number) => {
    if (!value) return false;
    if (mode === 'date') {
      const [y, m, d] = value.split('-');
      return parseInt(y) === year && parseInt(m) === month + 1 && parseInt(d) === day;
    }
    return false;
  };

  const isWeekSelected = (weekIndex: number, weekDays: (number | null)[]) => {
    if (!value || mode !== 'week') return false;
    const validDay = weekDays.find(d => d !== null);
    if (validDay) {
      const d = new Date(year, month, validDay);
      return getWeekString(d) === value;
    }
    return false;
  };

  const displayValue = value 
    ? (mode === 'date' 
        ? new Date(value + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
        : `Semana ${value.split('-W')[1]}, ${value.split('-W')[0]}`)
    : (placeholder || 'Seleccionar...');

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="h-[52px] w-full min-w-[200px] justify-between gap-3 overflow-hidden rounded-xl border-2 border-slate-100 bg-white px-5 text-base font-bold text-slate-700 shadow-sm outline-none transition-all hover:border-primary/50 hover:bg-primary/5 focus:border-primary focus:ring-4 focus:ring-primary/10 sm:w-auto dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-primary/10"
      >
        <span className="truncate">{displayValue}</span>
        <CalendarIcon size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
      </Button>

      {isOpen && (
        <div className={`absolute top-[calc(100%+8px)] ${align === 'right' ? 'right-0' : 'left-0'} z-50 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] p-4 w-[340px] max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-top-1`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Select
                value={String(month)}
                onValueChange={(v) => setCurrentDate(new Date(year, Number(v), 1))}
              >
                <SelectTrigger
                  aria-label="Mes"
                  className="h-10 w-auto gap-1 rounded-lg border-none bg-transparent px-2 text-base font-bold text-slate-800 shadow-none hover:bg-slate-50 focus:ring-0 focus:ring-offset-0 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(year)}
                onValueChange={(v) => setCurrentDate(new Date(Number(v), month, 1))}
              >
                <SelectTrigger
                  aria-label="Año"
                  className="h-10 w-auto gap-1 rounded-lg border-none bg-transparent px-2 text-base font-bold text-slate-800 shadow-none hover:bg-slate-50 focus:ring-0 focus:ring-offset-0 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }).map((_, i) => {
                    const y = new Date().getFullYear() - 5 + i;
                    return (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex shrink-0 gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={prevMonth}
                    aria-label="Mes anterior"
                    className="group h-10 w-10 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  >
                    <ChevronLeft size={18} />
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
                    onClick={nextMonth}
                    aria-label="Mes siguiente"
                    className="group h-10 w-10 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  >
                    <ChevronRight size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mes siguiente</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Days Header */}
          <div className="flex mb-3">
            {mode === 'week' && <div className="w-10 text-center text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">Sem</div>}
            <div className="flex-1 grid grid-cols-7 gap-1">
              {DAYS.map(day => (
                <div key={day} className="text-center text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex flex-col gap-1.5">
            {grid.map((week, weekIndex) => {
              const weekSelected = isWeekSelected(weekIndex, week);
              const validDay = week.find(d => d !== null);
              const weekNum = validDay ? getWeekNumber(new Date(year, month, validDay)) : '';

              return (
                <div key={weekIndex} className="flex items-center group relative origin-left">
                  {mode === 'week' && (
                    <div className={`w-10 text-center text-xs transition-all ${weekSelected ? 'text-primary font-extrabold scale-110' : 'text-slate-400 font-medium'}`}>
                      {weekNum}
                    </div>
                  )}
                  <div className={`flex-1 grid grid-cols-7 gap-1 p-1 rounded-xl transition-all ${mode === 'week' ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-[0.98]' : ''} ${weekSelected && mode === 'week' ? 'bg-blue-50/80 dark:bg-blue-900/20 ring-1 ring-blue-500/20 shadow-inner' : ''}`}
                       onClick={() => {
                         if (mode === 'week' && validDay) {
                           handleDayClick(validDay);
                         }
                       }}
                  >
                    {week.map((day, dayIndex) => {
                      if (day === null) return <div key={`empty-${dayIndex}`} className="aspect-square" />;
                      
                      const daySelected = mode === 'date' && isDaySelected(day);
                      const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                      return (
                        <Button
                          key={day}
                          type="button"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDayClick(day);
                          }}
                          aria-label={`Seleccionar ${day} de ${MONTHS[month]} de ${year}`}
                          className={`relative z-10 aspect-square h-auto w-full p-0 text-sm font-bold transition-all
                            ${daySelected ? 'scale-110 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/30 hover:bg-blue-600 hover:text-white' : ''}
                            ${!daySelected && weekSelected ? 'text-blue-700 hover:bg-transparent dark:text-blue-300' : ''}
                            ${!daySelected && !weekSelected && isToday ? 'rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/30' : ''}
                            ${!daySelected && !weekSelected && !isToday ? 'rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800' : ''}
                          `}
                        >
                          {day}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClear}
              className="h-auto rounded-lg px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              Limpiar
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleToday}
              className="h-auto rounded-lg px-3 py-1.5 text-sm font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
            >
              {mode === 'date' ? 'Hoy' : 'Esta semana'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
