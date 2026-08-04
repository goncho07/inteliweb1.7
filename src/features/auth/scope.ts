import { EDUCATIONAL_STRUCTURE } from '@/data/education';
import { MOCK_USERS } from '@/data/users';
import { citationMatchesAula } from '@/features/classrooms/overview.citations';
import type { Citation } from '@/features/citations/types';
import type { ClassroomRef, UserItem } from '@/types';

import type { Session } from './session';

/**
 * Único sitio que decide "qué se ve" para una sesión — los módulos (Aulas,
 * Citaciones, Inicio) consultan estas funciones en vez de repetir un
 * `if (role === …)` cada uno por su cuenta.
 */

const sameClassroom = (a: ClassroomRef, b: ClassroomRef): boolean =>
  a.level === b.level && a.grade === b.grade && a.section === b.section;

/** ¿Esta sesión puede ver esta aula? `classrooms === null` = ve todas (directivo / auxiliar). */
export const canSeeClassroom = (session: Session, classroom: ClassroomRef): boolean =>
  session.classrooms === null || session.classrooms.some((c) => sameClassroom(c, classroom));

/**
 * Árbol nivel → grado → secciones visible para la sesión, mismo shape que
 * `EDUCATIONAL_STRUCTURE`. Para directivo/auxiliar es el árbol completo
 * (idéntico a hoy); para un docente, solo sus aulas.
 */
export const visibleClassroomTree = (session: Session): Record<string, Record<string, string[]>> => {
  if (session.classrooms === null) return EDUCATIONAL_STRUCTURE;

  const tree: Record<string, Record<string, string[]>> = {};
  session.classrooms.forEach(({ level, grade, section }) => {
    tree[level] ??= {};
    tree[level][grade] ??= [];
    if (!tree[level][grade].includes(section)) tree[level][grade].push(section);
  });
  return tree;
};

/** Citaciones visibles: todas para directivo/auxiliar, solo las de sus aulas para un docente. */
export const visibleCitations = (session: Session, citations: Citation[]): Citation[] => {
  if (session.classrooms === null) return citations;
  const classrooms = session.classrooms;
  return citations.filter((citation) => classrooms.some((classroom) => citationMatchesAula(citation, classroom)));
};

/** Alumnos visibles: los de sus aulas para directivo/docente/auxiliar, sus hijos para el apoderado. */
export const visibleStudents = (session: Session): UserItem[] => {
  if (session.role === 'apoderado') return session.children;
  if (session.classrooms === null) return MOCK_USERS.filter((u) => u.role === 'Estudiante');

  const classrooms = session.classrooms;
  return MOCK_USERS.filter(
    (u) =>
      u.role === 'Estudiante' &&
      classrooms.some((c) => c.level === u.level && c.grade === u.grade && c.section === u.section),
  );
};
