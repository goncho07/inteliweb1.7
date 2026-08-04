import React from 'react';
import { UserRound } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Icono de perfil por defecto para estudiantes: silueta gris, igual para
 * todos. Antes cada alumno tenía una caricatura generada por un servicio
 * externo (avataaars.io) — decenas de peticiones HTTP por aula solo para
 * pintar caras que nadie pidió.
 */
export const StudentAvatar: React.FC<{ className?: string; iconClassName?: string }> = ({
  className,
  iconClassName,
}) => (
  <div
    className={cn(
      'flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400',
      className,
    )}
  >
    <UserRound className={cn('h-[55%] w-[55%]', iconClassName)} strokeWidth={2} />
  </div>
);
