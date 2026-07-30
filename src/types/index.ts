import React from 'react';

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export interface UserItem {
  id: string;
  code?: string;
  name: string;
  dni: string;
  role: 'Estudiante' | 'Docente' | 'Administrativo' | 'Apoderado';
  level?: 'Inicial' | 'Primaria' | 'Secundaria'; // Campo agregado para filtros
  grade?: string;
  section?: string;
  status: 'Activo' | 'Inactivo' | 'Suspendido' | 'Matriculado' | 'Retirado' | 'Trasladado' | 'Egresado';
  avatarColor: string;
  email: string;
  phone?: string;
  address?: string;
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

export type ModuleId = 'dashboard' | 'users' | 'profile' | 'classrooms' | 'citations' | 'whatsapp';

export interface ModuleProps {
  onNavigate: (view: ModuleId) => void;
  onRegisterIncident?: () => void;
  parentViewStudentId?: string;
  globalDate?: Date;
}

export interface MenuItemConfig {
  id: ModuleId;
  label: string;
  icon: any; // LucideIcon type implies 'any' in loose contexts, keeping simple for now
  /** `ComponentType` (y no `FC`) para admitir módulos cargados con `React.lazy`. */
  component: React.ComponentType<ModuleProps>;
  hidden?: boolean;
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
