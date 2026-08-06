import React, { useState } from 'react';
import { Plus, Upload, Users } from 'lucide-react';

import {
  ModuleBody,
  ModulePane,
  ModulePaneHeader,
  ModuleShell,
  ModuleSidebar,
  ModuleSidebarBody,
  ModuleSidebarSection,
} from '@/components/layout/ModuleShell';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DeleteUsersDialog } from '@/features/users/components/DeleteUsersDialog';
import { GenerateCarnetsDialog } from '@/features/users/components/GenerateCarnetsDialog';
import { ImportUsersDialog } from '@/features/users/components/ImportUsersDialog';
import { RoleFilterPanel } from '@/features/users/components/RoleFilterPanel';
import { TeacherScheduleDialog } from '@/features/users/components/TeacherScheduleDialog';
import { UserDetailsDialog } from '@/features/users/components/UserDetailsDialog';
import { UserFormDialog } from '@/features/users/components/UserFormDialog';
import { UsersTable } from '@/features/users/components/UsersTable';
import { UsersToolbar } from '@/features/users/components/UsersToolbar';
import { useUsersDirectory } from '@/features/users/hooks/useUsersDirectory';
import { useUsersFilters } from '@/features/users/hooks/useUsersFilters';
import { ROLE_META } from '@/features/users/users.constants';
import { downloadUserQRCarnets } from '@/features/users/utils';
import type { UserFormValues } from '@/features/users/users.form';
import { useToast } from '@/hooks/use-toast';
import type { ModuleProps, UserItem } from '@/types';

/**
 * Panel de administración de usuarios: alta, edición, baja y carga masiva
 * sobre el padrón del colegio, con búsqueda, filtros por aula y estado, y
 * selección múltiple.
 *
 * El módulo solo orquesta: los datos viven en `useUsersDirectory`, los
 * filtros en `useUsersFilters` y cada ventana en su propio componente sobre
 * el `Dialog` de shadcn.
 */

/** Qué ventana está abierta. Solo puede haber una, y el estado lo dice. */
type OpenDialog =
  | { kind: 'none' }
  | { kind: 'form'; user: UserItem | null }
  | { kind: 'details'; user: UserItem }
  | { kind: 'delete'; users: UserItem[] }
  | { kind: 'schedule'; teacher: UserItem }
  | { kind: 'carnets' }
  | { kind: 'import' };

export const UsersModule: React.FC<ModuleProps> = () => {
  const directory = useUsersDirectory();
  const filters = useUsersFilters(directory.users);
  const { toast } = useToast();

  const [dialog, setDialog] = useState<OpenDialog>({ kind: 'none' });
  const closeDialog = () => setDialog({ kind: 'none' });

  const meta = ROLE_META[filters.role];

  /**
   * Guarda los cambios de una ficha sin cerrar su ventana: al volver a la
   * vista de lectura, los datos que se ven ya son los nuevos.
   */
  const handleSaveUser = (user: UserItem, values: UserFormValues) => {
    directory.updateUser(user.id, values);
    toast({
      title: 'Cambios guardados',
      description: `Se actualizaron los datos de ${values.name.trim()}.`,
    });
  };

  const handleLinkGuardian = (student: UserItem, guardian: UserItem) => {
    directory.linkGuardian(student.id, guardian.id);
    toast({
      title: 'Apoderado vinculado',
      description: `${guardian.name} ya figura como apoderado de ${student.name}.`,
    });
  };

  const handleUpdatePhoto = (user: UserItem, photoUrl: string | undefined) => {
    directory.updatePhoto(user.id, photoUrl);
    toast({
      title: photoUrl ? 'Foto actualizada' : 'Foto eliminada',
      description: photoUrl
        ? `Se actualizó la foto de ${user.name}.`
        : `Se quitó la foto de ${user.name}.`,
    });
  };

  const handleSubmitForm = (values: UserFormValues) => {
    const editing = dialog.kind === 'form' ? dialog.user : null;
    if (editing) {
      handleSaveUser(editing, values);
    } else {
      directory.createUser(values);
      toast({
        title: 'Usuario creado',
        description: `${values.name.trim()} ya figura en la lista de ${ROLE_META[values.role].plural.toLowerCase()}.`,
      });
      // Que el registro recién creado se vea: si estaba listando otro rol,
      // guardar dejaba la lista igual y parecía que no había pasado nada.
      if (values.role !== filters.role) filters.setRole(values.role);
    }
    closeDialog();
  };

  const handleConfirmDelete = () => {
    if (dialog.kind !== 'delete') return;
    const { users } = dialog;
    directory.deleteUsers(users.map((user) => user.id));
    toast({
      title: users.length === 1 ? 'Usuario eliminado' : `${users.length} usuarios eliminados`,
      description:
        users.length === 1
          ? `${users[0].name} ya no figura en el padrón.`
          : 'Los registros seleccionados ya no figuran en el padrón.',
    });
    closeDialog();
  };

  const handleImport = (rows: UserFormValues[]) => {
    directory.importUsers(rows);
    toast({
      title: `${rows.length} ${rows.length === 1 ? 'usuario importado' : 'usuarios importados'}`,
      description: 'Ya aparecen en la lista del rol que les corresponde.',
    });
    closeDialog();
  };

  const handleDownloadCarnet = async (user: UserItem) => {
    toast({ title: 'Generando carnets', description: `Preparando el PDF de ${user.name}…` });
    try {
      const { failed } = await downloadUserQRCarnets(user);
      toast({
        title: 'Carnets descargados',
        description:
          failed === 0
            ? `PDF con los carnets de ${user.name}.`
            : `PDF descargado, pero ${failed} códigos QR no se pudieron generar.`,
      });
    } catch {
      toast({
        title: 'No se pudo generar el PDF',
        description: 'Revisa tu conexión e inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <ModuleShell>
        <ModuleSidebar title="Usuarios" icon={Users}>
          <ModuleSidebarBody>
            <ModuleSidebarSection label="Tipo de usuario">
              <RoleFilterPanel
                selectedRole={filters.role}
                onSelectRole={filters.setRole}
                countsByRole={directory.countsByRole}
              />
            </ModuleSidebarSection>
          </ModuleSidebarBody>
        </ModuleSidebar>

        <ModulePane>
          <ModulePaneHeader>
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <meta.icon size={24} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-slate-800 dark:text-white">
                  {meta.plural}
                </p>
                <p className="truncate text-base text-slate-500 dark:text-slate-400">
                  {filters.filteredUsers.length}{' '}
                  {filters.filteredUsers.length === 1 ? 'registrado' : 'registrados'}
                  {filters.activeFiltersCount > 0 && ` de ${directory.countsByRole[filters.role]}`}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialog({ kind: 'import' })}
                className="h-10 gap-2 rounded-xl px-4 text-base font-semibold"
              >
                <Upload size={20} /> Subir usuarios
              </Button>
              <Button
                type="button"
                onClick={() => setDialog({ kind: 'form', user: null })}
                className="h-10 gap-2 rounded-xl px-4 text-base font-semibold"
              >
                <Plus size={20} /> Crear usuario
              </Button>
            </div>
          </ModulePaneHeader>

          {/* Barra fija, igual que en la Vista General del Aula: no entra en
              el scroll, que vive dentro de la propia tabla. */}
          <UsersToolbar filters={filters} onDownloadCarnets={() => setDialog({ kind: 'carnets' })} />

          {/* A sangre y sin scroll propio: la pantalla *es* la tabla, así que
              llega a los bordes del panel y se desplaza por dentro. */}
          <ModuleBody flush className="flex min-h-0 flex-col overflow-hidden">
            <UsersTable
              filters={filters}
              activeUserId={dialog.kind === 'details' ? dialog.user.id : null}
              onView={(user) => setDialog({ kind: 'details', user })}
              onDelete={(user) => setDialog({ kind: 'delete', users: [user] })}
              onDownloadCarnet={(user) => void handleDownloadCarnet(user)}
              onViewSchedule={(teacher) => setDialog({ kind: 'schedule', teacher })}
              onCreate={() => setDialog({ kind: 'form', user: null })}
            />
          </ModuleBody>
        </ModulePane>

        <UserFormDialog
          open={dialog.kind === 'form'}
          user={dialog.kind === 'form' ? dialog.user : null}
          defaultRole={filters.role}
          existingDnis={directory.existingDnis}
          onClose={closeDialog}
          onSubmit={handleSubmitForm}
        />

        {/* La ficha se lee del padrón por `id`, no de la copia guardada al
            abrirla: así, tras guardar sin cerrar la ventana, lo que se ve son
            ya los datos nuevos. */}
        <UserDetailsDialog
          open={dialog.kind === 'details'}
          user={
            dialog.kind === 'details'
              ? (directory.users.find((item) => item.id === dialog.user.id) ?? dialog.user)
              : null
          }
          users={directory.users}
          existingDnis={directory.existingDnis}
          onClose={closeDialog}
          onSave={handleSaveUser}
          onOpenRelated={(user) => setDialog({ kind: 'details', user })}
          onLinkGuardian={handleLinkGuardian}
          onUpdatePhoto={handleUpdatePhoto}
        />

        <DeleteUsersDialog
          open={dialog.kind === 'delete'}
          users={dialog.kind === 'delete' ? dialog.users : []}
          onClose={closeDialog}
          onConfirm={handleConfirmDelete}
        />

        <TeacherScheduleDialog
          open={dialog.kind === 'schedule'}
          teacher={dialog.kind === 'schedule' ? dialog.teacher : null}
          onClose={closeDialog}
        />

        <GenerateCarnetsDialog
          open={dialog.kind === 'carnets'}
          users={directory.users}
          initialClassroom={{
            level: filters.level,
            grade: filters.grade,
            section: filters.section,
          }}
          onClose={closeDialog}
          onFinished={(studentCount, failed) =>
            toast({
              title: 'Carnets descargados',
              description:
                failed === 0
                  ? `PDF con los carnets de ${studentCount} ${studentCount === 1 ? 'estudiante' : 'estudiantes'}.`
                  : `PDF descargado, pero ${failed} códigos QR no se pudieron generar.`,
            })
          }
          onError={() =>
            toast({
              title: 'No se pudo generar el PDF',
              description: 'Revisa tu conexión e inténtalo de nuevo.',
              variant: 'destructive',
            })
          }
        />

        <ImportUsersDialog
          open={dialog.kind === 'import'}
          existingDnis={directory.existingDnis}
          onClose={closeDialog}
          onImport={handleImport}
        />
      </ModuleShell>
    </TooltipProvider>
  );
};
