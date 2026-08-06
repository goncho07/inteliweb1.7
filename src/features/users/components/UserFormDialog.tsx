import React, { useMemo, useState } from 'react';
import {
  CreditCard,
  GraduationCap,
  Lock,
  Pencil,
  Phone,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

import {
  DIALOG_ACTION_CLASS,
  DialogShellBody,
  DialogShellCancelButton,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
  DialogShellSection,
} from '@/components/common/DialogShell';
import { Field, FieldGrid } from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ADMINISTRATIVE_POSITIONS,
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
 * que cambia son los códigos, que se fijan al crear y quedan bloqueados al
 * editar. El DNI identifica al registro —cambiarlo equivaldría a suplantar a
 * otra persona— y el código modular lo asigna el SIAGIE, no el colegio. Todo
 * lo demás (tipo de usuario, identidad, contacto y aula) es editable.
 *
 * El cuerpo (`UserFormBody`) se exporta aparte porque la ficha del usuario lo
 * monta dentro de su propia ventana al pulsar «Editar datos»: se edita ahí
 * mismo, sin abrir una segunda ventana encima de la primera.
 */

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

interface UserFormBodyProps extends Omit<UserFormDialogProps, 'open'> {
  /** Cabecera propia. Sin ella se usa la del alta/edición genérica. */
  header?: React.ReactNode;
  /** Apartados de solo lectura que se añaden al final (familia, acceso…). */
  extraSections?: React.ReactNode;
  /** Texto del botón de salida. «Cancelar» por defecto. */
  cancelLabel?: string;
  /** Texto de la acción principal. Por defecto, según sea alta o edición. */
  submitLabel?: string;
}

/** Clase común de los controles del formulario: 44px de alto, como el contrato. */
const CONTROL_CLASS = 'h-11 rounded-xl text-base';

/** Campo de solo lectura: el dato se ve, pero no se puede escribir sobre él. */
const LockedInput: React.FC<{
  id: string;
  value: string;
  placeholder?: string;
}> = ({ id, value, placeholder }) => (
  <div className="relative">
    <Input
      id={id}
      value={value}
      disabled
      placeholder={placeholder}
      className={cn(CONTROL_CLASS, 'pr-11 tabular-nums')}
    />
    <Lock
      size={20}
      aria-hidden
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
    />
  </div>
);

/**
 * Cuerpo del formulario: cabecera, campos y pie. Va aparte porque
 * `DialogContent` solo monta a sus hijos mientras la ventana está abierta, así
 * que el formulario nace con los datos de la persona correcta cada vez que se
 * abre, sin un efecto que reescriba el estado después de pintar.
 */
export const UserFormBody: React.FC<UserFormBodyProps> = ({
  user,
  defaultRole,
  existingDnis,
  header,
  extraSections,
  cancelLabel,
  submitLabel,
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
      // El correo de un estudiante no se pide ni se guarda: si venía escrito
      // de otro rol, se descarta al cambiar.
      ...(role === 'Estudiante' ? { email: '' } : {}),
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
  const isStudent = values.role === 'Estudiante';

  return (
    <>
      {header ?? (
        <DialogShellHeader
          icon={isEditing ? Pencil : UserPlus}
          title={
            isEditing ? `Editar ${ROLE_META[user.role].singular.toLowerCase()}` : 'Crear usuario'
          }
          description={
            isEditing
              ? `${user.name} · DNI ${user.dni}`
              : 'Rellena los datos de la persona. Podrás cambiarlos después, salvo los códigos.'
          }
        />
      )}

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <DialogShellBody flush>
          <DialogShellSection title="Identidad" icon={CreditCard}>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Los campos marcados con <span className="font-bold text-destructive">*</span> son
              obligatorios.
            </p>

            <FieldGrid>
              <Field id="role" label="Tipo de usuario" required>
                <Select value={values.role} onValueChange={(value) => changeRole(value as UserRole)}>
                  <SelectTrigger id="role" className={CONTROL_CLASS}>
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

              <Field id="status" label="Estado" error={errors.status} required>
                <Select
                  value={values.status}
                  onValueChange={(value) => setField('status', value as UserStatus)}
                >
                  <SelectTrigger id="status" className={CONTROL_CLASS}>
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
                required
                className="sm:col-span-2"
              >
                <Input
                  id="name"
                  value={values.name}
                  onChange={(event) => setField('name', event.target.value)}
                  placeholder="Ej: María Quispe Flores"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={CONTROL_CLASS}
                />
              </Field>

              <Field
                id="dni"
                label="DNI"
                error={errors.dni}
                required={!isEditing}
                hint={
                  isEditing
                    ? 'El DNI identifica al registro y no se puede modificar.'
                    : '8 dígitos, sin puntos ni guiones.'
                }
              >
                {isEditing ? (
                  <LockedInput id="dni" value={values.dni} />
                ) : (
                  <Input
                    id="dni"
                    value={values.dni}
                    onChange={(event) =>
                      setField('dni', event.target.value.replace(/\D/g, '').slice(0, 8))
                    }
                    inputMode="numeric"
                    placeholder="12345678"
                    aria-invalid={Boolean(errors.dni)}
                    aria-describedby={errors.dni ? 'dni-error' : undefined}
                    className={cn(CONTROL_CLASS, 'tabular-nums')}
                  />
                )}
              </Field>

              <Field id="gender" label="Género" required>
                <Select
                  value={values.gender}
                  onValueChange={(value) => setField('gender', value as 'M' | 'F')}
                >
                  <SelectTrigger id="gender" className={CONTROL_CLASS}>
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

              <Field
                id="birthDate"
                label="Fecha de nacimiento"
                error={errors.birthDate}
                required
                className={isStudent ? undefined : 'sm:col-span-2'}
              >
                <Input
                  id="birthDate"
                  type="date"
                  value={values.birthDate}
                  onChange={(event) => setField('birthDate', event.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  aria-invalid={Boolean(errors.birthDate)}
                  aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
                  className={CONTROL_CLASS}
                />
              </Field>

              {/* El código del estudiante lo asigna el SIAGIE: se ve junto al
                  resto de su identidad, pero no se escribe. */}
              {isStudent && isEditing && (
                <Field
                  id="modularCode"
                  label="Código del estudiante"
                  hint="Lo asigna el SIAGIE y no se puede modificar."
                >
                  <LockedInput id="modularCode" value={user.modularCode ?? 'Sin registrar'} />
                </Field>
              )}

              {isStudent && !isEditing && (
                <Field
                  id="modularCode"
                  label="Código del estudiante"
                  error={errors.modularCode}
                  hint="14 dígitos del SIAGIE. Opcional; después no podrá cambiarse."
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
                    className={cn(CONTROL_CLASS, 'tabular-nums')}
                  />
                </Field>
              )}
            </FieldGrid>
          </DialogShellSection>

          {/* Un alumno no tiene su propio apartado de Contacto: el teléfono y
              la dirección que importan son los de su apoderado, que vive en
              «Apoderados registrados». */}
          {!isStudent && (
            <DialogShellSection title="Contacto" icon={Phone}>
              <FieldGrid>
                <Field
                  id="email"
                  label="Correo electrónico"
                  error={errors.email}
                  hint="Opcional. Si lo escribes, debe tener un formato válido."
                >
                  <Input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={(event) => setField('email', event.target.value)}
                    placeholder="nombre.apellido@colegio.edu.pe"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={CONTROL_CLASS}
                  />
                </Field>

                <Field
                  id="phone"
                  label="Teléfono"
                  error={errors.phone}
                  required
                  hint="9 dígitos, empezando por 9. Es la vía de aviso al apoderado."
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
                    className={cn(CONTROL_CLASS, 'tabular-nums')}
                  />
                </Field>

                <Field id="address" label="Dirección" className="sm:col-span-2">
                  <Input
                    id="address"
                    value={values.address}
                    onChange={(event) => setField('address', event.target.value)}
                    placeholder="Av. Los Héroes 123"
                    className={CONTROL_CLASS}
                  />
                </Field>
              </FieldGrid>
            </DialogShellSection>
          )}

          {meta.hasClassroom && (
            <DialogShellSection
              title={isStudent ? 'Aula asignada' : 'Aula que tutela'}
              icon={GraduationCap}
            >
              <FieldGrid>
                <Field
                  id="level"
                  label="Nivel educativo"
                  error={errors.level}
                  required={isStudent}
                >
                  <Select value={values.level} onValueChange={changeLevel}>
                    <SelectTrigger id="level" className={CONTROL_CLASS}>
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
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
                  required={isStudent}
                  hint={values.level === NONE ? 'Elige primero el nivel.' : undefined}
                >
                  <Select
                    value={values.grade}
                    onValueChange={changeGrade}
                    disabled={values.level === NONE}
                  >
                    <SelectTrigger id="grade" className={CONTROL_CLASS}>
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
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
                  required={isStudent}
                  hint={values.grade === NONE ? 'Elige primero el grado.' : undefined}
                >
                  <Select
                    value={values.section}
                    onValueChange={(value) => setField('section', value)}
                    disabled={values.grade === NONE}
                  >
                    <SelectTrigger id="section" className={CONTROL_CLASS}>
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {sectionOptions.map((section) => (
                        <SelectItem key={section} value={section} className="h-10 text-base">
                          {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {values.role === 'Docente' && (
                  <Field id="subject" label="Curso que dicta">
                    <Input
                      id="subject"
                      value={values.subject}
                      onChange={(event) => setField('subject', event.target.value)}
                      placeholder="Ej: Matemática"
                      className={CONTROL_CLASS}
                    />
                  </Field>
                )}
              </FieldGrid>
            </DialogShellSection>
          )}

          {values.role === 'Administrativo' && (
            <DialogShellSection title="Puesto" icon={ShieldCheck}>
              <FieldGrid>
                <Field id="position" label="Cargo" className="sm:col-span-2">
                  <Select value={values.position} onValueChange={(value) => setField('position', value)}>
                    <SelectTrigger id="position" className={CONTROL_CLASS}>
                      <SelectValue placeholder="Selecciona un cargo" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {ADMINISTRATIVE_POSITIONS.map((position) => (
                        <SelectItem key={position} value={position} className="h-10 text-base">
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGrid>
            </DialogShellSection>
          )}

          {extraSections}
        </DialogShellBody>

        <DialogShellFooter>
          <DialogShellCancelButton onClick={onClose}>{cancelLabel}</DialogShellCancelButton>
          <Button type="submit" className={DIALOG_ACTION_CLASS}>
            {submitLabel ?? (isEditing ? 'Guardar cambios' : 'Crear usuario')}
          </Button>
        </DialogShellFooter>
      </form>
    </>
  );
};

export const UserFormDialog: React.FC<UserFormDialogProps> = ({ open, onClose, ...rest }) => (
  <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
    <DialogShellContent>
      <UserFormBody onClose={onClose} {...rest} />
    </DialogShellContent>
  </Dialog>
);
