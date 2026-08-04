import type { LucideIcon } from 'lucide-react';
import type { ClassroomRef, UserItem } from '@/types';

/** Tipos del módulo de aulas. */

/** Re-exportado desde `@/types`: vive ahí porque `Session` también lo necesita. */
export type { ClassroomRef };

/**
 * Única fuente de verdad de "qué se ve" en el módulo Aulas — sustituye a las
 * 4 banderas booleanas + `selectedClassroom`/`selectedStudent` dispersos que
 * tenía `ClassroomsModule` antes de este rework. Cada variante identifica una
 * pantalla completa (qué sidebar y qué panel principal corresponden), en vez
 * de dejar que se combinen de formas inválidas.
 *
 * Aulas navega en un solo sentido — Nivel → Grado → Sección → Alumnos → Perfil.
 * Citar a un apoderado vive en el módulo Citaciones; los reportes, en el
 * módulo Reportes. Ninguno de los dos se abre desde aquí.
 */
export type ClassroomsView =
  | { kind: 'browse' }
  | { kind: 'section-overview'; classroom: ClassroomRef }
  | { kind: 'student-detail'; classroom: ClassroomRef; student: UserItem };

/** Día del calendario de asistencia mensual de `StudentDetail`. */
export interface AttendanceCalendarDay {
  date: string;
  dayNumber: number;
  isWeekend: boolean;
  status: string;
  color: string;
  originalStatus: string;
}

/**
 * Entrada de la lista de incidencias personales de un estudiante
 * (incidencias registradas + inasistencias/tardanzas convertidas en
 * incidencia) que muestra `StudentDetail`.
 */
export interface PersonalIncidentEntry {
  id: string;
  date: string;
  time: string;
  teacher: string | null;
  type: {
    id?: string;
    label: string;
    category: string;
    icon: LucideIcon;
    color: string;
  };
  description: string;
}
