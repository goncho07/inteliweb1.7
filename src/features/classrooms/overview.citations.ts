import { INITIAL_CITATIONS, parseCitationDate } from '@/features/citations/citations.constants';
import type { Citation } from '@/features/citations/types';

import { extractGradeNumeral } from './overview.format';
import type { ClassroomRef } from './types';

/**
 * Pestaña Citaciones de la Vista General del Aula: lectura de los mismos
 * datos que gestiona el módulo Citaciones (`citations.constants.ts`),
 * filtrados por aula y periodo. Las citaciones se crean y gestionan solo en
 * su módulo — aquí únicamente se reportan.
 */

const GRADE_SECTION_RE = /(\d+°)\s+([A-Z])/;

/** `Citation.grade` viene como "1° A" (numeral + sección); compara contra el aula del panel. */
export const citationMatchesAula = (citation: Citation, classroom: ClassroomRef): boolean => {
  if (citation.level !== classroom.level) return false;
  const match = citation.grade.match(GRADE_SECTION_RE);
  if (!match) return false;
  const [, numeral, section] = match;
  if (numeral !== extractGradeNumeral(classroom.grade)) return false;
  if (section !== classroom.section) return false;
  return true;
};

/** Citaciones del aula seleccionada dentro del rango de fechas del periodo activo, más recientes primero. */
export const getCitationsForAula = (classroom: ClassroomRef, start: Date, end: Date): Citation[] =>
  INITIAL_CITATIONS.filter((c) => {
    if (!citationMatchesAula(c, classroom)) return false;
    const date = parseCitationDate(c.date);
    return date >= start && date <= end;
  }).sort((a, b) => parseCitationDate(b.date).getTime() - parseCitationDate(a.date).getTime());
