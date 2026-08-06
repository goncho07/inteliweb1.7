import React from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Indicador de los tres pasos del acceso del apoderado.
 *
 * Sustituye a la barra de progreso: una barra dice «vas por la mitad», pero no
 * dice de qué mitad ni qué viene después. Aquí los tres pasos están siempre a
 * la vista con su nombre, el hecho lleva un check, el actual va en azul y el
 * que falta queda en gris — el apoderado sabe en todo momento dónde está y
 * cuánto le queda sin tener que interpretar una barra.
 */
export const GuardianSteps: React.FC<{
  /** Nombre corto de cada paso, en orden. */
  steps: string[];
  /** Índice del paso actual (base 0). */
  current: number;
}> = ({ steps, current }) => (
  <ol
    aria-label={`Paso ${current + 1} de ${steps.length}`}
    className="flex items-start justify-between gap-2"
  >
    {steps.map((label, index) => {
      const done = index < current;
      const active = index === current;

      return (
        <li key={label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full items-center gap-2">
            {/* Tramo de línea a cada lado del círculo: unidos forman el hilo
                que atraviesa los tres pasos, y el primero y el último quedan
                invisibles para que la línea no sobresalga por los extremos. */}
            <span
              aria-hidden
              className={cn(
                'h-0.5 flex-1 rounded-full',
                index === 0 ? 'bg-transparent' : done || active ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800',
              )}
            />
            <span
              aria-hidden
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-base font-bold',
                done && 'border-primary bg-primary text-primary-foreground',
                active && 'border-primary bg-primary/10 text-primary',
                !done && !active && 'border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500',
              )}
            >
              {done ? <Check size={20} strokeWidth={2.5} /> : index + 1}
            </span>
            <span
              aria-hidden
              className={cn(
                'h-0.5 flex-1 rounded-full',
                index === steps.length - 1
                  ? 'bg-transparent'
                  : done
                    ? 'bg-primary'
                    : 'bg-slate-200 dark:bg-slate-800',
              )}
            />
          </div>

          <span
            className={cn(
              'text-center text-sm font-semibold leading-tight',
              active
                ? 'text-primary'
                : done
                  ? 'text-slate-700 dark:text-slate-300'
                  : 'text-slate-400 dark:text-slate-500',
            )}
          >
            {label}
          </span>
        </li>
      );
    })}
  </ol>
);
