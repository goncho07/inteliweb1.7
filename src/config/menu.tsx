import { lazy } from 'react';
import { BookOpen, Home, Mail, MessageCircle } from 'lucide-react';

import type { MenuItemConfig } from '@/types';

/**
 * Cada módulo se carga bajo demanda: sólo se descarga el código del módulo que
 * el usuario abre. Los módulos exportan de forma nombrada, por eso se mapea
 * `default` en el `import()` dinámico.
 */
const DashboardModule = lazy(() =>
  import('@/features/dashboard/DashboardModule').then((m) => ({ default: m.DashboardModule })),
);
const ClassroomsModule = lazy(() =>
  import('@/features/classrooms/ClassroomsModule').then((m) => ({ default: m.ClassroomsModule })),
);
const CitationsModule = lazy(() =>
  import('@/features/citations/CitationsModule').then((m) => ({ default: m.CitationsModule })),
);
const WhatsAppModule = lazy(() =>
  import('@/features/whatsapp/WhatsAppModule').then((m) => ({ default: m.WhatsAppModule })),
);
const ProfileModule = lazy(() =>
  import('@/features/profile/ProfileModule').then((m) => ({ default: m.ProfileModule })),
);

export const MENU_CONFIG: MenuItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Inicio',
    icon: Home,
    component: DashboardModule,
  },
  {
    id: 'classrooms',
    label: 'Aulas',
    icon: BookOpen,
    component: ClassroomsModule,
  },
  {
    id: 'citations',
    label: 'Citaciones',
    icon: Mail,
    component: CitationsModule,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    component: WhatsAppModule,
  },
  {
    id: 'profile',
    label: 'Mi Perfil',
    // Se accede desde el menú de usuario, no desde la barra lateral.
    icon: Home,
    component: ProfileModule,
    hidden: true,
  },
];
