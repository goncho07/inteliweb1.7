import React, { useMemo, useRef, useState } from 'react';
import { Camera, HeartHandshake, KeyRound, Mail, Pencil, ShieldCheck, User, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DIALOG_ACTION_CLASS,
  DialogShellBody,
  DialogShellCancelButton,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
  DialogShellSection,
} from '@/components/common/DialogShell';
import { EmptyState } from '@/components/common/EmptyState';
import { StudentAvatar } from '@/components/common/StudentAvatar';
import { Dialog } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LinkGuardianPanel } from '@/features/users/components/LinkGuardianPanel';
import { DataField, RelatedPersonRow } from '@/features/users/components/UserDetailFields';
import { UserDetailsView } from '@/features/users/components/UserDetailsView';
import { UserFormBody } from '@/features/users/components/UserFormDialog';
import { ROLE_META, STATUS_STYLES } from '@/features/users/users.constants';
import { APP_ROLE_LABEL } from '@/features/users/users.format';
import type { UserFormValues } from '@/features/users/users.form';
import { cn } from '@/lib/utils';
import type { UserItem } from '@/types';

/**
 * Ficha de un usuario. Abre siempre en **modo lectura**: nada es editable
 * hasta que se pulsa «Editar», que cambia el cuerpo de la misma ventana al
 * formulario — no hay una segunda ventana encima de la primera. La cabecera
 * (avatar, nombre, etiquetas) es la misma en los dos modos.
 */

/**
 * Etiqueta de la cabecera (rol, estado). Más grande y más marcada que una
 * `Badge` de tabla: aquí resume a la persona, no es un adorno.
 */
const HeaderTag: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <span
    className={cn(
      'inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 px-3 py-1.5 text-sm font-bold',
      className,
    )}
  >
    {children}
  </span>
);

interface UserDetailsDialogProps {
  open: boolean;
  user: UserItem | null;
  /** Padrón completo, para resolver los vínculos de familia. */
  users: UserItem[];
  /** DNI ya registrados, para que el formulario no admita duplicados. */
  existingDnis: Set<string>;
  onClose: () => void;
  /** Guarda los cambios de la ficha. */
  onSave: (user: UserItem, values: UserFormValues) => void;
  /** Abrir la ficha de una persona vinculada sin salir del módulo. */
  onOpenRelated: (user: UserItem) => void;
  /** Vincula un apoderado ya registrado al alumno. */
  onLinkGuardian: (student: UserItem, guardian: UserItem) => void;
  /** Sube, reemplaza o quita la foto de un alumno. Solo aplica a Estudiante. */
  onUpdatePhoto: (user: UserItem, photoUrl: string | undefined) => void;
}

const UserDetailsContent: React.FC<
  Omit<UserDetailsDialogProps, 'open' | 'user'> & { user: UserItem }
> = ({ user, users, existingDnis, onClose, onSave, onOpenRelated, onLinkGuardian, onUpdatePhoto }) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const guardians = useMemo(
    () =>
      (user.guardianIds ?? [])
        .map((id) => users.find((item) => item.id === id))
        .filter((item): item is UserItem => !!item),
    [user, users],
  );
  const children = useMemo(
    () =>
      (user.childrenIds ?? [])
        .map((id) => users.find((item) => item.id === id))
        .filter((item): item is UserItem => !!item),
    [user, users],
  );
  const guardianCandidates = useMemo(
    () =>
      users.filter(
        (item) => item.role === 'Apoderado' && !(user.guardianIds ?? []).includes(item.id),
      ),
    [user, users],
  );

  const meta = ROLE_META[user.role];
  const isStudent = user.role === 'Estudiante';
  const hasFamily = isStudent || children.length > 0;
  // Los estudiantes no inician sesión: no tienen apartado de acceso.
  const hasAccount = !isStudent;

  /** Aula del alumno, bajo su nombre: es lo primero que se pregunta de él. */
  const classroomLine = [user.level, user.grade, user.section && `Sección ${user.section}`]
    .filter(Boolean)
    .join(' · ');

  /** Lee la foto elegida y la guarda como data URL: simulación sin backend. */
  const handlePhotoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onUpdatePhoto(user, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const familyAndAccessSections = (
    <>
      {hasFamily && (
        <DialogShellSection
          title={isStudent ? 'Apoderados registrados' : 'Hijos a su cargo'}
          icon={HeartHandshake}
        >
          {isStudent && guardians.length === 0 ? (
            showLinkPanel ? (
              <LinkGuardianPanel
                student={user}
                candidates={guardianCandidates}
                onCancel={() => setShowLinkPanel(false)}
                onLink={(guardianId) => {
                  const guardian = users.find((item) => item.id === guardianId);
                  if (guardian) onLinkGuardian(user, guardian);
                  setShowLinkPanel(false);
                }}
              />
            ) : (
              <EmptyState
                icon={HeartHandshake}
                title="Sin apoderados vinculados"
                description="Este alumno todavía no tiene apoderados registrados."
                action={
                  <Button
                    type="button"
                    onClick={() => setShowLinkPanel(true)}
                    className="h-10 gap-2 rounded-xl px-4 text-base font-semibold"
                  >
                    <UserPlus size={20} /> Vincular apoderado
                  </Button>
                }
                className="min-h-[160px] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800"
              />
            )
          ) : (
            <div className="flex flex-col gap-3">
              {isStudent
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
          )}
        </DialogShellSection>
      )}

      {hasAccount && (
        <DialogShellSection title="Acceso al sistema" icon={KeyRound}>
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
        </DialogShellSection>
      )}
    </>
  );

  const header = (
    <DialogShellHeader
      align="center"
      asideStack
      leading={
        <div className="relative h-16 w-16 shrink-0">
          <StudentAvatar
            className="h-16 w-16 rounded-2xl"
            photoUrl={user.photoUrl}
            name={user.name}
          />
          {isStudent && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => photoInputRef.current?.click()}
                    aria-label="Cambiar foto"
                    className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full border-2 border-white shadow-md dark:border-slate-900"
                  >
                    <Camera size={16} strokeWidth={2} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cambiar foto</TooltipContent>
              </Tooltip>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelected}
                className="hidden"
              />
            </>
          )}
        </div>
      }
      title={user.name}
      description={classroomLine || undefined}
      aside={
        <>
          <HeaderTag className="border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <meta.icon size={16} strokeWidth={2.5} /> {meta.singular}
          </HeaderTag>
          <HeaderTag className={STATUS_STYLES[user.status]}>{user.status}</HeaderTag>
        </>
      }
    />
  );

  return (
    <>
      {header}

      {mode === 'view' ? (
        <>
          <DialogShellBody flush>
            <UserDetailsView user={user} />
            {familyAndAccessSections}
          </DialogShellBody>
          <DialogShellFooter>
            <DialogShellCancelButton onClick={onClose}>Cerrar</DialogShellCancelButton>
            <Button
              type="button"
              onClick={() => setMode('edit')}
              className={DIALOG_ACTION_CLASS}
            >
              <Pencil size={20} /> Editar
            </Button>
          </DialogShellFooter>
        </>
      ) : (
        <UserFormBody
          user={user}
          defaultRole={user.role}
          existingDnis={existingDnis}
          header={<></>}
          cancelLabel="Cancelar"
          submitLabel="Guardar cambios"
          onClose={() => setMode('view')}
          onSubmit={(values) => {
            onSave(user, values);
            setMode('view');
          }}
          extraSections={familyAndAccessSections}
        />
      )}
    </>
  );
};

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  open,
  user,
  onClose,
  ...rest
}) => (
  <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
    <DialogShellContent>
      {/* La `key` obliga a empezar de cero al cambiar de persona: la ficha
          vuelve a modo lectura y se rellena con los datos de la nueva persona. */}
      {user && <UserDetailsContent key={user.id} user={user} onClose={onClose} {...rest} />}
    </DialogShellContent>
  </Dialog>
);
