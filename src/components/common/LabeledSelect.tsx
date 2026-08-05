import React from 'react';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * Campo de selección único de la app: etiqueta arriba, desplegable debajo y,
 * cuando el campo depende de otro, la frase que dice qué falta elegir primero.
 *
 * Lo usan por igual los filtros (Usuarios, Citaciones) y los formularios
 * (carnets, alta de usuario), porque el problema es el mismo: antes cada
 * pantalla resolvía a su manera la cascada nivel → grado → sección, y en unas
 * el desplegable se bloqueaba con una explicación y en otras se quedaba activo
 * ofreciendo combinaciones imposibles.
 *
 * La etiqueta nunca hace de valor: el control muestra lo elegido, o el texto de
 * «sin filtrar» cuando no hay nada elegido. Así se ve de un vistazo si el
 * filtro está puesto.
 */
export const LabeledSelect: React.FC<{
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Valor y texto del ítem que representa «sin filtrar». Omitido en formularios donde elegir es obligatorio. */
  allValue?: string;
  allLabel?: string;
  /** Texto cuando no hay valor elegido. */
  placeholder?: string;
  /** Qué falta elegir antes para que este campo tenga sentido. Se muestra al estar bloqueado. */
  hint?: string;
  className?: string;
}> = ({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
  allValue,
  allLabel,
  placeholder,
  hint,
  className,
}) => (
  <div className={cn('flex min-w-0 flex-col gap-2', className)}>
    <Label htmlFor={id} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
      {label}
    </Label>
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        className="h-11 rounded-xl text-base shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        <SelectValue placeholder={placeholder ?? allLabel} />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {allValue !== undefined && (
          <SelectItem value={allValue} className="h-10 text-base">
            {allLabel}
          </SelectItem>
        )}
        {options.map((option) => (
          <SelectItem key={option} value={option} className="h-10 text-base">
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {disabled && hint && <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
  </div>
);
