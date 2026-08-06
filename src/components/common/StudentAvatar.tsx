import React from 'react';
import { UserRound } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Icono de perfil por defecto para estudiantes: silueta gris, igual para
 * todos. Antes cada alumno tenía una caricatura generada por un servicio
 * externo (avataaars.io) — decenas de peticiones HTTP por aula solo para
 * pintar caras que nadie pidió.
 *
 * Si el centro subió una foto real (`photoUrl`), se muestra esa en su lugar;
 * el marco gris solo aplica al icono por defecto, para no dibujar un borde
 * raro alrededor de una fotografía.
 */
export const StudentAvatar: React.FC<{
  className?: string;
  iconClassName?: string;
  /** Foto subida por el centro (data URL). Ausente = icono gris por defecto. */
  photoUrl?: string;
  /** Nombre de la persona, para el `alt` de la foto. Sin nombre, la foto queda decorativa. */
  name?: string;
}> = ({ className, iconClassName, photoUrl, name }) => (
  <div
    className={cn(
      'flex shrink-0 items-center justify-center overflow-hidden rounded-xl',
      photoUrl
        ? 'bg-slate-100 dark:bg-slate-700'
        : 'border border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400',
      className,
    )}
  >
    {photoUrl ? (
      <img src={photoUrl} className="h-full w-full object-cover" alt={name ? `Foto de ${name}` : ''} />
    ) : (
      <UserRound className={cn('h-[55%] w-[55%]', iconClassName)} strokeWidth={2} />
    )}
  </div>
);
