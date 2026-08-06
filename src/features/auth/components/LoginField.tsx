import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/common/FormField';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * Campo de la pantalla de acceso: la anatomía estándar de `Field` (etiqueta
 * arriba, error o pista debajo) con un icono dentro del control.
 *
 * Etiqueta de 20px y control cómodo (altura por `py-3`, no un `h-` fijo): el
 * recuadro crece con su propio texto de 20px. La etiqueta
 * usa `labelClassName` de `Field` en vez de un selector de hijos: dos clases
 * de tamaño con la misma especificidad (`text-sm` del componente y `text-xl`
 * de aquí) no tienen un ganador fiable si se aplican por selector, así que
 * `Field` expone el reemplazo directo.
 */
export const LoginField: React.FC<{
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  /** Teclado numérico: en el portátil no cambia nada, en tableta sí. */
  inputMode?: React.ComponentProps<'input'>['inputMode'];
  autoComplete?: string;
  maxLength?: number;
  placeholder?: string;
  error?: string;
  hint?: string;
  autoFocus?: boolean;
  /** Muestra un botón para alternar entre clave oculta y visible. */
  toggleablePassword?: boolean;
  /** Clases del `input` (p. ej. el centrado con espaciado del código). */
  inputClassName?: string;
}> = ({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  type = 'text',
  inputMode,
  autoComplete,
  maxLength,
  placeholder,
  error,
  hint,
  autoFocus,
  toggleablePassword,
  inputClassName,
}) => {
  const [revealed, setRevealed] = useState(false);
  const resolvedType = toggleablePassword ? (revealed ? 'text' : 'password') : type;

  return (
    <Field
      id={id}
      label={label}
      error={error}
      hint={hint}
      required
      labelClassName="text-xl font-medium text-slate-900 dark:text-white"
    >
      <div className="relative">
        <Icon
          size={20}
          strokeWidth={2}
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <Input
          id={id}
          type={resolvedType}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            // `md:text-xl` no es redundante: el `Input` de shadcn trae un
            // `md:text-sm` propio que, por ser variante responsive, gana al
            // `text-xl` de base en cuanto la ventana pasa de 768px.
            'h-auto rounded-md py-3 pl-11 text-xl md:text-xl',
            toggleablePassword && 'pr-12',
            error && 'border-rose-400 dark:border-rose-500',
            inputClassName,
          )}
        />
        {toggleablePassword && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setRevealed((prev) => !prev)}
                // El `ghost` de shadcn pinta el fondo con `accent`, que aquí es
                // el azul institucional: dentro del campo se veía como un
                // cuadrado azul sólido. Se le da un realce propio, discreto.
                className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-md text-slate-400 transition-none hover:bg-slate-100 hover:text-slate-600 focus-visible:ring-offset-0 active:scale-100 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                {revealed ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </Field>
  );
};
