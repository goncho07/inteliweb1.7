import { BookOpen, Briefcase, Tag, Users, type LucideIcon } from 'lucide-react';

import { pseudoRandom } from '@/lib/pseudoRandom';

import type { Citation, CitationCategory, CitationStatus, TimelineStep } from './types';

/**
 * Convierte una fecha de citación ('DD/MM/YYYY', el único formato usado en
 * este módulo) a `Date`, para ubicarla en la cuadrícula del calendario.
 */
export const parseCitationDate = (value: string): Date => {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Combina `citation.date` ('DD/MM/YYYY') y `citation.time` ('hh:mm AM/PM')
 * en un solo `Date`, para formatear la fecha de la fila de la lista de forma
 * relativa ('Hoy', 'Ayer', '08 abr'…).
 */
export const parseCitationDateTime = (citation: Pick<Citation, 'date' | 'time'>): Date => {
  const day = parseCitationDate(citation.date);
  const match = citation.time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return day;

  const [, hourStr, minuteStr, meridiem] = match;
  let hour = Number(hourStr) % 12;
  if (meridiem.toUpperCase() === 'PM') hour += 12;

  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, Number(minuteStr));
};

/** Datos simulados del módulo de Citaciones. Sin persistencia ni backend. */
export const INITIAL_CITATIONS: Citation[] = [
  { id: 1, student: 'Valentina Sol', parent: 'Roberto Sol', relationship: 'Padre', parentPhone: '+51 987 654 321', grade: '1° A', level: 'Secundaria', reason: 'Bajo rendimiento en Matemáticas', description: 'La alumna presenta dificultades continuas con las ecuaciones de primer grado y no completa las tareas en casa.', category: 'Académico', date: '06/04/2026', time: '08:00 AM', status: 'Pendiente', teacher: 'Luis Gomez', subject: 'Matemática' },
  { id: 2, student: 'Mateo Rojas', parent: 'Elena Rojas', relationship: 'Madre', parentPhone: '+51 912 345 678', grade: '2° A', level: 'Secundaria', reason: 'Entrega de libreta', description: 'Reunión presencial para la entrega de notas del primer bimestre general.', category: 'Académico', date: '06/04/2026', time: '08:45 AM', status: 'Confirmada', teacher: 'María Suarez', subject: 'Tutoría' },
  { id: 3, student: 'Lucas Vega', parent: 'María Vega', relationship: 'Madre', parentPhone: '+51 998 765 432', grade: '3° B', level: 'Secundaria', reason: 'Problemas de conducta continuos', description: 'Mucha distracción en clase y actitud desafiante al recibir indicaciones.', category: 'Incidencias', date: '07/04/2026', time: '08:00 AM', status: 'Pendiente', teacher: 'Carlos Mendoza', subject: 'DPCC' },
  { id: 4, student: 'Camila Paz', parent: 'Andrés Paz', relationship: 'Padre', parentPhone: '+51 945 123 890', grade: '4° B', level: 'Secundaria', reason: 'Mejora reportada en su desempeño', description: 'Citación para felicitar el progreso de la estudiante y establecer metas para el próximo trimestre.', category: 'Académico', date: '08/04/2026', time: '09:30 AM', status: 'Pendiente', teacher: 'Ana Lopez', subject: 'Comunicación' },
  { id: 5, student: 'Luciana Delgado', parent: 'Ana Ramos', relationship: 'Madre', parentPhone: '+51 923 456 781', grade: '3° A', level: 'Primaria', reason: 'Faltas injustificadas', description: 'Se necesita justificación de las inasistencias de la última semana de marzo.', category: 'Otros', date: '09/04/2026', time: '11:15 AM', status: 'Cancelada', teacher: 'Carla Ruiz', subject: 'Tutoría' },
  { id: 6, student: 'Nicolas Salas', parent: 'Victor Salas', relationship: 'Padre', parentPhone: '+51 976 543 210', grade: '4° B', level: 'Secundaria', reason: 'Matrícula condicional', description: 'Explicación de las condiciones de matrícula para el presente año escolar.', category: 'Gestión', date: '10/04/2026', time: '09:30 AM', status: 'Confirmada', teacher: 'Roberto Carlos', subject: 'Dirección' },
  { id: 7, student: 'Valeria Quispe', parent: 'Jorge Quispe', relationship: 'Padre', parentPhone: '+51 934 567 129', grade: '3° C', level: 'Primaria', reason: 'Problemas de Integración', description: 'Dificultad para trabajar en equipo y aislamiento en los recesos.', category: 'Otros', date: '10/04/2026', time: '12:00 PM', status: 'Completada', teacher: 'Miguel Santos', subject: 'Psicología' },
  { id: 8, student: 'Valery Mamani', parent: 'Martha Campos', relationship: 'Madre', parentPhone: '+51 967 891 234', grade: '3° A', level: 'Secundaria', reason: 'Acumulación de incidencias', description: 'Varias incidencias reportadas en el sistema que requieren atención inmediata.', category: 'Incidencias', date: '06/04/2026', time: '11:15 AM', status: 'Pendiente', incidents: [{ type: 'Evasión de clase de matemáticas (Reincidencia)', date: '04/04/2026' }, { type: 'Uso de celular en horario no permitido', date: '01/04/2026' }], teacher: 'Carlos Mendoza', subject: 'DPCC' },
  { id: 9, student: 'Juan Pérez', parent: 'Ana L.', relationship: 'Madre', parentPhone: '+51 956 234 187', grade: '3° C', level: 'Primaria', reason: 'Agresión en aula', description: 'Altercado físico durante la clase de educación física. Se requiere asistencia obligatoria.', category: 'Incidencias', date: '07/04/2026', time: '08:45 AM', status: 'Confirmada', incidents: [{ type: 'Golpe a compañero durante clase', date: '07/04/2026' }], teacher: 'José Pinto', subject: 'Educación Física' },
  { id: 10, student: 'Luis Silva', parent: 'Alberto Silva', relationship: 'Padre', parentPhone: '+51 989 012 345', grade: '4° A', level: 'Secundaria', reason: 'Apoyo en Lenguaje', description: 'Bajo rendimiento en comprensión lectora. Coordinación para reforzamiento.', category: 'Académico', date: '08/04/2026', time: '10:15 AM', status: 'Completada', teacher: 'Ana Lopez', subject: 'Comunicación' },
  { id: 11, student: 'Sofia Luna', parent: 'Andres Luna', relationship: 'Padre', parentPhone: '+51 917 654 023', grade: '5° D', level: 'Secundaria', reason: 'Bullying a compañero', description: 'Ciberbullying reportado con pruebas, aplicación del reglamento interno.', category: 'Incidencias', date: '09/04/2026', time: '11:15 AM', status: 'Confirmada', incidents: [{ type: 'Ciberbullying reportado por tutores', date: '10/03/2026' }], teacher: 'Carlos Mendoza', subject: 'DPCC' },
  { id: 12, student: 'Diego Castro', parent: 'Juan Castro', relationship: 'Padre', parentPhone: '+51 943 210 987', grade: '5° C', level: 'Secundaria', reason: 'Reunión de coordinación', description: 'Revisión de actividades extracurriculares del alumno.', category: 'Otros', date: '10/04/2026', time: '13:15 PM', status: 'Pendiente', teacher: 'Roberto Carlos', subject: 'Dirección' },
  { id: 13, student: 'Ximena Torres', parent: 'Diana Torres', relationship: 'Madre', parentPhone: '+51 928 765 401', grade: '1° B', level: 'Secundaria', reason: 'Falta de respeto', description: 'Incidente de indisciplina en el que se faltó el respeto al docente dictando clases.', category: 'Incidencias', date: '06/04/2026', time: '16:00 PM', status: 'Cancelada', incidents: [{ type: 'Falta de respeto a autoridad', date: '22/03/2026' }], teacher: 'Luis Gomez', subject: 'Matemática' },
  { id: 14, student: 'Fernando Arce', parent: 'Gloria Arce', relationship: 'Madre', parentPhone: '+51 962 187 345', grade: '2° D', level: 'Secundaria', reason: 'Falsificación de firma', description: 'El alumno intentó asentar una calificación baja con firma falsa.', category: 'Incidencias', date: '08/04/2026', time: '13:15 PM', status: 'Pendiente', incidents: [{ type: 'Firma falsificada en examen', date: '20/04/2026' }], teacher: 'Ana Lopez', subject: 'Comunicación' },
  { id: 15, student: 'Sebastián Reyes', parent: 'Mónica Reyes', relationship: 'Madre', parentPhone: '+51 971 456 890', grade: '3° C', level: 'Secundaria', reason: 'Reforzamiento de inglés', description: 'Se agendó tutoría individual para lograr las competencias del área de inglés.', category: 'Académico', date: '10/04/2026', time: '15:30 PM', status: 'Completada', teacher: 'Diana Smith', subject: 'Inglés' },
  { id: 16, student: 'Ariana Vega', parent: 'Esteban Vega', relationship: 'Padre', parentPhone: '+51 936 789 012', grade: '3° A', level: 'Secundaria', reason: 'Uso de celular', description: 'Por tercera vez se le retuvo el celular en horas de clase de DPCC.', category: 'Incidencias', date: '07/04/2026', time: '09:30 AM', status: 'Reprogramada', incidents: [{ type: 'Uso de celular (Reincidencia 3)', date: '27/04/2026' }], teacher: 'Carlos Mendoza', subject: 'DPCC' },
];

/** Pestañas del filtro de estado en la lista de citaciones. */
export const STATUS_TABS: { label: string; value: CitationStatus | 'Todas' }[] = [
  { label: 'Todas', value: 'Todas' },
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'Confirmada', value: 'Confirmada' },
  { label: 'Reprogramada', value: 'Reprogramada' },
  { label: 'Completada', value: 'Completada' },
  { label: 'Cancelada', value: 'Cancelada' },
];

export const LEVEL_OPTIONS = ['Primaria', 'Secundaria'] as const;
export const GRADE_OPTIONS = ['1°', '2°', '3°', '4°', '5°', '6°'] as const;
export const SECTION_OPTIONS = ['A', 'B', 'C', 'D'] as const;
export const CATEGORY_OPTIONS = ['Académico', 'Incidencias', 'Gestión', 'Otros'] as const;

/**
 * Clases de color por estado, coherentes en toda la app y alineadas al mapeo
 * semántico de `DESIGN_SYSTEM.md` § A4: `amber` = atención/advertencia
 * (pendiente, aún sin confirmar), `emerald` = positivo/éxito (confirmada;
 * completada, la reunión se realizó según lo previsto), `blue` = neutro
 * (reprogramada, es solo un cambio de fecha informativo), `rose` = negativo
 * (cancelada). Antes usaba `orange` y `violet`, fuera del mapeo permitido.
 */
export const STATUS_BADGE_CLASSES: Record<CitationStatus, string> = {
  Pendiente: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800',
  Confirmada: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800',
  Reprogramada: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800',
  Completada: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800',
  Cancelada: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-900/30 dark:border-rose-800',
};

/** Color de la barra de acento vertical de la tarjeta de detalle, por estado. */
export const STATUS_ACCENT_CLASSES: Record<CitationStatus, string> = {
  Pendiente: 'bg-amber-500',
  Confirmada: 'bg-emerald-500',
  Reprogramada: 'bg-blue-500',
  Completada: 'bg-emerald-500',
  Cancelada: 'bg-rose-500',
};

/** Color de la insignia de categoría, usada en el panel de detalle y en el drawer. */
export const CATEGORY_BADGE_CLASSES: Record<CitationCategory, string> = {
  Académico: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800',
  Incidencias: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-900/30 dark:border-rose-800',
  Gestión: 'text-slate-700 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700',
  Otros: 'text-slate-700 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700',
};

/** Icono representativo de cada categoría, usado junto a su insignia. */
export const CATEGORY_ICONS: Record<CitationCategory, LucideIcon> = {
  Académico: BookOpen,
  Incidencias: Users,
  Gestión: Briefcase,
  Otros: Tag,
};

/** Entero estable en `[min, max]` a partir de una semilla de texto (mismo criterio que `src/data/users.ts`). */
const seededInt = (seed: string, min: number, max: number): number =>
  Math.floor(min + pseudoRandom(seed) * (max - min + 1));

/**
 * Estado de conexión de WhatsApp del apoderado, mostrado como punto verde
 * (en línea) o gris (desconectado) sobre su avatar en la lista de citaciones.
 * No hay backend que reporte presencia real: se deriva de forma estable a
 * partir del id de la citación, igual que el resto de datos simulados del
 * módulo (`pseudoRandom`, nunca `Math.random()`).
 */
export const isParentOnline = (citation: Pick<Citation, 'id'>): boolean =>
  pseudoRandom(`citation-${citation.id}-parent-online`) > 0.3;

const addMinutes = (date: Date, minutes: number): Date => new Date(date.getTime() + minutes * 60000);

/** "06 abr, 7:30 a. m." — mismo criterio regional (`es-PE`) que `formatRelativeDate.ts`. */
const formatStepWhen = (date: Date): string => {
  const day = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(date);
  const hour = new Intl.DateTimeFormat('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
  return `${day}, ${hour}`;
};

/**
 * Pasos del seguimiento de una citación: siempre los mismos 5 (Registrada →
 * Notificada → Confirmación del apoderado → Reunión programada → Citación
 * completada), con fecha/hora y responsable en los que ya ocurrieron y en
 * estado `'upcoming'` los que todavía no se alcanzan — así el stepper
 * horizontal de la pestaña "Seguimiento" siempre tiene el mismo ancho, sin
 * importar el estado actual. No hay fechas de auditoría reales en los datos:
 * se derivan de forma estable a partir de la fecha de la citación y su id
 * (`pseudoRandom`), nunca `Math.random()`.
 */
export const getCitationTimeline = (citation: Citation): TimelineStep[] => {
  const meetingAt = parseCitationDateTime(citation);
  const registeredAt = addMinutes(
    meetingAt,
    -seededInt(`citation-${citation.id}-registered-days`, 2, 5) * 24 * 60 -
      seededInt(`citation-${citation.id}-registered-min`, 0, 240),
  );
  const notifiedAt = addMinutes(registeredAt, seededInt(`citation-${citation.id}-notified`, 5, 45));
  const confirmedAt = addMinutes(notifiedAt, seededInt(`citation-${citation.id}-confirmed`, 60, 60 * 30));

  const registrada: TimelineStep = {
    label: 'Registrada',
    state: 'done',
    when: formatStepWhen(registeredAt),
    detail: `Por ${citation.teacher}`,
  };
  const notificada: TimelineStep = {
    label: 'Notificada',
    state: 'done',
    when: formatStepWhen(notifiedAt),
    detail: `A ${citation.parent}`,
  };
  const upcoming = (label: string): TimelineStep => ({ label, state: 'upcoming' });

  switch (citation.status) {
    case 'Pendiente':
      return [
        registrada,
        notificada,
        { label: 'Pendiente de confirmación del apoderado', state: 'current' },
        upcoming('Reunión programada'),
        upcoming('Citación completada'),
      ];
    case 'Reprogramada':
      return [
        registrada,
        notificada,
        {
          label: 'Reprogramada por el docente',
          state: 'current',
          when: formatStepWhen(meetingAt),
          detail: `Nueva fecha: ${citation.date} a las ${citation.time}`,
        },
        upcoming('Reunión programada'),
        upcoming('Citación completada'),
      ];
    case 'Confirmada':
      return [
        registrada,
        notificada,
        {
          label: 'Confirmada por el apoderado',
          state: 'done',
          when: formatStepWhen(confirmedAt),
          detail: `Por ${citation.parent}`,
        },
        {
          label: 'Reunión programada',
          state: 'current',
          when: formatStepWhen(meetingAt),
          detail: 'Fecha acordada con el apoderado',
        },
        upcoming('Citación completada'),
      ];
    case 'Completada':
      return [
        registrada,
        notificada,
        {
          label: 'Confirmada por el apoderado',
          state: 'done',
          when: formatStepWhen(confirmedAt),
          detail: `Por ${citation.parent}`,
        },
        {
          label: 'Reunión programada',
          state: 'done',
          when: formatStepWhen(meetingAt),
          detail: 'Fecha acordada con el apoderado',
        },
        {
          label: 'Citación completada',
          state: 'done',
          when: formatStepWhen(meetingAt),
          detail: `Reunión realizada con ${citation.parent}`,
        },
      ];
    case 'Cancelada':
      return [
        registrada,
        notificada,
        {
          label: 'Citación cancelada',
          state: 'cancelled',
          when: formatStepWhen(confirmedAt),
          detail: `Por ${citation.teacher}`,
        },
        upcoming('Reunión programada'),
        upcoming('Citación completada'),
      ];
  }
};
