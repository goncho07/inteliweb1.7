import React from 'react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type OverviewTabId = 'asistencia' | 'incidencias' | 'citaciones';

const TABS: { value: OverviewTabId; label: string }[] = [
  { value: 'asistencia', label: 'Asistencia' },
  { value: 'incidencias', label: 'Incidencias' },
  { value: 'citaciones', label: 'Citaciones' },
];

/**
 * Fila superior de la Vista General del Aula: qué pestaña de reporte se ve,
 * y a la derecha la leyenda/estado que le corresponde a esa pestaña
 * (`legend`, cambia según el llamador).
 */
export const OverviewTabsBar: React.FC<{
  activeTab: OverviewTabId;
  onTabChange: (tab: OverviewTabId) => void;
  legend?: React.ReactNode;
}> = ({ activeTab, onTabChange, legend }) => (
  <div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-4 dark:border-slate-800/60 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as OverviewTabId)}>
      <TabsList className="flex h-auto items-stretch justify-start gap-1 rounded-none border-b-0 bg-transparent p-0">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="group relative h-10 rounded-none px-3 text-sm font-semibold text-slate-600 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-blue-700 data-[state=active]:shadow-none dark:text-slate-400 dark:data-[state=active]:text-blue-400"
          >
            {tab.label}
            <span className="absolute bottom-0 left-0 right-0 hidden h-0.5 rounded-full bg-blue-600 group-data-[state=active]:block dark:bg-blue-400" />
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>

    {legend && <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">{legend}</div>}
  </div>
);
