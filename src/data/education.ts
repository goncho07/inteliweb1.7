import {
  AlertOctagon, AlertTriangle, BookOpen, Crosshair, FileWarning, Flag, Gem,
  Hammer, LogOut, Megaphone, MessageSquare, Palette, Shirt, ShieldAlert,
  Skull, Smartphone, Sparkles, User, UserX, Users,
} from 'lucide-react';

import type { ClassItem, IncidentType } from '@/types';

interface SectionConfig {
  [grade: string]: string[];
}

interface LevelConfig {
  [level: string]: SectionConfig;
}

/** Estructura educativa completa de la institución: nivel → grado → secciones. */
export const EDUCATIONAL_STRUCTURE: LevelConfig = {
  Inicial: {
    '3 Años': ['Margaritas', 'Crisantemos'],
    '4 Años': ['Jasminez', 'Rosas', 'Lirios', 'Geranios'],
    '5 Años': ['Orquídeas', 'Tulipanes', 'Girasoles', 'Claveles'],
  },
  Primaria: {
    '1° Grado': ['A', 'B', 'C'],
    '2° Grado': ['A', 'B', 'C'],
    '3° Grado': ['A', 'B', 'C'],
    '4° Grado': ['A', 'B', 'C', 'D'],
    '5° Grado': ['A', 'B', 'C'],
    '6° Grado': ['A', 'B', 'C'],
  },
  Secundaria: {
    '1° Grado': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    '2° Grado': ['A', 'B', 'C', 'D', 'E', 'F'],
    '3° Grado': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    '4° Grado': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    '5° Grado': ['A', 'B', 'C', 'D', 'E', 'F'],
  },
};

/** Alumnos por sección cuando no hay nómina real que lo reemplace (Inicial y Primaria). */
export const DEFAULT_SECTION_SIZE = 30;

/**
 * Nómina real de Secundaria (dato provisto por el colegio, no simulado):
 * cantidad exacta de alumnos por grado y sección. Única fuente de verdad —
 * de aquí sale cuántos `MOCK_USERS` estudiantes se generan por sección
 * (`data/users.ts`).
 */
export const SECUNDARIA_SECTION_SIZES: Record<string, Record<string, number>> = {
  '1° Grado': { A: 32, B: 33, C: 33, D: 25, E: 31, F: 28, G: 29 },
  '2° Grado': { A: 34, B: 34, C: 34, D: 34, E: 33, F: 34 },
  '3° Grado': { A: 29, B: 29, C: 27, D: 27, E: 27, F: 27, G: 28 },
  '4° Grado': { A: 31, B: 31, C: 31, D: 33, E: 34, F: 31, G: 32 },
  '5° Grado': { A: 29, B: 28, C: 34, D: 27, E: 29, F: 27 },
};

/** Cantidad de alumnos de una sección puntual: la nómina real en Secundaria, o `DEFAULT_SECTION_SIZE` en el resto. */
export const getSectionSize = (level: string, grade: string, section: string): number =>
  level === 'Secundaria' ? (SECUNDARIA_SECTION_SIZES[grade]?.[section] ?? DEFAULT_SECTION_SIZE) : DEFAULT_SECTION_SIZE;

const NEUTRAL_BADGE = 'bg-slate-50 text-slate-700 border-slate-200';

/** Catálogo de incidencias conductuales, clasificadas por gravedad. */
export const INCIDENT_TYPES: IncidentType[] = [
  // Leves
  { id: '1', label: 'Uso de joyas', category: 'Leve', icon: Gem, color: NEUTRAL_BADGE },
  { id: '2', label: 'Uñas pintadas', category: 'Leve', icon: Palette, color: NEUTRAL_BADGE },
  { id: '3', label: 'Cabello suelto', category: 'Leve', icon: User, color: NEUTRAL_BADGE },
  { id: '4', label: 'Falta de aseo personal', category: 'Leve', icon: Sparkles, color: NEUTRAL_BADGE },
  { id: '5', label: 'Uniforme incompleto', category: 'Leve', icon: Shirt, color: NEUTRAL_BADGE },
  { id: '6', label: 'No trajo útiles', category: 'Leve', icon: BookOpen, color: NEUTRAL_BADGE },
  { id: '7', label: 'Incumplimiento de tareas', category: 'Leve', icon: FileWarning, color: NEUTRAL_BADGE },

  // Moderadas
  { id: '8', label: 'Indisciplina en formación', category: 'Moderada', icon: Users, color: NEUTRAL_BADGE },
  { id: '9', label: 'Indisciplina en aula', category: 'Moderada', icon: AlertOctagon, color: NEUTRAL_BADGE },
  { id: '10', label: 'Falta de respeto a símbolos patrios', category: 'Moderada', icon: Flag, color: NEUTRAL_BADGE },
  { id: '11', label: 'Falta de respeto al docente', category: 'Moderada', icon: UserX, color: NEUTRAL_BADGE },
  { id: '12', label: 'Agresión verbal', category: 'Moderada', icon: MessageSquare, color: NEUTRAL_BADGE },
  { id: '13', label: 'Uso de celular', category: 'Moderada', icon: Smartphone, color: NEUTRAL_BADGE },
  { id: '14', label: 'Daño a infraestructura', category: 'Moderada', icon: Hammer, color: NEUTRAL_BADGE },
  { id: '15', label: 'Escándalo en aula', category: 'Moderada', icon: Megaphone, color: NEUTRAL_BADGE },

  // Graves
  { id: '16', label: 'Salida no autorizada', category: 'Grave', icon: LogOut, color: NEUTRAL_BADGE },
  { id: '17', label: 'Agresión física', category: 'Grave', icon: ShieldAlert, color: NEUTRAL_BADGE },
  { id: '18', label: 'Acoso escolar', category: 'Grave', icon: AlertTriangle, color: NEUTRAL_BADGE },
  { id: '19', label: 'Consumo de drogas', category: 'Grave', icon: Skull, color: NEUTRAL_BADGE },
  { id: '20', label: 'Porte de armas', category: 'Grave', icon: Crosshair, color: NEUTRAL_BADGE },
];

export const MOCK_CLASSES: ClassItem[] = [
  { id: 'c1', name: '3° Grado Primaria - C' },
  { id: 'c2', name: '5° Grado Secundaria - A' },
  { id: 'c3', name: '2° Grado Secundaria - B' },
];
