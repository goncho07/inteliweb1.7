import React from 'react';

import { getInitials } from '@/features/profile/profile.utils';
import { cn } from '@/lib/utils';

/**
 * Avatar de la persona que inició sesión: su foto si la ha subido, y si no las
 * iniciales sobre el color primario. Único sitio donde se decide ese
 * comportamiento — lo usan el riel de navegación, la ficha de identidad del
 * sidebar y el bloque de foto, con el mismo resultado y distinto tamaño.
 *
 * Siempre redondo (`rounded-full`), como el resto de avatares del sistema: el
 * tamaño se pasa por `className`, la forma no se negocia.
 *
 * No tiene nada que ver con `StudentAvatar` (el icono gris, igual para todos
 * los alumnos): aquí sí hay una persona concreta detrás.
 */
export const ProfileAvatar: React.FC<{
  name: string;
  photo: string | null;
  /** Tamaño del recuadro (ej. `h-11 w-11`). La forma la fija el componente. */
  className?: string;
  /** Tamaño del texto de las iniciales, acorde al recuadro. */
  textClassName?: string;
}> = ({ name, photo, className, textClassName }) => (
  <div className={cn('shrink-0 overflow-hidden rounded-full bg-primary', className)}>
    {photo ? (
      <img src={photo} alt={`Foto de ${name}`} className="h-full w-full object-cover" />
    ) : (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center font-bold text-primary-foreground',
          textClassName,
        )}
      >
        {getInitials(name)}
      </div>
    )}
  </div>
);
