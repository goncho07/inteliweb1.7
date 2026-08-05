import { useCallback, useMemo, useState } from 'react';

import { MOCK_USERS } from '@/data/users';
import { ROLE_ORDER } from '@/features/users/users.constants';
import { formToUser, type UserFormValues } from '@/features/users/users.form';
import type { UserItem, UserRole } from '@/types';

/**
 * Padrón de usuarios en memoria: la única fuente de verdad del módulo.
 *
 * `MOCK_USERS` es una constante de módulo, así que la pantalla anterior no
 * podía crear, editar ni borrar nada — leía siempre la misma lista. Aquí se
 * copia a estado local para que las cuatro operaciones sean reales dentro de
 * la sesión. No hay persistencia (el encargo es solo frontend): al recargar,
 * vuelve el padrón simulado.
 */

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-cyan-600',
  'bg-teal-600',
  'bg-pink-500',
  'bg-slate-500',
];

export interface UsersDirectory {
  users: UserItem[];
  /** Cuántos usuarios hay de cada rol, recalculado tras cada alta o baja. */
  countsByRole: Record<UserRole, number>;
  /** DNI ya ocupados, para impedir duplicados al crear o importar. */
  existingDnis: Set<string>;
  createUser: (values: UserFormValues) => UserItem;
  updateUser: (id: string, values: UserFormValues) => void;
  deleteUsers: (ids: string[]) => void;
  importUsers: (rows: UserFormValues[]) => void;
}

export const useUsersDirectory = (): UsersDirectory => {
  const [users, setUsers] = useState<UserItem[]>(() => MOCK_USERS);

  /** Contador de ids nuevos, por encima del mayor id del padrón simulado. */
  const [nextId, setNextId] = useState<number>(
    () => MOCK_USERS.reduce((max, user) => Math.max(max, Number(user.id) || 0), 0) + 1,
  );

  const countsByRole = useMemo(() => {
    const counts = Object.fromEntries(ROLE_ORDER.map((role) => [role, 0])) as Record<
      UserRole,
      number
    >;
    users.forEach((user) => {
      counts[user.role] += 1;
    });
    return counts;
  }, [users]);

  const existingDnis = useMemo(() => new Set(users.map((user) => user.dni)), [users]);

  /** Esqueleto de usuario nuevo: lo que el formulario no pregunta pero el tipo exige. */
  const buildBase = useCallback(
    (id: number, role: UserRole): UserItem => ({
      id: id.toString(),
      code: role === 'Estudiante' ? `EST20261000${1000 + id}` : undefined,
      name: '',
      dni: '',
      role,
      gender: 'M',
      status: 'Activo',
      avatarColor: AVATAR_COLORS[id % AVATAR_COLORS.length],
      email: '',
      appRole:
        role === 'Docente'
          ? 'docente'
          : role === 'Apoderado'
            ? 'apoderado'
            : role === 'Administrativo'
              ? 'auxiliar'
              : undefined,
    }),
    [],
  );

  const createUser = useCallback(
    (values: UserFormValues): UserItem => {
      const created = formToUser(values, buildBase(nextId, values.role));
      setUsers((previous) => [created, ...previous]);
      setNextId((previous) => previous + 1);
      return created;
    },
    [buildBase, nextId],
  );

  const updateUser = useCallback((id: string, values: UserFormValues) => {
    setUsers((previous) =>
      previous.map((user) => (user.id === id ? formToUser(values, user) : user)),
    );
  }, []);

  /**
   * Da de baja a los usuarios indicados y limpia los vínculos que apuntaban a
   * ellos: si se borra un apoderado, deja de figurar en la ficha de su hijo.
   */
  const deleteUsers = useCallback((ids: string[]) => {
    const removed = new Set(ids);
    setUsers((previous) =>
      previous
        .filter((user) => !removed.has(user.id))
        .map((user) => {
          const guardianIds = user.guardianIds?.filter((guardianId) => !removed.has(guardianId));
          const childrenIds = user.childrenIds?.filter((childId) => !removed.has(childId));
          if (
            guardianIds?.length === user.guardianIds?.length &&
            childrenIds?.length === user.childrenIds?.length
          ) {
            return user;
          }
          return { ...user, guardianIds, childrenIds };
        }),
    );
  }, []);

  const importUsers = useCallback(
    (rows: UserFormValues[]) => {
      const created = rows.map((values, index) =>
        formToUser(values, buildBase(nextId + index, values.role)),
      );
      setUsers((previous) => [...created, ...previous]);
      setNextId((previous) => previous + rows.length);
    },
    [buildBase, nextId],
  );

  return { users, countsByRole, existingDnis, createUser, updateUser, deleteUsers, importUsers };
};
