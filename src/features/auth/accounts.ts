import { MOCK_USERS } from '@/data/users';
import type { AppRole, UserItem } from '@/types';

import { ROLE_LABEL } from './session';

/** Busca una cuenta con acceso al sistema por DNI. `undefined` si no existe o es un estudiante (sin `appRole`). */
export const findAccountByDni = (dni: string): UserItem | undefined =>
  MOCK_USERS.find((u) => u.dni === dni.trim() && !!u.appRole);

/** Busca cualquier persona del padrón por DNI, tenga o no acceso al sistema — para distinguir "DNI no encontrado" de "sin acceso". */
export const findAnyUserByDni = (dni: string): UserItem | undefined =>
  MOCK_USERS.find((u) => u.dni === dni.trim());

/** Busca un apoderado por DNI, para el paso 1 del flujo "Vista Apoderado". */
export const findGuardianByDni = (dni: string): UserItem | undefined =>
  MOCK_USERS.find((u) => u.appRole === 'apoderado' && u.dni === dni.trim());

/** Roles de personal con login por DNI+clave (el apoderado usa el flujo aparte "Vista Apoderado"). */
type StaffRole = Exclude<AppRole, 'apoderado'>;

export interface DemoAccount {
  role: StaffRole;
  label: string;
  user: UserItem;
}

/**
 * Un DNI de ejemplo por rol de personal (Directivo/Docente/Auxiliar), para
 * el bloque "Cuentas de demostración" del login: los DNI de `MOCK_USERS` son
 * de 8 dígitos sembrados, nadie podría adivinarlos.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = (['directivo', 'docente', 'auxiliar'] as const satisfies StaffRole[])
  .map((role) => {
    const user = MOCK_USERS.find((u) => u.appRole === role);
    return user ? { role, label: ROLE_LABEL[role], user } : null;
  })
  .filter((entry): entry is DemoAccount => !!entry);

/** Apoderado de ejemplo con al menos un hijo vinculado, para el flujo "Vista Apoderado". */
export const DEMO_GUARDIAN = MOCK_USERS.find(
  (u) => u.appRole === 'apoderado' && (u.childrenIds?.length ?? 0) > 0,
);
