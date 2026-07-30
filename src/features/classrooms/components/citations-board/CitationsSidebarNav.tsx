import React from 'react';
import { CheckCircle2, Edit2, Inbox, XCircle } from 'lucide-react';

import type { CitationsPanelVariant } from '@/features/classrooms/panelVariants';
import { cn } from '@/lib/utils';

type SidebarTab = "Pendientes" | "Confirmadas" | "Historial" | "Canceladas";

/** Barra lateral del panel de citaciones: botón "Redactar" y navegación por pestañas. */
export const CitationsSidebarNav: React.FC<{
  variant: CitationsPanelVariant;
  sidebarTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onCompose: () => void;
  pendingCount: number;
  confirmedCount: number;
}> = ({ variant, sidebarTab, onTabChange, onCompose, pendingCount, confirmedCount }) => {
  const tabs: { id: SidebarTab; label: string; icon: typeof Inbox; count: number }[] = [
    {
      id: "Pendientes",
      label: "Citas Pendientes",
      icon: Inbox,
      count: pendingCount,
    },
    {
      id: "Confirmadas",
      label: "Citas Confirmadas",
      icon: CheckCircle2,
      count: confirmedCount,
    },
    {
      id: "Canceladas",
      label: "Citas Canceladas",
      icon: XCircle,
      count: 0,
    },
  ];

  return (
    <div className="w-full md:w-[260px] border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-slate-800 shrink-0 py-4 sm:py-6 pr-4 overflow-y-auto">
      {/* Compose Button */}
      <div className="mb-6">
        <button
          onClick={onCompose}
          className={cn(
            'flex items-center gap-3 px-6 py-4 hover:shadow-md transition-all rounded-r-full w-full group',
            variant.composeButtonClass,
          )}
        >
          <Edit2
            className={cn('w-5 h-5', variant.composeIconClass)}
            strokeWidth={2.5}
          />
          <span className="font-semibold text-[15px]">Redactar</span>
        </button>
      </div>

      <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-between px-6 py-3 rounded-r-full font-medium text-[15px] transition-colors w-full group ${sidebarTab === tab.id ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
          >
            <div className="flex items-center gap-4">
              <tab.icon
                className={`w-5 h-5 shrink-0 transition-colors ${sidebarTab === tab.id ? "text-slate-900 dark:text-white" : "text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"}`}
              />
              <span className="flex-1 text-left">{tab.label}</span>
            </div>
            {tab.count > 0 && (
              <span
                className={`text-[13px] font-bold ${sidebarTab === tab.id ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
