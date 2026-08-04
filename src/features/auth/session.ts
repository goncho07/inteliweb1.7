import { MOCK_USERS } from '@/data/users';
import type { AppRole, ClassroomRef, UserItem } from '@/types';

/**
 * Quién entró y qué puede ver. Se construye una sola vez al iniciar sesión
 * (`buildSession`) y de ahí se derivan los tres módulos con alcance
 * (Aulas, Citaciones, Inicio) — ninguno vuelve a preguntar "¿qué rol es este?".
 */
export interface Session {
  role: AppRole;
  user: UserItem;
  /** Aulas visibles para esta sesión. `null` = todas (directivo / auxiliar). */
  classrooms: ClassroomRef[] | null;
  /** Hijos del apoderado, ya resueltos desde `MOCK_USERS`. Vacío para el resto de roles. */
  children: UserItem[];
}

export const ROLE_LABEL: Record<AppRole, string> = {
  directivo: 'Directivo',
  docente: 'Docente',
  auxiliar: 'Auxiliar',
  apoderado: 'Apoderado',
};

/** Construye la sesión a partir de la cuenta que inició sesión (ver `findAccountByDni`). */
export const buildSession = (user: UserItem): Session => {
  const role = user.appRole;
  if (!role) {
    throw new Error(`El usuario ${user.id} no tiene acceso al sistema (sin appRole).`);
  }

  const children =
    role === 'apoderado'
      ? (user.childrenIds ?? [])
          .map((id) => MOCK_USERS.find((u) => u.id === id))
          .filter((child): child is UserItem => !!child)
      : [];

  return {
    role,
    user,
    classrooms: role === 'docente' ? (user.classrooms ?? []) : null,
    children,
  };
};
