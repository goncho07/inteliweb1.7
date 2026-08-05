import { EDUCATIONAL_STRUCTURE } from '@/data/education';
import { STATUS_BY_ROLE } from '@/features/users/users.constants';
import type { UserItem, UserRole, UserStatus } from '@/types';

/**
 * Formulario de usuario: forma, conversión desde/hacia `UserItem` y
 * validación. Vive fuera del componente para que crear, editar e importar
 * usen exactamente las mismas reglas — antes cada pantalla decidía por su
 * cuenta qué era un DNI válido (o no lo comprobaba en absoluto).
 */

export interface UserFormValues {
  name: string;
  dni: string;
  role: UserRole;
  gender: 'M' | 'F';
  status: UserStatus;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  level: string;
  grade: string;
  section: string;
  /** Solo Estudiante. */
  modularCode: string;
  /** Solo Docente. */
  subject: string;
  /** Solo Administrativo. */
  position: string;
}

export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;

/** Valor vacío del selector de aula: el campo existe pero no se ha elegido nada. */
export const NONE = 'sin-asignar';

export const emptyUserForm = (role: UserRole): UserFormValues => ({
  name: '',
  dni: '',
  role,
  gender: 'M',
  status: STATUS_BY_ROLE[role][0],
  email: '',
  phone: '',
  address: '',
  birthDate: '',
  level: NONE,
  grade: NONE,
  section: NONE,
  modularCode: '',
  subject: '',
  position: '',
});

export const userToForm = (user: UserItem): UserFormValues => ({
  name: user.name,
  dni: user.dni,
  role: user.role,
  gender: user.gender,
  status: user.status,
  email: user.email,
  phone: user.phone ?? '',
  address: user.address ?? '',
  birthDate: user.birthDate ?? '',
  level: user.level ?? NONE,
  grade: user.grade ?? NONE,
  section: user.section ?? NONE,
  modularCode: user.modularCode ?? '',
  subject: user.subject ?? '',
  position: user.position ?? '',
});

const orUndefined = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed === '' || trimmed === NONE ? undefined : trimmed;
};

/**
 * Vuelca el formulario sobre el usuario. `base` conserva lo que el formulario
 * no toca (vínculos de familia, aulas del docente, `id`, color de avatar).
 */
export const formToUser = (values: UserFormValues, base: UserItem): UserItem => {
  const hasClassroom = values.role === 'Estudiante' || values.role === 'Docente';
  return {
    ...base,
    name: values.name.trim(),
    // El DNI es la identidad del registro: se fija al crear y nunca se edita.
    dni: base.dni || values.dni.trim(),
    role: values.role,
    gender: values.gender,
    status: values.status,
    email: values.email.trim(),
    phone: orUndefined(values.phone),
    address: orUndefined(values.address),
    birthDate: orUndefined(values.birthDate),
    level: hasClassroom ? (orUndefined(values.level) as UserItem['level']) : undefined,
    grade: hasClassroom ? orUndefined(values.grade) : undefined,
    section: hasClassroom ? orUndefined(values.section) : undefined,
    modularCode: values.role === 'Estudiante' ? orUndefined(values.modularCode) : undefined,
    subject: values.role === 'Docente' ? orUndefined(values.subject) : undefined,
    position: values.role === 'Administrativo' ? orUndefined(values.position) : undefined,
  };
};

export const isValidDni = (dni: string): boolean => /^\d{8}$/.test(dni.trim());

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

export const isValidPhone = (phone: string): boolean => /^9\d{8}$/.test(phone.trim());

/** Grados disponibles para un nivel; vacío si el nivel no está elegido. */
export const gradesForLevel = (level: string): string[] =>
  level === NONE || !EDUCATIONAL_STRUCTURE[level] ? [] : Object.keys(EDUCATIONAL_STRUCTURE[level]);

/** Secciones disponibles para un nivel y grado; vacío si falta alguno. */
export const sectionsForGrade = (level: string, grade: string): string[] =>
  level === NONE || grade === NONE ? [] : (EDUCATIONAL_STRUCTURE[level]?.[grade] ?? []);

/**
 * Valida el formulario completo. `existingDnis` son los DNI ya registrados
 * (sin contar el del usuario que se está editando) para impedir duplicados.
 */
export const validateUserForm = (
  values: UserFormValues,
  options: { existingDnis: Set<string>; isEditing: boolean },
): UserFormErrors => {
  const errors: UserFormErrors = {};

  if (values.name.trim().length < 3) {
    errors.name = 'Escribe el nombre y los apellidos completos.';
  }

  if (!options.isEditing) {
    if (!isValidDni(values.dni)) {
      errors.dni = 'El DNI debe tener exactamente 8 dígitos.';
    } else if (options.existingDnis.has(values.dni.trim())) {
      errors.dni = 'Ya existe un usuario registrado con este DNI.';
    }
  }

  if (!isValidEmail(values.email)) {
    errors.email = 'Escribe un correo válido, por ejemplo nombre@colegio.edu.pe';
  }

  if (values.phone.trim() !== '' && !isValidPhone(values.phone)) {
    errors.phone = 'El teléfono debe tener 9 dígitos y empezar por 9.';
  }

  if (values.birthDate !== '' && values.birthDate > new Date().toISOString().slice(0, 10)) {
    errors.birthDate = 'La fecha de nacimiento no puede ser posterior a hoy.';
  }

  if (!STATUS_BY_ROLE[values.role].includes(values.status)) {
    errors.status = 'Elige un estado válido para este tipo de usuario.';
  }

  if (values.role === 'Estudiante') {
    if (values.level === NONE) {
      errors.level = 'Un estudiante necesita un nivel asignado.';
    } else if (values.grade === NONE) {
      errors.grade = 'Elige el grado del estudiante.';
    } else if (values.section === NONE) {
      errors.section = 'Elige la sección del estudiante.';
    }
    if (values.modularCode.trim() !== '' && !/^\d{14}$/.test(values.modularCode.trim())) {
      errors.modularCode = 'El código modular tiene 14 dígitos.';
    }
  }

  if (values.role === 'Docente' && values.grade !== NONE && values.level === NONE) {
    errors.level = 'Elige primero el nivel.';
  }

  return errors;
};
