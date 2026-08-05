import React, { useMemo, useState } from 'react';
import { AlertCircle, Lock, Pencil, UserPlus } from 'lucide-react';

import {
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
} from '@/components/common/DialogShell';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LEVEL_OPTIONS,
  ROLE_META,
  ROLE_ORDER,
  STATUS_BY_ROLE,
} from '@/features/users/users.constants';
import {
  NONE,
  emptyUserForm,
  gradesForLevel,
  sectionsForGrade,
  userToForm,
  validateUserForm,
  type UserFormErrors,
  type UserFormValues,
} from '@/features/users/users.form';
import { cn } from '@/lib/utils';
import type { UserItem, UserRole, UserStatus } from '@/types';

/**
 * Alta y edición de un usuario. Es el mismo formulario en los dos modos: lo
 * único que cambia es el DNI, que se fija al crear y queda bloqueado al
 * editar — identifica al registro y cambiarlo equivaldría a suplantar a otra
 * persona. Todo lo demás (incluido el tipo de usuario) es editable.
 */

const Field: React.FC<{
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ id, label, error, hint, className, children }) => (
  <div className={cn('flex flex-col gap-2', className)}>
    <Label htmlFor={id} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
      {label}
    </Label>
    {children}
    {error ? (
      <p
        id={`${id}-error`}
        role="alert"
        className="flex items-center gap-2 text-sm font-medium text-destructive"
      >
        <AlertCircle size={16} /> {error}
      </p>
    ) : (
      hint && <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
    )}
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="flex flex-col gap-4">
    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {title}
    </h3>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  </section>
);

interface UserFormDialogProps {
  open: boolean;
  /** Usuario a editar; `null` = alta nueva. */
  user: UserItem | null;
  /** Rol preseleccionado en un alta (el que se está listando). */
  defaultRole: UserRole;
  existingDnis: Set<string>;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
}

/**
 * Cuerpo del formulario. Va aparte porque `DialogContent` solo monta a sus
 * hijos mientras la ventana está abierta: así el formulario nace con los
 * datos de la persona correcta cada vez que se abre, sin un efecto que
 * reescriba el estado después de pintar.
 */
const UserFormBody: React.FC<Omit<UserFormDialogProps, 'open'>> = ({
  user,
  defaultRole,
  existingDnis,
  onClose,
  onSubmit,
}) => {
  const isEditing = user !== null;
  const [values, setValues] = useState<UserFormValues>(() =>
    user ? userToForm(user) : emptyUserForm(defaultRole),
  );
  const [errors, setErrors] = useState<UserFormErrors>({});

  /** Los DNI de los demás: al editar, el propio no cuenta como duplicado. */
  const otherDnis = useMemo(() => {
    if (!user) return existingDnis;
    const next = new Set(existingDnis);
    next.delete(user.dni);
    return next;
  }, [existingDnis, user]);

  const setField = <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  /** Cambiar el rol reajusta lo que depende de él: estado válido y aula. */
  const changeRole = (role: UserRole) => {
    setValues((previous) => ({
      ...previous,
      role,
      status: STATUS_BY_ROLE[role].includes(previous.status)
        ? previous.status
        : STATUS_BY_ROLE[role][0],
      ...(ROLE_META[role].hasClassroom ? {} : { level: NONE, grade: NONE, section: NONE }),
    }));
    setErrors({});
  };

  const changeLevel = (level: string) =>
    setValues((previous) => ({ ...previous, level, grade: NONE, section: NONE }));

  const changeGrade = (grade: string) =>
    setValues((previous) => ({ ...previous, grade, section: NONE }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validateUserForm(values, { existingDnis: otherDnis, isEditing });
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Lleva el foco al primer campo con problema, para no dejar al usuario
      // buscando por qué no se guarda.
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    onSubmit(values);
  };

  const meta = ROLE_META[values.role];
  const gradeOptions = gradesForLevel(values.level);
  const sectionOptions = sectionsForGrade(values.level, values.grade);

  return (
    <>
      <DialogShellHeader
        icon={isEditing ? Pencil : UserPlus}
        title={isEditing ? `Editar ${ROLE_META[user.role].singular.toLowerCase()}` : 'Crear usuario'}
        description={
          isEditing
            ? `${user.name} · DNI ${user.dni}`
            : 'Rellena los datos de la persona. Podrás cambiarlos después, salvo el DNI.'
        }
      />

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="custom-scrollbar flex flex-col gap-6 overflow-y-auto p-6">
          <Section title="Identidad">
            <Field id="role" label="Tipo de usuario">
              <Select value={values.role} onValueChange={(value) => changeRole(value as UserRole)}>
                <SelectTrigger id="role" className="h-11 rounded-xl text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {ROLE_ORDER.map((role) => (
                    <SelectItem key={role} value={role} className="h-10 text-base">
                      {ROLE_META[role].singular}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="status" label="Estado" error={errors.status}>
              <Select
                value={values.status}
                onValueChange={(value) => setField('status', value as UserStatus)}
              >
                <SelectTrigger id="status" className="h-11 rounded-xl text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {STATUS_BY_ROLE[values.role].map((status) => (
                    <SelectItem key={status} value={status} className="h-10 text-base">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              id="name"
              label="Nombre y apellidos"
              error={errors.name}
              className="sm:col-span-2"
            >
              <Input
                id="name"
                value={values.name}
                onChange={(event) => setField('name', event.target.value)}
                placeholder="Ej: María Quispe Flores"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className="h-11 rounded-xl text-base"
              />
            </Field>

            <Field
              id="dni"
              label="DNI"
              error={errors.dni}
              hint={
                isEditing
                  ? 'El DNI identifica al registro y no se puede modificar.'
                  : '8 dígitos, sin puntos ni guiones.'
              }
            >
              <div className="relative">
                <Input
                  id="dni"
                  value={values.dni}
                  onChange={(event) =>
                    setField('dni', event.target.value.replace(/\D/g, '').slice(0, 8))
                  }
                  disabled={isEditing}
                  inputMode="numeric"
                  placeholder="12345678"
                  aria-invalid={Boolean(errors.dni)}
                  aria-describedby={errors.dni ? 'dni-error' : undefined}
                  className={cn('h-11 rounded-xl text-base tabular-nums', isEditing && 'pr-11')}
                />
                {isEditing && (
                  <Lock
                    size={20}
                    aria-hidden
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                )}
              </div>
            </Field>

            <Field id="gender" label="Género">
              <Select
                value={values.gender}
                onValueChange={(value) => setField('gender', value as 'M' | 'F')}
              >
                <SelectTrigger id="gender" className="h-11 rounded-xl text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="F" className="h-10 text-base">
                    Femenino
                  </SelectItem>
                  <SelectItem value="M" className="h-10 text-base">
                    Masculino
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field id="birthDate" label="Fecha de nacimiento" error={errors.birthDate}>
              <Input
                id="birthDate"
                type="date"
                value={values.birthDate}
                onChange={(event) => setField('birthDate', event.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                aria-invalid={Boolean(errors.birthDate)}
                aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
                className="h-11 rounded-xl text-base"
              />
            </Field>
          </Section>

          <Section title="Contacto">
            <Field id="email" label="Correo electrónico" error={errors.email}>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(event) => setField('email', event.target.value)}
                placeholder="nombre.apellido@colegio.edu.pe"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className="h-11 rounded-xl text-base"
              />
            </Field>

            <Field
              id="phone"
              label="Teléfono"
              error={errors.phone}
              hint="9 dígitos, empezando por 9."
            >
              <Input
                id="phone"
                inputMode="numeric"
                value={values.phone}
                onChange={(event) =>
                  setField('phone', event.target.value.replace(/\D/g, '').slice(0, 9))
                }
                placeholder="987654321"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                className="h-11 rounded-xl text-base tabular-nums"
              />
            </Field>

            <Field id="address" label="Dirección" className="sm:col-span-2">
              <Input
                id="address"
                value={values.address}
                onChange={(event) => setField('address', event.target.value)}
                placeholder="Av. Los Héroes 123"
                className="h-11 rounded-xl text-base"
              />
            </Field>
          </Section>

          {meta.hasClassroom && (
            <Section title={values.role === 'Estudiante' ? 'Aula asignada' : 'Aula que tutela'}>
              <Field id="level" label="Nivel educativo" error={errors.level}>
                <Select value={values.level} onValueChange={changeLevel}>
                  <SelectTrigger id="level" className="h-11 rounded-xl text-base">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value={NONE} className="h-10 text-base">
                      Sin asignar
                    </SelectItem>
                    {LEVEL_OPTIONS.map((level) => (
                      <SelectItem key={level} value={level} className="h-10 text-base">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                id="grade"
                label="Grado"
                error={errors.grade}
                hint={values.level === NONE ? 'Elige primero el nivel.' : undefined}
              >
                <Select
                  value={values.grade}
                  onValueChange={changeGrade}
                  disabled={values.level === NONE}
                >
                  <SelectTrigger id="grade" className="h-11 rounded-xl text-base">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value={NONE} className="h-10 text-base">
                      Sin asignar
                    </SelectItem>
                    {gradeOptions.map((grade) => (
                      <SelectItem key={grade} value={grade} className="h-10 text-base">
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                id="section"
                label="Sección"
                error={errors.section}
                hint={values.grade === NONE ? 'Elige primero el grado.' : undefined}
              >
                <Select
                  value={values.section}
                  onValueChange={(value) => setField('section', value)}
                  disabled={values.grade === NONE}
                >
                  <SelectTrigger id="section" className="h-11 rounded-xl text-base">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value={NONE} className="h-10 text-base">
                      Sin asignar
                    </SelectItem>
                    {sectionOptions.map((section) => (
                      <SelectItem key={section} value={section} className="h-10 text-base">
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {values.role === 'Estudiante' && (
                <Field
                  id="modularCode"
                  label="Código modular"
                  error={errors.modularCode}
                  hint="14 dígitos del SIAGIE. Opcional."
                >
                  <Input
                    id="modularCode"
                    inputMode="numeric"
                    value={values.modularCode}
                    onChange={(event) =>
                      setField('modularCode', event.target.value.replace(/\D/g, '').slice(0, 14))
                    }
                    placeholder="00000090275274"
                    aria-invalid={Boolean(errors.modularCode)}
                    aria-describedby={errors.modularCode ? 'modularCode-error' : undefined}
                    className="h-11 rounded-xl text-base tabular-nums"
                  />
                </Field>
              )}

              {values.role === 'Docente' && (
                <Field id="subject" label="Curso que dicta">
                  <Input
                    id="subject"
                    value={values.subject}
                    onChange={(event) => setField('subject', event.target.value)}
                    placeholder="Ej: Matemática"
                    className="h-11 rounded-xl text-base"
                  />
                </Field>
              )}
            </Section>
          )}

          {values.role === 'Administrativo' && (
            <Section title="Puesto">
              <Field id="position" label="Cargo" className="sm:col-span-2">
                <Input
                  id="position"
                  value={values.position}
                  onChange={(event) => setField('position', event.target.value)}
                  placeholder="Ej: Secretaría"
                  className="h-11 rounded-xl text-base"
                />
              </Field>
            </Section>
          )}
        </div>

        <DialogShellFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-12 rounded-xl px-6 text-base font-semibold"
          >
            Cancelar
          </Button>
          <Button type="submit" className="h-12 rounded-xl px-8 text-base font-semibold">
            {isEditing ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </DialogShellFooter>
      </form>
    </>
  );
};

export const UserFormDialog: React.FC<UserFormDialogProps> = ({ open, onClose, ...rest }) => (
  <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
    <DialogShellContent size="md" height="fixed">
      <UserFormBody onClose={onClose} {...rest} />
    </DialogShellContent>
  </Dialog>
);
