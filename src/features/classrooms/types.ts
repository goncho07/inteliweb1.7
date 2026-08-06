import type { LucideIcon } from 'lucide-react';
import type { ClassroomRef, IncidentType, UserItem } from '@/types';

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

/** Estados posibles de un día en el calendario de asistencia del estudiante. */
export type AttendanceStatus = 'Presente' | 'Tardanza' | 'Falta' | 'Justificada' | 'Sin registro';

/**
 * Día del calendario de asistencia mensual de `StudentDetail`.
 *
 * El día guarda su *estado*, nunca las clases con las que se pinta: el color
 * lo decide la vista a partir de `ATTENDANCE_STATUS_STYLES`
 * (`student-detail.attendance.ts`), igual que hace la Vista General del Aula.
 */
export interface AttendanceCalendarDay {
  /** Fecha ISO "YYYY-MM-DD" — la clave con la que se guarda una justificación. */
  date: string;
  dayNumber: number;
  isWeekend: boolean;
  /** Lo que se ve: `Justificada` cuando la falta o tardanza ya se justificó. */
  status: AttendanceStatus;
  /** Lo que registró el sistema de asistencia, antes de justificar nada. */
  originalStatus: AttendanceStatus;
  /** Observación con la que se justificó, si se justificó. */
  justification?: string;
}

/** Un día es justificable si hay algo que justificar y todavía no se hizo. */
export const isJustifiable = (day: AttendanceCalendarDay): boolean =>
  !day.isWeekend &&
  day.status !== 'Justificada' &&
  (day.originalStatus === 'Falta' || day.originalStatus === 'Tardanza');

/**
 * Intención de color de una entrada del historial. Semántica, no clases: la
 * vista la traduce a Tailwind (`INCIDENT_TONE_STYLES`) para que la tarjeta y
 * la ventana de notificaciones pinten igual la misma entrada.
 */
export type IncidentTone = 'neutral' | 'warning' | 'danger' | 'info';

/**
 * Entrada de la lista de incidencias personales de un estudiante
 * (incidencias registradas + inasistencias/tardanzas convertidas en
 * incidencia) que muestra `StudentDetail`.
 */
export interface PersonalIncidentEntry {
  id: string;
  /** Fecha ISO "YYYY-MM-DD": solo para ordenar, nunca se muestra tal cual. */
  date: string;
  /** Fecha ya legible, "DD/MM/YYYY" — el mismo formato que en Citaciones. */
  dateLabel: string;
  time: string;
  /** Docente que registró la incidencia, ya en formato corto "Prof. Apellido Nombre". */
  teacher: string | null;
  label: string;
  category: IncidentType['category'];
  icon: LucideIcon;
  tone: IncidentTone;
  description: string;
}
