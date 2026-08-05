import type { AppRole } from '@/types';

/** Formateo de los campos de usuario que se muestran en la ficha de detalle. */

/** `AAAA-MM-DD` → `DD/MM/AAAA`. Devuelve `null` si no hay fecha. */
export const formatBirthDate = (isoDate?: string): string | null => {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

/** Edad cumplida a día de hoy, o `null` si no hay fecha de nacimiento. */
export const calculateAge = (isoDate?: string): number | null => {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const birth = new Date(`${isoDate}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
};

/** Qué ve la persona al entrar al sistema, en lenguaje del colegio. */
export const APP_ROLE_LABEL: Record<AppRole, string> = {
  directivo: 'Dirección — acceso completo',
  docente: 'Docente — sus aulas',
  auxiliar: 'Auxiliar — asistencia e incidencias',
  apoderado: 'Apoderado — sus hijos',
};

export const formatGender = (gender: 'M' | 'F'): string =>
  gender === 'M' ? 'Masculino' : 'Femenino';

export const formatPhone = (phone?: string): string | null => (phone ? `+51 ${phone}` : null);
