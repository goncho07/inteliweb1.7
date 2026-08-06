import React from 'react';

import { formatRelativeTimestamp } from '@/lib/formatRelativeDate';
import { cn } from '@/lib/utils';

import { CitationAvatar } from './CitationAvatar';
import { CitationCategoryBadge } from './CitationCategoryBadge';
import { CitationStatusBadge } from './CitationStatusBadge';
import { CitationUnreadBadge } from './CitationUnreadBadge';
import { isParentOnline, parseCitationDateTime } from '../citations.constants';
import type { Citation } from '../types';

/** Fila de la lista de citaciones (columna izquierda). Selecciona la citación al hacer clic. */
export const CitationListItem: React.FC<{
  citation: Citation;
  isSelected: boolean;
  unreadCount?: number;
  onSelect: () => void;
}> = ({ citation: c, isSelected, unreadCount = 0, onSelect }) => {
  const online = isParentOnline(c);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isSelected}
      className={cn(
        'w-full px-3 py-3 flex gap-3 text-left transition-colors border-b border-l-4 border-slate-100 dark:border-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        isSelected
          ? 'border-l-primary bg-primary/10'
          : 'border-l-transparent bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60',
      )}
    >
      <CitationAvatar online={online} className="self-start" />

      <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
        <div className="min-w-0">
          {/* Alumno + su aula: la citación es del alumno, por eso encabeza la fila */}
          <h4 className="flex items-baseline gap-1.5 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            <span className="truncate">{c.student}</span>
            <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">{c.grade}</span>
          </h4>

          {/* Apoderado con quien se coordina y su vínculo con el alumno */}
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
            {c.parent} · {c.relationship}
          </p>

          <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-1.5 mt-1">{c.reason}</p>

          <div className="flex flex-wrap items-center gap-1.5">
            <CitationStatusBadge status={c.status} className="text-xs px-2 py-0" />
            <CitationCategoryBadge category={c.category} className="text-xs px-2 py-0" />
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatRelativeTimestamp(parseCitationDateTime(c))}
          </span>
          {/*
            El estado de lectura (entregado / leído) no se muestra aquí: en una
            fila de lista es un icono de 16px sin etiqueta cuyo significado hay
            que adivinar. Vive donde tiene contexto, en la burbuja del mensaje
            de la conversación (`CitationConversationTab`). Lo que sí queda es
            el contador de mensajes sin leer, que sí es información de la fila.
          */}
          <CitationUnreadBadge count={unreadCount} />
        </div>
      </div>
    </button>
  );
};
