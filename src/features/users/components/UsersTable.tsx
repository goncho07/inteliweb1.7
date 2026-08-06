import React from 'react';
import { ChevronLeft, ChevronRight, SearchX, UserPlus, Users } from 'lucide-react';

import { StudentAvatar } from '@/components/common/StudentAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserRowActions } from '@/features/users/components/UserRowActions';
import type { UsersFilters } from '@/features/users/hooks/useUsersFilters';
import { PAGE_SIZE_OPTIONS, ROLE_META, STATUS_STYLES } from '@/features/users/users.constants';
import { cn } from '@/lib/utils';
import type { UserItem } from '@/types';

/**
 * Tabla de usuarios. Es ella la que se desplaza —no la página— con la
 * cabecera de columnas fija arriba y la paginación anclada abajo, para que
 * ninguna de las dos se pierda al recorrer la lista.
 *
 * La fila entera abre la ficha: es el objetivo de clic más grande posible y
 * no obliga a apuntar al nombre. Al ser pulsable lleva `tabIndex`, responde a
 * Enter/Espacio y se remarca al pasar por encima, al enfocarla con el teclado
 * y mientras su ficha está abierta.
 */

/** Etiqueta y contenido de la columna que cambia según el rol listado. */
const roleColumn = (user: UserItem): { primary: string; secondary?: string } => {
  switch (user.role) {
    case 'Estudiante':
      return {
        primary: user.level ?? 'Sin aula',
        secondary: user.grade ? `${user.grade} · Sección ${user.section ?? '—'}` : undefined,
      };
    case 'Docente': {
      const total = user.classrooms?.length ?? 0;
      return {
        primary: user.subject ?? 'Sin curso asignado',
        secondary:
          total === 0
            ? 'Sin aulas asignadas'
            : `${total} ${total === 1 ? 'aula' : 'aulas'} a cargo`,
      };
    }
    case 'Apoderado': {
      const total = user.childrenIds?.length ?? 0;
      return {
        primary:
          total === 0 ? 'Sin hijos vinculados' : `${total} ${total === 1 ? 'hijo' : 'hijos'}`,
        secondary: user.phone ? `+51 ${user.phone}` : undefined,
      };
    }
    case 'Administrativo':
      return {
        primary: user.position ?? 'Sin cargo',
        secondary: user.phone ? `+51 ${user.phone}` : undefined,
      };
  }
};

const ROLE_COLUMN_LABEL: Record<UserItem['role'], string> = {
  Estudiante: 'Aula',
  Docente: 'Curso y aulas',
  Apoderado: 'Familia',
  Administrativo: 'Cargo',
};

const EmptyState: React.FC<{
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreate: () => void;
  role: UserItem['role'];
}> = ({ hasFilters, onClearFilters, onCreate, role }) => (
  <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
      {hasFilters ? <SearchX size={28} /> : <Users size={28} />}
    </div>
    <p className="text-base font-bold text-slate-700 dark:text-slate-200">
      {hasFilters
        ? 'Ningún usuario coincide con los filtros'
        : `Todavía no hay ${ROLE_META[role].plural.toLowerCase()} registrados`}
    </p>
    <p className="max-w-md text-base text-slate-500 dark:text-slate-400">
      {hasFilters
        ? 'Prueba a quitar algún filtro de la barra lateral o a buscar por otro nombre o DNI.'
        : 'Registra el primero a mano o sube el padrón completo desde un archivo CSV.'}
    </p>
    {hasFilters ? (
      <Button
        type="button"
        variant="outline"
        onClick={onClearFilters}
        className="mt-2 h-11 rounded-xl px-6 text-base font-semibold"
      >
        Limpiar filtros
      </Button>
    ) : (
      <Button
        type="button"
        onClick={onCreate}
        className="mt-2 h-11 gap-2 rounded-xl px-6 text-base font-semibold"
      >
        <UserPlus size={20} /> Crear usuario
      </Button>
    )}
  </div>
);

export const UsersTable: React.FC<{
  filters: UsersFilters;
  /** Usuario cuya ficha está abierta: su fila se queda remarcada. */
  activeUserId: string | null;
  onView: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
  onDownloadCarnet: (user: UserItem) => void;
  onViewSchedule: (user: UserItem) => void;
  onCreate: () => void;
}> = ({
  filters,
  activeUserId,
  onView,
  onDelete,
  onDownloadCarnet,
  onViewSchedule,
  onCreate,
}) => {
  const { pageUsers, page, pageSize, totalPages, filteredUsers } = filters;
  const firstRow = filteredUsers.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRow = Math.min(page * pageSize, filteredUsers.length);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-white dark:bg-slate-900">
      {/* Único contenedor con scroll de la pantalla: la barra de filtros de
          arriba y la paginación de abajo quedan siempre a la vista. */}
      <div className="custom-scrollbar min-h-0 w-full flex-1 overflow-auto">
        {/* `<table>` crudo a propósito: el `Table` de shadcn se envuelve en un
            `overflow-auto` propio que atraparía el `sticky` de la cabecera. */}
        <table className="w-full min-w-[900px] caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="border-b border-slate-200 bg-slate-50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800">
              <TableHead className="min-w-[280px] px-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                Usuario
              </TableHead>
              <TableHead className="w-[140px] px-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                DNI
              </TableHead>
              <TableHead className="min-w-[200px] px-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                {ROLE_COLUMN_LABEL[filters.role]}
              </TableHead>
              <TableHead className="w-[150px] px-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                Estado
              </TableHead>
              <TableHead className="w-[100px] px-4 text-right text-sm font-bold text-slate-600 dark:text-slate-300">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageUsers.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="p-0">
                  <EmptyState
                    role={filters.role}
                    hasFilters={filters.activeFiltersCount > 0}
                    onClearFilters={filters.clearFilters}
                    onCreate={onCreate}
                  />
                </TableCell>
              </TableRow>
            ) : (
              pageUsers.map((user, index) => {
                const isActive = user.id === activeUserId;
                const column = roleColumn(user);
                return (
                  <TableRow
                    key={user.id}
                    tabIndex={0}
                    aria-label={`Ver la ficha de ${user.name}`}
                    onClick={() => onView(user)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      event.preventDefault();
                      onView(user);
                    }}
                    className={cn(
                      'cursor-pointer border-b border-slate-100 transition-colors dark:border-slate-800',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                      // Cebra: la primera fila en blanco, la siguiente en gris
                      // claro, para no perder el renglón al recorrer la tabla.
                      index % 2 === 1 && 'bg-slate-50 dark:bg-slate-800/40',
                      isActive
                        ? 'bg-primary/10 hover:bg-primary/10 dark:bg-primary/20'
                        : 'hover:bg-primary/5 dark:hover:bg-primary/10',
                    )}
                  >
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <StudentAvatar
                          className="h-10 w-10"
                          photoUrl={user.role === 'Estudiante' ? user.photoUrl : undefined}
                          name={user.name}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-slate-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                            {user.modularCode ?? user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-base tabular-nums text-slate-700 dark:text-slate-300">
                      {user.dni}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="truncate text-base font-medium text-slate-800 dark:text-slate-200">
                        {column.primary}
                      </p>
                      {column.secondary && (
                        <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                          {column.secondary}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn('px-3 py-1 text-sm', STATUS_STYLES[user.status])}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    {/* El menú de acciones no es "abrir la ficha": su clic no
                        debe subir hasta la fila. */}
                    <TableCell
                      className="px-4 py-3 text-right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <UserRowActions
                        user={user}
                        onView={onView}
                        onDelete={onDelete}
                        onDownloadCarnet={onDownloadCarnet}
                        onViewSchedule={onViewSchedule}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </table>
      </div>

      {/* Anclada abajo, fuera del scroll: siempre se ve en qué página se está. */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <label
            htmlFor="filas-por-pagina"
            className="text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            Filas por página
          </label>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => filters.setPageSize(Number(value))}
          >
            <SelectTrigger id="filas-por-pagina" className="h-10 w-24 rounded-xl text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()} className="h-10 text-base">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-base text-slate-600 dark:text-slate-400">
          {filteredUsers.length === 0
            ? 'Sin resultados'
            : `Mostrando ${firstRow}–${lastRow} de ${filteredUsers.length}`}
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={page === 1}
            onClick={() => filters.setPage(page - 1)}
            className="h-10 gap-2 rounded-xl px-4 text-base font-semibold"
          >
            <ChevronLeft size={20} /> Anterior
          </Button>
          <span className="min-w-[110px] text-center text-base font-semibold text-slate-700 dark:text-slate-300">
            Página {page} de {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => filters.setPage(page + 1)}
            className="h-10 gap-2 rounded-xl px-4 text-base font-semibold"
          >
            Siguiente <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};
