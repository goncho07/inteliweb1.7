import React from 'react';
import { Bell, Calendar, Clock } from 'lucide-react';

import {
  DIALOG_TABS_LIST_CLASS,
  DIALOG_TAB_TRIGGER_CLASS,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
} from '@/components/common/DialogShell';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PersonalIncidentEntry } from '@/features/classrooms/types';

type AttendanceTab = 'asistencia' | 'salidas';

/** Prefijo con el que se identifica cada tipo de aviso en los datos. */
const ID_PREFIX: Record<AttendanceTab, string> = {
  asistencia: 'att-in-',
  salidas: 'att-out-',
};

const TABS: { value: AttendanceTab; label: string }[] = [
  { value: 'asistencia', label: 'Asistencia' },
  { value: 'salidas', label: 'Salidas' },
];

/**
 * Avisos de ingreso y salida enviados al apoderado. Ventana estándar de la app:
 * alto fijo, así que pasar de «Asistencia» a «Salidas» no cambia el tamaño de
 * la ventana aunque una de las dos no tenga avisos.
 */
export const AttendanceNotificationsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  activeAttendanceTab: AttendanceTab;
  setActiveAttendanceTab: (tab: AttendanceTab) => void;
  personalIncidents: PersonalIncidentEntry[];
}> = ({
  isOpen,
  onClose,
  studentName,
  activeAttendanceTab,
  setActiveAttendanceTab,
  personalIncidents,
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogShellContent size="md" height="fixed">
      <DialogShellHeader
        icon={Bell}
        title="Estado de notificaciones"
        description={`Ingresos y salidas de ${studentName}`}
      />

      <Tabs
        value={activeAttendanceTab}
        onValueChange={(value) => setActiveAttendanceTab(value as AttendanceTab)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList className={DIALOG_TABS_LIST_CLASS}>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className={DIALOG_TAB_TRIGGER_CLASS}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
          {TABS.map((tab) => {
            const entries = personalIncidents.filter((incident) =>
              incident.id.startsWith(ID_PREFIX[tab.value]),
            );

            return (
              <TabsContent key={tab.value} value={tab.value} className="mt-0 flex h-full flex-col gap-3">
                {entries.length === 0 ? (
                  <EmptyState
                    icon={Bell}
                    title={`Sin avisos de ${tab.label.toLowerCase()}`}
                    description="Cuando el colegio registre un ingreso o una salida, el aviso enviado al apoderado aparecerá aquí."
                  />
                ) : (
                  entries.map((incident) => (
                    <div
                      key={incident.id}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <div className={`shrink-0 rounded-lg p-2 ${incident.type.color}`}>
                        <incident.type.icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="text-base font-bold text-slate-800 dark:text-white">
                            {incident.type.label}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Calendar size={16} /> {incident.date}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Clock size={16} /> {incident.time}
                          </span>
                        </div>
                        <p className="mt-1 text-base text-slate-600 dark:text-slate-300">
                          {incident.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            );
          })}
        </div>
      </Tabs>

      <DialogShellFooter className="justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="h-12 rounded-xl px-6 text-base font-semibold"
        >
          Cerrar
        </Button>
      </DialogShellFooter>
    </DialogShellContent>
  </Dialog>
);
