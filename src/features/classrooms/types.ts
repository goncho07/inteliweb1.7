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
