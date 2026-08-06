import React, { useMemo, useState } from 'react';
import { HeartHandshake, Search, UserPlus } from 'lucide-react';

import { EmptyState } from '@/components/common/EmptyState';
import { StudentAvatar } from '@/components/common/StudentAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { UserItem } from '@/types';

/**
 * Selector de apoderado para un alumno: solo elige entre los Apoderados ya
 * registrados en el padrón (dar de alta uno nuevo se hace desde la lista de
 * Apoderados, no aquí, para no duplicar el alta de personas).
 *
 * Vive como bloque de contenido normal dentro de la sección «Apoderados
 * registrados» de la ficha del alumno — no abre una ventana propia encima.
 */
export const LinkGuardianPanel: React.FC<{
  student: UserItem | null;
  /** Apoderados del padrón que todavía no están vinculados a este alumno. */
  candidates: UserItem[];
  onCancel: () => void;
  onLink: (guardianId: string) => void;
}> = ({ student, candidates, onCancel, onLink }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return candidates;
    return candidates.filter(
      (person) => person.name.toLowerCase().includes(term) || person.dni.includes(term),
    );
  }, [candidates, search]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base text-slate-600 dark:text-slate-300">
        Elige a la persona ya registrada como Apoderado que se hará cargo de{' '}
        <span className="font-semibold text-slate-900 dark:text-white">{student?.name}</span>.
      </p>

      <div className="relative shrink-0">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
          aria-hidden
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre o DNI…"
          aria-label="Buscar apoderado"
          className="h-11 rounded-xl pl-12 text-base"
        />
      </div>

      <div className="hidden-scrollbar max-h-[320px] overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={HeartHandshake}
            title={candidates.length === 0 ? 'No hay apoderados disponibles' : 'Sin resultados'}
            description={
              candidates.length === 0
                ? 'Todos los apoderados registrados ya están vinculados a este alumno, o todavía no hay ninguno de alta.'
                : 'Ningún apoderado coincide con la búsqueda.'
            }
            className="min-h-[200px]"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((guardian) => (
              <button
                key={guardian.id}
                type="button"
                onClick={() => onLink(guardian.id)}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors',
                  'hover:border-primary/40 hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-primary/10',
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <StudentAvatar className="h-11 w-11 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-slate-900 dark:text-white">
                      {guardian.name}
                    </p>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                      DNI {guardian.dni}
                      {guardian.phone && ` · +51 ${guardian.phone}`}
                    </p>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-base font-semibold text-primary-foreground">
                  <UserPlus size={18} /> Vincular
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="h-10 w-fit gap-2 self-start rounded-xl px-4 text-base font-semibold"
      >
        Cancelar
      </Button>
    </div>
  );
};
