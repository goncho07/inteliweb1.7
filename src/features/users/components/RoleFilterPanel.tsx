import React from 'react';
import { Briefcase, GraduationCap, ShieldCheck, User, type LucideIcon } from 'lucide-react';

import { NavCard } from '@/components/common/NavCard';
import { UserItem } from '@/types';

interface RoleFilterPanelProps {
  selectedRole: UserItem['role'];
  onSelectRole: (role: UserItem['role']) => void;
  stats: {
    estudiantes: number;
    apoderados: number;
    docentes: number;
    administrativos: number;
  };
}

interface RoleFilterEntry {
  role: UserItem['role'];
  label: string;
  icon: LucideIcon;
  statKey: keyof RoleFilterPanelProps['stats'];
}

const ROLE_FILTERS: RoleFilterEntry[] = [
  { role: 'Estudiante', label: 'Estudiantes', icon: GraduationCap, statKey: 'estudiantes' },
  { role: 'Apoderado', label: 'Apoderados', icon: User, statKey: 'apoderados' },
  { role: 'Docente', label: 'Docentes', icon: Briefcase, statKey: 'docentes' },
  { role: 'Administrativo', label: 'Administrativos', icon: ShieldCheck, statKey: 'administrativos' },
];

/**
 * Filtro por rol en la barra lateral de Usuarios. Reutiliza `NavCard` — la
 * misma tarjeta que el selector de bimestre del panel Inicio y el drill-down
 * de Aulas — en vez de un botón crudo propio.
 */
export const RoleFilterPanel: React.FC<RoleFilterPanelProps> = ({ selectedRole, onSelectRole, stats }) => (
  <div className="flex flex-col gap-2">
    {ROLE_FILTERS.map((filter) => {
      const isSelected = filter.role === selectedRole;
      return (
        <NavCard
          key={filter.role}
          title={filter.label}
          statLines={[`${stats[filter.statKey]} registrados`]}
          selected={isSelected}
          onClick={() => onSelectRole(filter.role)}
          leadingClassName={isSelected ? 'bg-blue-600' : 'bg-slate-100 dark:bg-slate-800'}
          leading={
            <filter.icon
              size={20}
              strokeWidth={2}
              className={isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}
            />
          }
        />
      );
    })}
  </div>
);
