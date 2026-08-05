import React from 'react';
import { Check, Home } from 'lucide-react';

import { ModuleSidebar, ModuleSidebarBody, ModuleSidebarSection } from '@/components/layout/ModuleShell';
import { NavCard } from '@/components/common/NavCard';
import { cn } from '@/lib/utils';
import { BIMESTRES, getDefaultBimestreId, type BimestreId, type EducationLevel } from '../dashboard.constants';
import { ChartToggleGroup } from '@/components/charts/ChartToggleGroup';

/** Nivel especial que no filtra nada — el panel muestra el consolidado de todo el colegio. */
type LevelFilter = EducationLevel | 'Todos';

const LEVEL_OPTIONS: { id: LevelFilter; label: string }[] = [
  { id: 'Todos', label: 'Todos' },
  { id: 'Inicial', label: 'Inicial' },
  { id: 'Primaria', label: 'Primaria' },
  { id: 'Secundaria', label: 'Secundaria' },
];

interface DashboardSidebarProps {
  selectedBimestreId: BimestreId;
  onSelectBimestre: (id: BimestreId) => void;
  selectedLevel: LevelFilter;
  onSelectLevel: (level: LevelFilter) => void;
}

/**
 * Columna izquierda del módulo Inicio: selector de bimestre y de nivel
 * educativo, ambos controlan las métricas del panel. Tratamiento distinto a
 * propósito: Bimestre es una decisión de navegación real (con metadata:
 * rango de fechas, badge "Actual") y usa `NavCard`, igual que en Aulas; Nivel
 * es solo un filtro/lente sobre datos ya cargados — no navega a ningún
 * lado — así que usa `ChartToggleGroup` (pastillas compactas), más liviano
 * que 4 tarjetas más. No repite accesos a Aulas/Citaciones: esos ya están en
 * el menú principal del shell, a un clic de distancia.
 */
export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  selectedBimestreId,
  onSelectBimestre,
  selectedLevel,
  onSelectLevel,
}) => {
  const currentBimestreId = getDefaultBimestreId();

  return (
    <ModuleSidebar title="Inicio" icon={Home}>
      <ModuleSidebarBody>
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

        <ModuleSidebarSection label="Nivel">
          <ChartToggleGroup
            value={selectedLevel}
            onChange={onSelectLevel}
            ariaLabel="Filtrar por nivel educativo"
            options={LEVEL_OPTIONS.map((option) => ({ value: option.id, label: option.label }))}
          />
        </ModuleSidebarSection>
      </ModuleSidebarBody>
    </ModuleSidebar>
  );
};
