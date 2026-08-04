import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, Filter, SquarePen, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownFilter } from '@/features/users/components/DropdownFilter';
import { HierarchicalDropdownFilter } from '@/features/users/components/HierarchicalDropdownFilter';
import { downloadUserQRCarnets } from '@/features/users/utils';
import { cn } from '@/lib/utils';
import { UserItem } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  Matriculado: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Activo: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Retirado: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  Trasladado: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Egresado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

/** Acción de fila: icono con etiqueta accesible y tooltip, según el contrato de diseño. */
const RowAction: React.FC<{
  label: string;
  icon: React.ElementType;
  tone: 'emerald' | 'blue';
  onClick: (e: React.MouseEvent) => void;
}> = ({ label, icon: Icon, tone, onClick }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={label}
        onClick={onClick}
        className={cn(
          'h-10 w-10 rounded-lg',
          tone === 'emerald'
            ? 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
            : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20',
        )}
      >
        <Icon size={20} />
      </Button>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

/** Tabla de usuarios con filtros de aula/estado en cabecera, acciones por fila y paginación. */
export const UsersTable: React.FC<{
  paginatedUsers: UserItem[];
  selectedRole: UserItem['role'];
  selectedLevel: string;
  changeLevel: (value: string) => void;
  selectedGrade: string;
  changeGrade: (value: string) => void;
  selectedSection: string;
  changeSection: (value: string) => void;
  gradeOptions: string[];
  sectionOptions: string[];
  selectedStatus: string;
  changeStatus: (value: string) => void;
  openDropdown: string | null;
  setOpenDropdown: (value: string | null) => void;
  setSelectedUser: (user: UserItem) => void;
  setInitialModalTab: (tab: 'personal' | 'academic' | 'family' | 'account') => void;
  setSelectedTeacherForSchedule: (user: UserItem) => void;
  setIsScheduleModalOpen: (value: boolean) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}> = ({
  paginatedUsers,
  selectedRole,
  selectedLevel,
  changeLevel,
  selectedGrade,
  changeGrade,
  selectedSection,
  changeSection,
  gradeOptions,
  sectionOptions,
  selectedStatus,
  changeStatus,
  openDropdown,
  setOpenDropdown,
  setSelectedUser,
  setInitialModalTab,
  setSelectedTeacherForSchedule,
  setIsScheduleModalOpen,
  currentPage,
  setCurrentPage,
  totalPages,
}) => (
  <TooltipProvider delayDuration={200}>
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex-1 overflow-x-auto">
        <Table className="min-w-[800px] table-fixed border-collapse text-left">
          <TableHeader>
            <TableRow className="border-b border-blue-100 bg-blue-50/40 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800">
              <TableHead className="w-[40%] px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Usuario
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <HierarchicalDropdownFilter
                  selectedLevel={selectedLevel}
                  setSelectedLevel={changeLevel}
                  selectedGrade={selectedGrade}
                  setSelectedGrade={changeGrade}
                  selectedSection={selectedSection}
                  setSelectedSection={changeSection}
                  gradeOptions={gradeOptions}
                  sectionOptions={sectionOptions}
                  isOpen={openDropdown === 'hierarchy'}
                  onToggle={() => setOpenDropdown(openDropdown === 'hierarchy' ? null : 'hierarchy')}
                />
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <DropdownFilter
                  label="Estado"
                  value={selectedStatus}
                  options={
                    selectedRole === 'Estudiante'
                      ? ['Matriculado', 'Retirado', 'Trasladado', 'Egresado']
                      : ['Activo', 'Inactivo', 'Suspendido']
                  }
                  isOpen={openDropdown === 'status'}
                  onToggle={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                  onChange={changeStatus}
                />
              </TableHead>
              <TableHead className="w-[15%] px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, index) => (
                <TableRow
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={cn(
                    'cursor-pointer border-b-0 transition-colors hover:bg-blue-50/50 dark:hover:bg-slate-700',
                    index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/80',
                  )}
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                        <User size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold uppercase tracking-tight text-slate-900 dark:text-white">
                          {user.name}
                        </p>
                        {user.code && (
                          <p className="mt-0.5 text-xs font-medium text-slate-400">{user.code}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold uppercase text-slate-700 dark:text-slate-300">
                        {user.level || '—'}
                      </span>
                      <span className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                        {user.grade ? `${user.grade.replace(' Grado', '')} ${user.section ?? ''}` : '—'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        'border-transparent',
                        STATUS_STYLES[user.status ?? ''] ??
                          'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
                      )}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {selectedRole === 'Estudiante' && (
                        <RowAction
                          label="Descargar carnet QR"
                          icon={Download}
                          tone="emerald"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadUserQRCarnets(user);
                          }}
                        />
                      )}
                      {selectedRole === 'Docente' && (
                        <RowAction
                          label="Ver horario"
                          icon={Calendar}
                          tone="emerald"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTeacherForSchedule(user);
                            setIsScheduleModalOpen(true);
                          }}
                        />
                      )}
                      <RowAction
                        label={selectedRole === 'Estudiante' ? 'Editar familia' : 'Editar cuenta'}
                        icon={SquarePen}
                        tone="blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInitialModalTab(selectedRole === 'Estudiante' ? 'family' : 'account');
                          setSelectedUser(user);
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="px-6 py-12 text-center">
                  <Filter size={32} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                  <p className="text-base font-bold text-slate-600 dark:text-slate-300">
                    No hay resultados con estos filtros
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Prueba a cambiar el aula, el estado o el texto de búsqueda.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
        <Button
          type="button"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="h-10 gap-2 rounded-xl px-4 font-bold"
        >
          <ChevronLeft size={20} /> Anterior
        </Button>
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
          Página {currentPage} de {totalPages || 1}
        </span>
        <Button
          type="button"
          variant="outline"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="h-10 gap-2 rounded-xl px-4 font-bold"
        >
          Siguiente <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  </TooltipProvider>
);
