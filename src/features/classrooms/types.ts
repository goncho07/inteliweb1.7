import type { LucideIcon } from 'lucide-react';

/** Tipos del módulo de aulas. */

export type CitationStatus =
  | "pending"
  | "waiting"
  | "confirmed_by_parent"
  | "closed"
  // Usado por el filtro "Rechazadas" de los paneles de incidencias y citaciones.
  | "rejected";

export interface CitationItem {
  id: string;
  name: string;
  studentId?: string;
  avatarLetter: string;
  avatarColor: string;
  reason: string;
  theme: "yellow" | "orange" | "red" | "blue";
  status: CitationStatus;
  scheduledDate?: string;
  incidents?: { type: string; date: string; time: string; teacher: string }[];
}

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
  signatureStatus: string;
  signatureDate?: string;
  signatureIp?: string;
  /** Sólo presente en algunas simulaciones de notificación por WhatsApp. */
  registrar?: string;
}
