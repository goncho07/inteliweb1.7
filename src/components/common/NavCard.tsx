import React from 'react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavCardProps {
  title: string;
  /** 1-2 líneas cortas de dato bajo el título (ej. "34 Secciones"). */
  statLines?: string[];
  icon?: LucideIcon;
  /** Imagen alternativa al icono (ej. emoji ilustrado ya usado en Aulas). */
  imageSrc?: string;
  /** Contenido a medida para la caja izquierda (ej. número de bimestre o check), en vez de icon/imageSrc. */
  leading?: React.ReactNode;
  /** Clases para el fondo/color de la caja izquierda cuando se usa `leading`. */
  leadingClassName?: string;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  /** Etiqueta corta en la esquina (ej. "Próximamente", "Actual"). */
  badge?: string;
  /** Color del badge cuando no es el neutro por defecto (ej. verde para "Actual"). */
  badgeClassName?: string;
  selected?: boolean;
  className?: string;
}

/**
 * Tarjeta de navegación grande usada en toda barra lateral de módulo:
 * selector de niveles/grados/secciones de Aulas, bimestres y accesos
 * rápidos de Inicio, aulas de Asistencia Virtual. Única implementación —
 * no se duplica este marcado en cada módulo.
 */
export const NavCard: React.FC<NavCardProps> = ({
  title,
  statLines,
  icon: Icon,
  imageSrc,
  leading,
  leadingClassName,
  onClick,
  onContextMenu,
  disabled,
  badge,
  badgeClassName,
  selected,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={onContextMenu}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'group relative flex w-full flex-row items-center gap-4 rounded-2xl border p-4 text-left shadow-sm transition-all',
        disabled
          ? 'cursor-not-allowed border-slate-200 bg-slate-100 opacity-70 dark:border-slate-700/50 dark:bg-slate-800/40'
          : selected
            ? 'border-primary bg-primary/10 ring-1 ring-primary/20 hover:bg-primary/10'
            : 'border-slate-100 bg-white hover:border-primary/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40',
        className,
      )}
    >
      {badge && (
        <Badge
          variant="outline"
          className={cn(
            'absolute right-3 top-3 border-transparent bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
            badgeClassName,
          )}
        >
          {badge}
        </Badge>
      )}
      <div
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50 transition-colors dark:bg-slate-900/50',
          disabled && 'grayscale',
          leadingClassName,
        )}
      >
        {leading ??
          (Icon ? (
            <Icon size={24} strokeWidth={2} className="text-slate-500 dark:text-slate-400" />
          ) : imageSrc ? (
            <img src={imageSrc} alt="" className="h-8 w-8 object-contain drop-shadow-sm" />
          ) : null)}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-base font-bold text-slate-800 dark:text-slate-200">{title}</h4>
        {statLines && statLines.length > 0 && (
          <div className="flex flex-col text-sm text-slate-500 dark:text-slate-400">
            {statLines.map((line) => (
              <span key={line} className="truncate">
                {line}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
};
