import React from 'react';
import { AlertTriangle, CalendarCheck, Check, ClipboardCheck, Home, Megaphone } from 'lucide-react';

import { ModuleSidebar, ModuleSidebarBody, ModuleSidebarSection } from '@/components/layout/ModuleShell';
import { NavCard } from '@/components/common/NavCard';
import { cn } from '@/lib/utils';
import { BIMESTRES, getDefaultBimestreId, type BimestreId } from '../dashboard.constants';

type QuickActionKey = 'asistencia' | 'comunicados' | 'incidencias' | 'citaciones';

interface DashboardSidebarProps {
  selectedBimestreId: BimestreId;
  onSelectBimestre: (id: BimestreId) => void;
  /** Solo un docente actúa sobre "mis aulas": ver `showsQuickActions` en `DashboardModule`. */
  showsQuickActions: boolean;
  onSelectQuickAction: (key: QuickActionKey) => void;
}

/** Icono, color y frase de cada acción — mismo mapeo semántico que el resto de la app (A4 de `DESIGN_SYSTEM.md`). */
const QUICK_ACTIONS: {
  key: QuickActionKey;
  title: string;
  hint: string;
  icon: typeof ClipboardCheck;
  leadingClassName: string;
  iconClassName: string;
}[] = [
  {
    key: 'asistencia',
    title: 'Asistencia',
    hint: 'Pasar lista de un aula',
    icon: ClipboardCheck,
    leadingClassName: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconClassName: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    key: 'comunicados',
    title: 'Comunicados',
    hint: 'Enviar aviso general',
    icon: Megaphone,
    leadingClassName: 'bg-amber-100 dark:bg-amber-900/40',
    iconClassName: 'text-amber-700 dark:text-amber-400',
  },
  {
    key: 'incidencias',
    title: 'Incidencias',
    hint: 'Reportar conducta',
    icon: AlertTriangle,
    leadingClassName: 'bg-rose-100 dark:bg-rose-900/40',
    iconClassName: 'text-rose-700 dark:text-rose-400',
  },
  {
    key: 'citaciones',
    title: 'Citaciones',
    hint: 'Programar reunión',
    icon: CalendarCheck,
    leadingClassName: 'bg-blue-100 dark:bg-blue-900/40',
    iconClassName: 'text-blue-700 dark:text-blue-400',
  },
];

/**
 * Columna izquierda del módulo Inicio: acciones rápidas (solo docente) y
 * selector de bimestre, que controla las métricas del panel. Ambos son
 * decisiones de navegación real (con metadata propia) y usan `NavCard`,
 * igual que en Aulas. No repite accesos a Aulas/Citaciones como *navegación*:
 * esos ya están en el menú principal del shell — las acciones rápidas abren
 * una ventana propia, no llevan a otro módulo.
 */
export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  selectedBimestreId,
  onSelectBimestre,
  showsQuickActions,
  onSelectQuickAction,
}) => {
  const currentBimestreId = getDefaultBimestreId();

  return (
    <ModuleSidebar title="Inicio" icon={Home}>
      <ModuleSidebarBody>
        {showsQuickActions && (
          <ModuleSidebarSection label="Acciones rápidas">
            {QUICK_ACTIONS.map((action) => (
              <NavCard
                key={action.key}
                title={action.title}
                statLines={[action.hint]}
                leadingClassName={action.leadingClassName}
                leading={<action.icon size={24} strokeWidth={2} className={action.iconClassName} />}
                onClick={() => onSelectQuickAction(action.key)}
              />
            ))}
          </ModuleSidebarSection>
        )}

        <ModuleSidebarSection label="Bimestre">
          {BIMESTRES.map((bimestre) => {
            const isSelected = bimestre.id === selectedBimestreId;
            return (
              <NavCard
                key={bimestre.id}
                title={bimestre.label}
                statLines={[bimestre.range]}
                selected={isSelected}
                badge={bimestre.id === currentBimestreId ? 'Actual' : undefined}
                badgeClassName={
                  bimestre.id === currentBimestreId
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : undefined
                }
                onClick={() => onSelectBimestre(bimestre.id)}
                leadingClassName={cn(isSelected ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800')}
                leading={
                  isSelected ? (
                    <Check size={20} strokeWidth={2.5} className="text-white" />
                  ) : (
                    <span className="text-base font-black text-slate-500 dark:text-slate-400">{`${bimestre.id}°`}</span>
                  )
                }
              />
            );
          })}
        </ModuleSidebarSection>
      </ModuleSidebarBody>
    </ModuleSidebar>
  );
};
