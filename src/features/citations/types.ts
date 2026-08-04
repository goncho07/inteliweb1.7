/** Tipos del módulo de Citaciones (vista de 2 columnas: lista + detalle). */

export type CitationStatus =
  | 'Pendiente'
  | 'Confirmada'
  | 'Reprogramada'
  | 'Completada'
  | 'Cancelada';

export type CitationCategory = 'Académico' | 'Incidencias' | 'Gestión' | 'Otros';

export type CitationLevel = 'Primaria' | 'Secundaria';

export interface CitationIncident {
  type: string;
  date: string;
}

export interface Citation {
  id: number;
  student: string;
  parent: string;
  relationship: string;
  parentPhone: string;
  grade: string;
  level: CitationLevel;
  reason: string;
  description: string;
  category: CitationCategory;
  date: string;
  time: string;
  status: CitationStatus;
  teacher: string;
  subject: string;
  incidents?: CitationIncident[];
}

/** Filtro "Todas" agregado a `CitationStatus` para la barra de filtros. */
export type CitationStatusFilter = CitationStatus | 'Todas';

/** Filtro "Todos" agregado a `CitationCategory` para la barra de filtros. */
export type CitationCategoryFilter = CitationCategory | 'Todos';

/** Paso del seguimiento de una citación, usado en la pestaña "Seguimiento" y en el indicador del encabezado. */
export type TimelineStepState = 'done' | 'current' | 'upcoming' | 'cancelled';

export interface TimelineStep {
  label: string;
  /** Fecha y hora del paso, ya formateada. Solo se muestra en pasos completados o en curso. */
  when?: string;
  /** Responsable o contexto adicional del paso (p. ej. "Por Luis Gomez"). */
  detail?: string;
  state: TimelineStepState;
}

/** Autor de un mensaje dentro de la pestaña "Conversación" del detalle de una citación. */
export type CitationMessageSender = 'docente' | 'apoderado' | 'sistema';

/** Mensaje de la conversación asociada a una citación. Datos simulados, sin persistencia. */
export interface CitationMessage {
  id: string;
  sender: CitationMessageSender;
  text: string;
  timestamp: string;
}
