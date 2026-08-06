import type { ClassroomRef } from './types';

/**
 * Formato del aula y del nombre de alumno usados por la Vista General del
 * Aula (asistencia/incidencias/citaciones) — antes vivía en el módulo
 * Reportes, ahora es parte de Aulas.
 */

/** Numeral corto de un grado ("1° Grado" → "1°"), para comparar contra `Citation.grade` ("1° A"). */
export const extractGradeNumeral = (grade: string): string | null => grade.match(/(\d+°)/)?.[1] ?? null;

/** Etiqueta corta de un aula, ej. "1° A". */
export const getClassroomLabel = (classroom: ClassroomRef): string => {
  const numeral = extractGradeNumeral(classroom.grade) ?? classroom.grade;
  return `${numeral} ${classroom.section}`;
};

/**
 * Formatea "Nombre Apellido1 Apellido2" (formato de `MOCK_USERS`) como
 * "Apellido1 Apellido2, Nombre" — el formato de un registro de asistencia
 * real. El primer token siempre es el nombre de pila (ver `data/users.ts`).
 */
export const formatStudentDisplayName = (name: string): string => {
  const [firstName, ...lastNames] = name.split(' ');
  if (lastNames.length === 0) return firstName;
  return `${lastNames.join(' ')}, ${firstName}`;
};

/**
 * Formatea "Nombre Apellido1 Apellido2" como "Apellido1 Nombre" — solo el
 * primer apellido, para etiquetas cortas donde no cabe el nombre completo del
 * docente (ej. el historial de incidencias del perfil del alumno).
 */
export const formatShortPersonName = (name: string): string => {
  const [firstName, firstLastName] = name.split(' ');
  if (!firstLastName) return firstName;
  return `${firstLastName} ${firstName}`;
};
