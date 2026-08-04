import { lazy } from 'react';
import { BookOpen, CalendarDays, Home, Mail, Users } from 'lucide-react';

import type { AppRole, MenuItemConfig } from '@/types';

/** Los cuatro roles del sistema — se repite aquí porque casi todo `MENU_CONFIG` lo usa. */
const ALL_ROLES: AppRole[] = ['directivo', 'docente', 'auxiliar', 'apoderado'];
const STAFF_ROLES: AppRole[] = ['directivo', 'docente', 'auxiliar'];

/**
 * Cada módulo se carga bajo demanda: sólo se descarga el código del módulo que
 * el usuario abre. Los módulos exportan de forma nombrada, por eso se mapea
 * `default` en el `import()` dinámico.
 *
 * Los loaders se guardan aparte para poder precargarlos con `preloadModules()`
 * apenas el usuario inicia sesión: `import()` cachea por specifier, así que
 * cuando `lazy()` los vuelve a pedir ya están resueltos y no hay espera.
 */
const dashboardLoader = () =>
  import('@/features/dashboard/DashboardModule').then((m) => ({ default: m.DashboardModule }));
const classroomsLoader = () =>
  import('@/features/classrooms/ClassroomsModule').then((m) => ({ default: m.ClassroomsModule }));
const usersLoader = () =>
  import('@/features/users/UsersModule').then((m) => ({ default: m.UsersModule }));
const citationsLoader = () =>
  import('@/features/citations/CitationsModule').then((m) => ({ default: m.CitationsModule }));
const profileLoader = () =>
  import('@/features/profile/ProfileModule').then((m) => ({ default: m.ProfileModule }));
const calendarLoader = () =>
  import('@/features/calendar/CalendarModule').then((m) => ({ default: m.CalendarModule }));

const DashboardModule = lazy(dashboardLoader);
const ClassroomsModule = lazy(classroomsLoader);
const UsersModule = lazy(usersLoader);
const CitationsModule = lazy(citationsLoader);
const ProfileModule = lazy(profileLoader);
const CalendarModule = lazy(calendarLoader);

export const MENU_CONFIG: MenuItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Inicio',
    icon: Home,
    component: DashboardModule,
    // El apoderado no tiene un panel agregado que ver: solo le importa su hijo.
    roles: STAFF_ROLES,
  },
  {
    id: 'classrooms',
    label: 'Aulas',
    icon: BookOpen,
    component: ClassroomsModule,
    roles: ALL_ROLES,
  },
  {
    id: 'users',
    label: 'Usuarios',
    icon: Users,
    component: UsersModule,
    // Gestión de matrícula y cuentas: solo el directivo.
    roles: ['directivo'],
  },
  {
    id: 'citations',
    label: 'Citaciones',
    icon: Mail,
    component: CitationsModule,
    roles: STAFF_ROLES,
  },
  {
    id: 'profile',
    label: 'Mi Perfil',
    // Se accede desde el menú de usuario, no desde la barra lateral.
    icon: Home,
    component: ProfileModule,
    hidden: true,
    roles: ALL_ROLES,
  },
  {
    id: 'calendar',
    label: 'Calendario',
    // Se accede desde el ícono de cabecera y "Herramientas", no desde la barra lateral principal.
    icon: CalendarDays,
    component: CalendarModule,
    hidden: true,
    roles: ALL_ROLES,
  },
];

/** Dispara la descarga de los módulos accesibles para este rol en segundo plano, sin esperar el resultado. */
export function preloadModules(role: AppRole) {
  const loaderById: Record<string, () => Promise<unknown>> = {
    dashboard: dashboardLoader,
    classrooms: classroomsLoader,
    users: usersLoader,
    citations: citationsLoader,
    profile: profileLoader,
    calendar: calendarLoader,
  };

  MENU_CONFIG.filter((item) => item.roles.includes(role)).forEach((item) => {
    loaderById[item.id]?.().catch(() => {
      // Si falla la precarga, React.lazy la reintenta cuando el usuario abra el módulo.
    });
  });
}
