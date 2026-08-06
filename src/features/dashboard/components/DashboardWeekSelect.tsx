import React from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { DashboardWeek } from '../dashboard.weeks';

/**
 * Selector de semana de la cabecera de una tarjeta del panel Inicio. Es un
 * desplegable y no un grupo de botones porque un mes trae 4-6 tramos: en fila
 * no caben junto al título sin bajar del objetivo de clic de 40px.
 *
 * Cada opción muestra el tramo tal como se numera en los reportes de Aulas
 * ("Semana 2") y, debajo, sus fechas — "Semana 2" a secas no dice de qué días
 * habla.
 */
export const DashboardWeekSelect: React.FC<{
  weeks: DashboardWeek[];
  value: string;
  onChange: (weekId: string) => void;
  /** Qué tarjeta filtra, para el lector de pantalla ("Semana de asistencia"). */
  ariaLabel: string;
}> = ({ weeks, value, onChange, ariaLabel }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger aria-label={ariaLabel} className="h-10 w-[150px] shrink-0 rounded-xl text-sm font-semibold shadow-sm">
      <SelectValue />
    </SelectTrigger>
    <SelectContent className="rounded-xl">
      {weeks.map((week) => (
        <SelectItem key={week.id} value={week.id} className="h-12 text-sm">
          <span className="font-semibold">{week.label}</span>
          {week.label !== week.rangeLabel && (
            <span className="ml-2 text-slate-500 dark:text-slate-400">{week.rangeLabel}</span>
          )}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
