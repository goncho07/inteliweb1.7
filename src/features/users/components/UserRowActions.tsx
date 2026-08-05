import React from 'react';
import { CalendarDays, Eye, IdCard, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UserItem } from '@/types';

/**
 * Acciones de una fila, agrupadas en un menú. La tabla anterior repartía dos
 * botones de solo icono por fila (distintos según el rol) y escondía «ver
 * ficha» en el clic sobre la fila. Aquí todas las acciones son visibles, con
 * etiqueta de texto, y la destructiva va separada y en rojo.
 */
export const UserRowActions: React.FC<{
  user: UserItem;
  onView: (user: UserItem) => void;
  onEdit: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
  onDownloadCarnet: (user: UserItem) => void;
  onViewSchedule: (user: UserItem) => void;
}> = ({ user, onView, onEdit, onDelete, onDownloadCarnet, onViewSchedule }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Acciones para ${user.name}`}
        onClick={(event) => event.stopPropagation()}
        className="h-10 w-10 rounded-lg"
      >
        <MoreHorizontal size={20} />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-60 rounded-xl p-1">
      <DropdownMenuLabel className="px-3 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
        {user.name}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={() => onView(user)}
        className="h-10 cursor-pointer gap-3 rounded-lg px-3 text-base"
      >
        <Eye size={20} /> Ver ficha completa
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={() => onEdit(user)}
        className="h-10 cursor-pointer gap-3 rounded-lg px-3 text-base"
      >
        <Pencil size={20} /> Editar datos
      </DropdownMenuItem>
      {user.role === 'Estudiante' && (
        <DropdownMenuItem
          onSelect={() => onDownloadCarnet(user)}
          className="h-10 cursor-pointer gap-3 rounded-lg px-3 text-base"
        >
          <IdCard size={20} /> Descargar carnets QR
        </DropdownMenuItem>
      )}
      {user.role === 'Docente' && (
        <DropdownMenuItem
          onSelect={() => onViewSchedule(user)}
          className="h-10 cursor-pointer gap-3 rounded-lg px-3 text-base"
        >
          <CalendarDays size={20} /> Ver horario
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={() => onDelete(user)}
        className="h-10 cursor-pointer gap-3 rounded-lg px-3 text-base text-destructive focus:bg-destructive/10 focus:text-destructive"
      >
        <Trash2 size={20} /> Eliminar usuario
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
