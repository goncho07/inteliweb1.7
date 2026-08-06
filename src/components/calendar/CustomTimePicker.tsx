import React, { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CustomTimePickerProps {
  /** 'HH:MM' en 24h, igual que un `<input type="time">`. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  align?: 'left' | 'right';
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = ['00', '15', '30', '45'];

const to24h = (hour12: number, minute: string, meridiem: 'AM' | 'PM'): string => {
  const hour24 = meridiem === 'AM' ? (hour12 === 12 ? 0 : hour12) : hour12 === 12 ? 12 : hour12 + 12;
  return `${hour24.toString().padStart(2, '0')}:${minute}`;
};

const from24h = (value: string): { hour12: number; minute: string; meridiem: 'AM' | 'PM' } | null => {
  if (!value) return null;
  const [hourStr, minuteStr] = value.split(':');
  const hour24 = Number(hourStr);
  const meridiem: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  // El minuto puede no calzar con los pasos de 15' (ej. citaciones antiguas): se conserva tal cual.
  return { hour12, minute: minuteStr ?? '00', meridiem };
};

const formatDisplay = (value: string): string | null => {
  const parsed = from24h(value);
  if (!parsed) return null;
  return `${parsed.hour12.toString().padStart(2, '0')}:${parsed.minute} ${parsed.meridiem}`;
};

/**
 * Selector de hora con la misma anatomía visual que `CustomCalendar`: un
 * botón disparador y un panel propio con tres `Select` de shadcn (hora,
 * minuto, AM/PM). Sustituye a `<input type="time">`, cuyo desplegable es el
 * del sistema operativo y no lleva ningún estilo de la app.
 */
export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  placeholder,
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const parsed = from24h(value) ?? { hour12: 9, minute: '00', meridiem: 'AM' as const };

  const update = (next: Partial<typeof parsed>) => {
    const merged = { ...parsed, ...next };
    onChange(to24h(merged.hour12, merged.minute, merged.meridiem));
  };

  const displayValue = formatDisplay(value) ?? placeholder ?? 'Seleccionar hora';

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen((open) => !open)}
        className="h-[52px] w-full min-w-[200px] justify-between gap-3 overflow-hidden rounded-xl border-2 border-slate-100 bg-white px-5 text-base font-bold text-slate-700 shadow-sm outline-none transition-all hover:border-primary/50 hover:bg-primary/5 focus:border-primary focus:ring-4 focus:ring-primary/10 sm:w-auto dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-primary/10"
      >
        <span className="truncate">{displayValue}</span>
        <Clock size={18} className="shrink-0 text-slate-400 dark:text-slate-500" />
      </Button>

      {isOpen && (
        <div
          className={`absolute top-[calc(100%+8px)] ${align === 'right' ? 'right-0' : 'left-0'} z-50 flex w-[280px] max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-top-1 items-center gap-2 rounded-xl border-2 border-slate-100 bg-white p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:border-slate-800 dark:bg-slate-900`}
        >
          <Select value={String(parsed.hour12)} onValueChange={(v) => update({ hour12: Number(v) })}>
            <SelectTrigger
              aria-label="Hora"
              className="h-11 flex-1 rounded-lg border border-slate-200 text-base font-bold text-slate-800 dark:border-slate-700 dark:text-slate-100"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOURS_12.map((h) => (
                <SelectItem key={h} value={String(h)}>
                  {h.toString().padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-lg font-black text-slate-400 dark:text-slate-500">:</span>

          <Select value={parsed.minute} onValueChange={(v) => update({ minute: v })}>
            <SelectTrigger
              aria-label="Minuto"
              className="h-11 flex-1 rounded-lg border border-slate-200 text-base font-bold text-slate-800 dark:border-slate-700 dark:text-slate-100"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MINUTES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={parsed.meridiem}
            onValueChange={(v) => update({ meridiem: v as 'AM' | 'PM' })}
          >
            <SelectTrigger
              aria-label="AM o PM"
              className="h-11 w-[72px] shrink-0 rounded-lg border border-slate-200 text-base font-bold text-slate-800 dark:border-slate-700 dark:text-slate-100"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
