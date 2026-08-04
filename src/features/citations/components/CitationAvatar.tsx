import React from 'react';
import { User } from 'lucide-react';

import { APP_CONFIG } from '@/config/app';
import { cn } from '@/lib/utils';

/**
 * Avatar del módulo Citaciones: **un solo tamaño (44px) y un solo estilo** en
 * las tres zonas donde aparece — la fila de la lista, la cabecera del panel de
 * detalle y las burbujas de la conversación. Antes cada zona tenía el suyo
 * (48px, 44px y 40px, con fondos y bordes distintos), lo que hacía que el mismo
 * apoderado se viera de tres formas en una sola pantalla.
 *
 * `variant`:
 * - `apoderado` — silueta sobre azul institucional, para el apoderado/alumno.
 * - `institucion` — el logo del colegio, para los mensajes enviados por el docente.
 *
 * `online` pinta el punto de estado de WhatsApp sobre el borde inferior derecho
 * (verde = en línea, gris = desconectado). Se omite cuando no hay estado que
 * mostrar, como en las burbujas de la conversación.
 */
export const CitationAvatar: React.FC<{
  variant?: 'apoderado' | 'institucion';
  online?: boolean;
  className?: string;
}> = ({ variant = 'apoderado', online, className }) => (
  <div className={cn('relative shrink-0', className)}>
    {variant === 'institucion' ? (
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-800">
        <img src={APP_CONFIG.sidebarLogo} alt="I.E." className="h-full w-full object-contain" />
      </div>
    ) : (
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
        aria-hidden="true"
      >
        <User size={20} strokeWidth={2} />
      </div>
    )}

    {online !== undefined && (
      <span
        className={cn(
          'absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900',
          online ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-500',
        )}
        role="img"
        aria-label={online ? 'Apoderado en línea en WhatsApp' : 'Apoderado desconectado de WhatsApp'}
      />
    )}
  </div>
);
