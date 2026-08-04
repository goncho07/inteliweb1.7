import React from 'react';

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

/** Nivel → grado → sección que identifica un aula. */
export interface ClassroomRef {
  level: string;
  grade: string;
  section: string;
}

/**
 * Qué ve un usuario al entrar al sistema. Ausente en `UserItem.appRole` =
 * sin acceso (los estudiantes no inician sesión).
 */
export type AppRole = 'directivo' | 'docente' | 'auxiliar' | 'apoderado';

export interface UserItem {
  id: string;
  code?: string;
  name: string;
  dni: string;
  role: 'Estudiante' | 'Docente' | 'Administrativo' | 'Apoderado';
  gender: 'M' | 'F';
  level?: 'Inicial' | 'Primaria' | 'Secundaria'; // Campo agregado para filtros
  grade?: string;
  section?: string;
  status: 'Activo' | 'Inactivo' | 'Suspendido' | 'Matriculado' | 'Retirado' | 'Trasladado' | 'Egresado';
  avatarColor: string;
  email: string;
  phone?: string;
  address?: string;
  /** Qué ve al entrar. Ausente = sin acceso al sistema (estudiantes). */
  appRole?: AppRole;
  /** Solo Docente: aulas a su cargo. La primera es la que tutorea. */
  classrooms?: ClassroomRef[];
  /** Solo Apoderado: ids de sus hijos en `MOCK_USERS`. */
  childrenIds?: string[];
  /** Solo Estudiante: ids de sus apoderados en `MOCK_USERS`. */
  guardianIds?: string[];
}

export interface IncidentType {
  id: string;
  label: string;
  category: 'Leve' | 'Moderada' | 'Grave';
  icon: any;
  color: string;
}

export interface ClassItem {
  id: string;
  name: string;
}

// --- Arquitectura SaaS ---

export type ModuleId = 'dashboard' | 'users' | 'profile' | 'classrooms' | 'citations' | 'calendar';

export interface ModuleProps {
  onNavigate: (view: ModuleId) => void;
  onRegisterIncident?: () => void;
  globalDate?: Date;
  setGlobalDate?: React.Dispatch<React.SetStateAction<Date>>;
}

export interface MenuItemConfig {
  id: ModuleId;
  label: string;
  icon: any; // LucideIcon type implies 'any' in loose contexts, keeping simple for now
  /** `ComponentType` (y no `FC`) para admitir módulos cargados con `React.lazy`. */
  component: React.ComponentType<ModuleProps>;
  hidden?: boolean;
  /** Roles que ven este ítem en el riel de navegación. */
  roles: AppRole[];
}
// --- Calendario institucional ---

export interface CalendarEvent {
  label: string;
  type:
    | "feriado"
    | "academico"
    | "civico"
    | "gestion"
    | "vacaciones"
    | "incidencia"
    | "otros";
  time?: string;
  student?: string;
  parent?: string;
  reason?: string;
}
