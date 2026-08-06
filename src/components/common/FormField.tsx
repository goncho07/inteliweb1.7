import React from 'react';
import { AlertCircle } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Campo de formulario estándar: etiqueta + control + error o pista debajo.
 * Un solo sitio para esta anatomía — la usan tanto formularios de modal
 * (`UserFormDialog`) como de página completa (`ProfileModule`), en vez de
 * que cada uno reimplemente su propia etiqueta y su propio mensaje de error.
 */
export const Field: React.FC<{
  id: string;
  label: string;
  error?: string;
  hint?: string;
  /** Marca el campo como obligatorio: asterisco visible y aviso al lector de pantalla. */
  required?: boolean;
  className?: string;
  /** Reemplaza la talla por defecto de la etiqueta (`text-sm font-semibold`) — p. ej. el login, una talla por encima del resto de formularios. */
  labelClassName?: string;
  children: React.ReactNode;
}> = ({ id, label, error, hint, required = false, className, labelClassName, children }) => (
  <div className={cn('flex flex-col gap-2', className)}>
    <Label
      htmlFor={id}
      className={cn('text-sm font-semibold text-slate-700 dark:text-slate-300', labelClassName)}
    >
      {label}
      {required && (
        <>
          {' '}
          <span aria-hidden className="font-bold text-destructive">
            *
          </span>
          <span className="sr-only">(obligatorio)</span>
        </>
      )}
    </Label>
    {children}
    {error ? (
      <p id={`${id}-error`} role="alert" className="flex items-center gap-2 text-sm font-medium text-destructive">
        <AlertCircle size={16} /> {error}
      </p>
    ) : (
      hint && <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
    )}
  </div>
);

/**
 * Rejilla de campos de un formulario: una columna por defecto, dos desde `sm`.
 * El título de la sección no vive aquí — dentro de una ventana lo pone
 * `DialogShellSection`, que es el mismo bloque que usa la ficha en modo
 * lectura, para que no haya dos maneras de titular lo mismo.
 */
export const FieldGrid: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', className)}>{children}</div>;
