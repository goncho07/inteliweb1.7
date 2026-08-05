import {
  Briefcase,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

import type { UserRole, UserStatus } from '@/types';

/** Constantes del módulo de Usuarios: roles, estados y límites del panel. */

/** Cursos del plan de estudios, usados para emitir un carnet QR por curso. */
export const COURSES = [
  'Matemática',
  'Comunicación',
  'Ciencia y Tecnología',
  'Personal Social',
  'Inglés',
  'Arte y Cultura',
  'Educación Física',
  'Religión',
  'Tutoría',
  'Computación',
];

export const LEVEL_OPTIONS = ['Inicial', 'Primaria', 'Secundaria'] as const;

/** Valor centinela de los filtros: ningún filtro aplicado sobre ese eje. */
export const ALL = 'Todos';

interface RoleMeta {
  /** Nombre en singular, para títulos de ficha y confirmaciones. */
  singular: string;
  /** Nombre en plural, para la cabecera y los contadores. */
  plural: string;
  icon: LucideIcon;
  /** ¿Se le asigna un aula (nivel/grado/sección)? */
  hasClassroom: boolean;
  /** ¿Puede iniciar sesión en el sistema? Los estudiantes no. */
  hasAccount: boolean;
}

/** Orden en el que se listan los roles en la barra lateral. */
export const ROLE_ORDER: UserRole[] = ['Estudiante', 'Apoderado', 'Docente', 'Administrativo'];

export const ROLE_META: Record<UserRole, RoleMeta> = {
  Estudiante: {
    singular: 'Estudiante',
    plural: 'Estudiantes',
    icon: GraduationCap,
    hasClassroom: true,
    hasAccount: false,
  },
  Apoderado: {
    singular: 'Apoderado',
    plural: 'Apoderados',
    icon: HeartHandshake,
    hasClassroom: false,
    hasAccount: true,
  },
  Docente: {
    singular: 'Docente',
    plural: 'Docentes',
    icon: Briefcase,
    hasClassroom: true,
    hasAccount: true,
  },
  Administrativo: {
    singular: 'Administrativo',
    plural: 'Administrativos',
    icon: ShieldCheck,
    hasClassroom: false,
    hasAccount: true,
  },
};

/**
 * Estados válidos por rol. Un estudiante se matricula, se traslada o egresa;
 * el personal simplemente está activo o no. Mezclarlos permitía filtrar por
 * «Egresado» en la lista de docentes y no devolver nunca nada.
 */
export const STATUS_BY_ROLE: Record<UserRole, UserStatus[]> = {
  Estudiante: ['Matriculado', 'Retirado', 'Trasladado', 'Egresado'],
  Apoderado: ['Activo', 'Inactivo', 'Suspendido'],
  Docente: ['Activo', 'Inactivo', 'Suspendido'],
  Administrativo: ['Activo', 'Inactivo', 'Suspendido'],
};

/** Color semántico del estado, común a la tabla y a la ficha de detalle. */
export const STATUS_STYLES: Record<UserStatus, string> = {
  Activo:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Matriculado:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Inactivo:
    'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Suspendido:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Retirado:
    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  Trasladado:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Egresado:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

/** Cuántas filas caben sin que la tabla obligue a desplazarse en un portátil de 768px de alto. */
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

/**
 * Tope de carnets por lote. Cada carnet pide su QR a un servicio externo, así
 * que generar los del colegio entero (miles de peticiones) colgaba la pestaña
 * sin ningún aviso. Por encima de este número se pide acotar el filtro.
 */
export const MAX_CARNET_CARDS = 400;
