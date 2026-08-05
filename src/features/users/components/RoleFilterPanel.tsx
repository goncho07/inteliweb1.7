import React from 'react';

import { NavCard } from '@/components/common/NavCard';
import { ROLE_META, ROLE_ORDER } from '@/features/users/users.constants';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

/**
 * Filtro por rol en la barra lateral. Reutiliza `NavCard` — la misma tarjeta
 * que el selector de bimestre de Inicio y el drill-down de Aulas — en vez de
 * un botón propio. Sin contenedor propio: la separación entre tarjetas la
 * pone `ModuleSidebarSection`.
 */
export const RoleFilterPanel: React.FC<{
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  countsByRole: Record<UserRole, number>;
}> = ({ selectedRole, onSelectRole, countsByRole }) => (
  <>
    {ROLE_ORDER.map((role) => {
      const meta = ROLE_META[role];
      const isSelected = role === selectedRole;
      const count = countsByRole[role];
      return (
        <NavCard
          key={role}
          title={meta.plural}
          statLines={[`${count} ${count === 1 ? 'registrado' : 'registrados'}`]}
          selected={isSelected}
          onClick={() => onSelectRole(role)}
          leadingClassName={isSelected ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800'}
          leading={
            <meta.icon
              size={24}
              strokeWidth={2.5}
              className={cn(
                isSelected ? 'text-primary-foreground' : 'text-slate-500 dark:text-slate-400',
              )}
            />
          }
        />
      );
    })}
  </>
);
