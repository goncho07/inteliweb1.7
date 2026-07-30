/** Tipos compartidos del módulo de reportes de asistencia. */

export interface ReportHistoryItem {
  id: number;
  type: string;
  title: string;
  date: string;
  level: string;
  grade: string;
  section: string;
  size: string;
  progress: number;
  status?: 'generated' | 'pending';
  targetDate?: Date;
}
