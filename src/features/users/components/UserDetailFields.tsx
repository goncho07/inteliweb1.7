import React from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';

import { StudentAvatar } from '@/components/common/StudentAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UserItem } from '@/types';

/** Piezas compartidas por las pestañas de la ficha de usuario. */

/** Par etiqueta/valor con icono. Un valor ausente se dice, no se inventa. */
export const DataField: React.FC<{
  label: string;
  value?: string | null;
  hint?: string;
  icon: LucideIcon;
}> = ({ label, value, hint, icon: Icon }) => (
  <div className="flex items-start gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
      <Icon size={20} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={cn(
          'break-words text-base font-semibold',
          value ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500',
        )}
      >
        {value || 'Sin registrar'}
        {value && hint && <span className="ml-2 text-sm font-medium text-slate-500">{hint}</span>}
      </p>
    </div>
  </div>
);

/**
 * Fila de una persona vinculada (un apoderado en la ficha del alumno, un hijo
 * en la del apoderado). Abre su propia ficha en vez de duplicar aquí sus
 * datos: la persona vive en un solo sitio.
 */
export const RelatedPersonRow: React.FC<{
  person: UserItem;
  /** Etiqueta del vínculo: «Madre», «Apoderado principal», «Hijo»… */
  relation: string;
  highlight?: boolean;
  onOpen: (person: UserItem) => void;
}> = ({ person, relation, highlight, onOpen }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex min-w-0 items-center gap-3">
      <StudentAvatar className="h-11 w-11" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-base font-bold text-slate-900 dark:text-white">
            {person.name}
          </p>
          <Badge
            variant="outline"
            className={cn(
              'px-2.5 py-0.5 text-sm',
              highlight
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
            )}
          >
            {relation}
          </Badge>
        </div>
        <p className="truncate text-sm text-slate-500 dark:text-slate-400">
          DNI {person.dni}
          {person.phone && ` · +51 ${person.phone}`}
        </p>
      </div>
    </div>
    <Button
      type="button"
      variant="outline"
      onClick={() => onOpen(person)}
      className="h-10 shrink-0 gap-2 rounded-xl px-4 text-base font-semibold"
    >
      Ver ficha <ChevronRight size={20} />
    </Button>
  </div>
);
