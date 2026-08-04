import React from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  /** Acción opcional a la derecha del título (ej. un selector Bimestre/Semana). */
  action?: React.ReactNode;
  /** Clases del cuerpo de la tarjeta (por defecto se ajusta al contenido). */
  bodyClassName?: string;
  /** Clases de la tarjeta raíz (ej. `h-full` para ocupar su celda en la rejilla). */
  className?: string;
}

/**
 * Tarjeta contenedora de un gráfico o resumen de datos: mismo radio, borde,
 * padding y cabecera icono+título en cualquier pantalla que la use (Inicio,
 * Vista General del Aula, Reportes). Siempre ocupa el alto que le da su
 * celda en la rejilla del panel — nunca define uno propio.
 */
export const ChartCard: React.FC<ChartCardProps> = ({ title, children, action, bodyClassName, className }) => (
  <Card
    className={cn(
      'flex flex-col rounded-2xl border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900',
      className,
    )}
  >
    <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
      <h3 className="text-base font-semibold text-slate-800 dark:text-white">{title}</h3>
      {action}
    </div>
    <div className={cn('w-full min-h-0 flex-1 overflow-hidden', bodyClassName)}>{children}</div>
  </Card>
);

interface ChartMetricHeadlineProps {
  /** Cifra destacada (número o texto ya formateado, ej. `23`, `"91%"`). */
  value: React.ReactNode;
  /** Qué mide la cifra, ej. "casos este bimestre". */
  label: string;
  /** Elemento opcional a la derecha (ej. badge de comparación vs. periodo anterior). */
  trailing?: React.ReactNode;
}

/** Único token de "cifra principal de tarjeta" — mismo tamaño/peso en cualquier pantalla que lo use. */
export const ChartMetricHeadline: React.FC<ChartMetricHeadlineProps> = ({ value, label, trailing }) => (
  <div className="flex shrink-0 flex-wrap items-start justify-between gap-x-3 gap-y-1">
    <p className="whitespace-nowrap text-sm font-bold text-slate-500 dark:text-slate-400">
      <span className="text-2xl font-black text-slate-800 dark:text-white">{value}</span> {label}
    </p>
    {trailing}
  </div>
);
