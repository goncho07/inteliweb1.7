import React, { useMemo } from 'react';
import {
  Briefcase,
  CalendarDays,
  CreditCard,
  GraduationCap,
  Hash,
  HeartHandshake,
  Home,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  School,
  Settings,
  ShieldCheck,
  User,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import {
  DIALOG_TABS_LIST_CLASS,
  DIALOG_TAB_TRIGGER_CLASS,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
} from '@/components/common/DialogShell';
import { EmptyState } from '@/components/common/EmptyState';
import { StudentAvatar } from '@/components/common/StudentAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DataField,
  DetailSection,
  RelatedPersonRow,
} from '@/features/users/components/UserDetailFields';
import { ROLE_META, STATUS_STYLES } from '@/features/users/users.constants';
import {
  APP_ROLE_LABEL,
  calculateAge,
  formatBirthDate,
  formatGender,
  formatPhone,
} from '@/features/users/users.format';
import { getClassroomLabel } from '@/features/classrooms/overview.format';
import { cn } from '@/lib/utils';
import type { UserItem } from '@/types';

/**
 * Ficha de un usuario, de solo lectura: para cambiar algo se abre el
 * formulario de edición, que es el único sitio donde se escribe. Antes esta
 * misma ventana tenía campos editables y un botón «Guardar cambios» que solo
 * cerraba la ventana, y rellenaba con datos fijos (una fecha de nacimiento,
 * un código modular y un género idénticos para todo el colegio) lo que no
 * sabía. Ahora todo lo que se ve sale del registro y lo que falta se dice.
 */

export type UserDetailTab = 'personal' | 'academic' | 'family' | 'account';

interface TabDefinition {
  id: UserDetailTab;
  label: string;
  icon: LucideIcon;
}

const tabsForRole = (user: UserItem): TabDefinition[] => {
  const personal: TabDefinition = { id: 'personal', label: 'Datos personales', icon: User };
  const academic: TabDefinition = { id: 'academic', label: 'Académico', icon: GraduationCap };
  const family: TabDefinition = { id: 'family', label: 'Familia', icon: HeartHandshake };
  const account: TabDefinition = { id: 'account', label: 'Acceso', icon: Settings };

  switch (user.role) {
    case 'Estudiante':
      return [personal, academic, family];
    case 'Docente':
      return [personal, academic, account];
    case 'Apoderado':
      return [personal, family, account];
    case 'Administrativo':
      return [personal, account];
  }
};

export const UserDetailsDialog: React.FC<{
  open: boolean;
  user: UserItem | null;
  /** Padrón completo, para resolver los vínculos de familia. */
  users: UserItem[];
  /** Pestaña con la que abrir (p. ej. «Familia» al venir de esa acción). */
  initialTab?: UserDetailTab;
  onClose: () => void;
  onEdit: (user: UserItem) => void;
  /** Abrir la ficha de una persona vinculada sin salir del módulo. */
  onOpenRelated: (user: UserItem) => void;
}> = ({ open, user, users, initialTab = 'personal', onClose, onEdit, onOpenRelated }) => {
  const tabs = useMemo(() => (user ? tabsForRole(user) : []), [user]);

  const guardians = useMemo(
    () =>
      (user?.guardianIds ?? [])
        .map((id) => users.find((item) => item.id === id))
        .filter((item): item is UserItem => !!item),
    [user, users],
  );
  const children = useMemo(
    () =>
      (user?.childrenIds ?? [])
        .map((id) => users.find((item) => item.id === id))
        .filter((item): item is UserItem => !!item),
    [user, users],
  );

  if (!user) return null;

  // La pestaña pedida puede no existir para este rol (un apoderado no tiene
  // «Académico»): en ese caso se cae a la primera, en vez de dejar el cuerpo
  // de la ficha en blanco.
  const activeTab = tabs.some((tab) => tab.id === initialTab) ? initialTab : tabs[0].id;
  const meta = ROLE_META[user.role];
  const age = calculateAge(user.birthDate);
  const tutorClassroom =
    user.level && user.grade && user.section
      ? getClassroomLabel({ level: user.level, grade: user.grade, section: user.section })
      : null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogShellContent size="md" height="fixed">
        <DialogShellHeader
          leading={<StudentAvatar className="h-11 w-11 shrink-0" />}
          title={<span className="min-w-0 truncate">{user.name}</span>}
          description={`Datos registrados · DNI ${user.dni}`}
        >
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge
              variant="outline"
              className="gap-1.5 border-slate-200 bg-slate-100 px-2.5 py-0.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <meta.icon size={16} /> {meta.singular}
            </Badge>
            <Badge
              variant="outline"
              className={cn('px-2.5 py-0.5 text-sm', STATUS_STYLES[user.status])}
            >
              {user.status}
            </Badge>
          </div>
        </DialogShellHeader>

        {/* La `key` reinicia la pestaña activa al cambiar de persona o al
            abrir la ficha directamente en «Familia». */}
        <Tabs
          key={`${user.id}-${activeTab}`}
          defaultValue={activeTab}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className={DIALOG_TABS_LIST_CLASS}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className={DIALOG_TAB_TRIGGER_CLASS}>
                <tab.icon size={20} />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Única zona con scroll: el alto de la ventana no cambia al pasar de
              una pestaña a otra, solo cambia lo que hay dentro. */}
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
            <TabsContent value="personal" className="mt-0 flex flex-col gap-6">
              <DetailSection title="Identidad" icon={CreditCard}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <DataField label="DNI" value={user.dni} icon={CreditCard} />
                  <DataField
                    label="Fecha de nacimiento"
                    value={formatBirthDate(user.birthDate)}
                    hint={age === null ? undefined : `(${age} años)`}
                    icon={CalendarDays}
                  />
                  <DataField label="Género" value={formatGender(user.gender)} icon={UserRound} />
                  {user.role === 'Estudiante' && (
                    <DataField label="Código del estudiante" value={user.code} icon={Hash} />
                  )}
                  {user.role === 'Estudiante' && (
                    <DataField label="Código modular" value={user.modularCode} icon={Hash} />
                  )}
                  {user.role === 'Administrativo' && (
                    <DataField label="Cargo" value={user.position} icon={ShieldCheck} />
                  )}
                </div>
              </DetailSection>

              <DetailSection title="Contacto" icon={Phone}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <DataField label="Correo electrónico" value={user.email} icon={Mail} />
                  <DataField label="Teléfono" value={formatPhone(user.phone)} icon={Phone} />
                  <DataField label="Dirección" value={user.address} icon={Home} />
                </div>
              </DetailSection>
            </TabsContent>

            <TabsContent value="academic" className="mt-0 flex flex-col gap-6">
              {user.role === 'Docente' ? (
                <>
                  <DetailSection title="Información académica" icon={School}>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <DataField label="Curso que dicta" value={user.subject} icon={Briefcase} />
                      <DataField label="Tutor de" value={tutorClassroom} icon={GraduationCap} />
                    </div>
                  </DetailSection>

                  <DetailSection title="Aulas a su cargo" icon={School}>
                    {(user.classrooms?.length ?? 0) === 0 ? (
                      <p className="text-base text-slate-500 dark:text-slate-400">
                        No tiene aulas asignadas todavía.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user.classrooms?.map((classroom) => (
                          <span
                            key={`${classroom.level}-${classroom.grade}-${classroom.section}`}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                          >
                            {getClassroomLabel(classroom)}
                          </span>
                        ))}
                      </div>
                    )}
                  </DetailSection>
                </>
              ) : (
                <DetailSection title="Situación académica" icon={School}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <DataField label="Nivel educativo" value={user.level} icon={School} />
                    <DataField label="Grado" value={user.grade} icon={GraduationCap} />
                    <DataField label="Sección" value={user.section} icon={Hash} />
                    <DataField label="Situación" value={user.status} icon={ShieldCheck} />
                  </div>
                </DetailSection>
              )}
            </TabsContent>

            <TabsContent value="family" className="mt-0 flex h-full flex-col gap-6">
              {/* Sin vínculos, el estado vacío ocupa el cuerpo entero en vez de
                  dejar la ventana medio vacía. */}
              {user.role === 'Estudiante' && guardians.length === 0 ? (
                <EmptyState
                  icon={HeartHandshake}
                  title="Sin apoderados vinculados"
                  description="Este alumno todavía no tiene apoderados registrados. Se vinculan desde la lista de Apoderados."
                />
              ) : user.role !== 'Estudiante' && children.length === 0 ? (
                <EmptyState
                  icon={HeartHandshake}
                  title="Sin hijos vinculados"
                  description="No hay estudiantes asociados a esta persona en el padrón."
                />
              ) : (
                <DetailSection
                  title={user.role === 'Estudiante' ? 'Apoderados registrados' : 'Hijos a su cargo'}
                  icon={HeartHandshake}
                >
                  <div className="flex flex-col gap-3">
                    {user.role === 'Estudiante'
                      ? guardians.map((guardian, index) => (
                          <RelatedPersonRow
                            key={guardian.id}
                            person={guardian}
                            relation={
                              index === 0
                                ? 'Apoderado principal'
                                : guardian.gender === 'M'
                                  ? 'Padre'
                                  : 'Madre'
                            }
                            highlight={index === 0}
                            onOpen={onOpenRelated}
                          />
                        ))
                      : children.map((child) => (
                          <RelatedPersonRow
                            key={child.id}
                            person={child}
                            relation={child.gender === 'M' ? 'Hijo' : 'Hija'}
                            onOpen={onOpenRelated}
                          />
                        ))}
                  </div>
                </DetailSection>
              )}
            </TabsContent>

            <TabsContent value="account" className="mt-0 flex flex-col gap-6">
              <DetailSection title="Acceso al sistema" icon={KeyRound}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <DataField label="Usuario" value={user.dni} icon={User} />
                  <DataField
                    label="Perfil de acceso"
                    value={user.appRole ? APP_ROLE_LABEL[user.appRole] : null}
                    icon={ShieldCheck}
                  />
                  <DataField label="Correo de contacto" value={user.email} icon={Mail} />
                  <DataField label="Estado de la cuenta" value={user.status} icon={KeyRound} />
                </div>
              </DetailSection>
            </TabsContent>
          </div>
        </Tabs>

        <DialogShellFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-12 rounded-xl px-6 text-base font-semibold"
          >
            Cerrar
          </Button>
          <Button
            type="button"
            onClick={() => onEdit(user)}
            className="h-12 gap-2 rounded-xl px-6 text-base font-semibold"
          >
            <Pencil size={20} /> Editar datos
          </Button>
        </DialogShellFooter>
      </DialogShellContent>
    </Dialog>
  );
};
