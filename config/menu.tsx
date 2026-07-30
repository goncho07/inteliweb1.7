import { 
  Home, 
  Users, 
  BookOpen,
  Mail,
  MessageCircle
} from 'lucide-react';
import { DashboardModule } from '../modules/DashboardModule';
import { ProfileModule } from '../modules/ProfileModule';
import { ClassroomsModule } from '../modules/ClassroomsModule';
import { CitationsModule } from '../modules/CitationsModule';
import { WhatsAppModule } from '../modules/WhatsAppModule';
import { MenuItemConfig } from '../types';

export const MENU_CONFIG: MenuItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Inicio',
    icon: Home,
    component: DashboardModule
  },
  {
    id: 'classrooms',
    label: 'Aulas',
    icon: BookOpen,
    component: ClassroomsModule
  },
  {
    id: 'citations',
    label: 'Citaciones',
    icon: Mail,
    component: CitationsModule
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    component: WhatsAppModule
  },
  {
    id: 'profile',
    label: 'Mi Perfil',
    icon: Home, // It won't be shown in sidebar anyway
    component: ProfileModule,
    hidden: true
  }
];