import React from 'react';

import { cn } from '@/lib/utils';

/**
 * Contador de mensajes sin leer de una citación, en la fila de la lista.
 * Círculo sólido con número blanco, igual a como WhatsApp marca los chats
 * no leídos. No se muestra si no hay mensajes sin leer.
 */
export const CitationUnreadBadge: React.FC<{ count: number; className?: string }> = ({ count, className }) => {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-xs font-bold leading-none text-white',
        className,
      )}
      aria-label={`${count} mensaje${count === 1 ? '' : 's'} sin leer`}
    >
      {count}
    </span>
  );
};
