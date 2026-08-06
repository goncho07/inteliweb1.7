import React from 'react';
import { CalendarDays, Download } from 'lucide-react';

import {
  DialogShellActionButton,
  DialogShellBody,
  DialogShellCancelButton,
  DialogShellContent,
  DialogShellFooter,
  DialogShellHeader,
} from '@/components/common/DialogShell';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { UserItem } from '@/types';

/** Horario semanal del docente, con descarga en PDF. */

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HOURS = ['08:00 - 09:30', '09:30 - 11:00', '11:00 - 11:30', '11:30 - 13:00', '13:00 - 14:30'];

/** Cuadrícula `[día][hora]` simulada, igual para todos los docentes. */
const SCHEDULE: string[][] = [
  ['Matemática', 'Física', 'RECREO', 'Matemática', 'Tutoría'],
  ['Raz. Mat.', 'Matemática', 'RECREO', 'Física', 'Raz. Mat.'],
  ['Matemática', 'Raz. Mat.', 'RECREO', 'Matemática', 'Libre'],
  ['Física', 'Matemática', 'RECREO', 'Raz. Mat.', 'Matemática'],
  ['Matemática', 'Física', 'RECREO', 'Matemática', 'Raz. Mat.'],
];

const downloadSchedulePdf = async (teacher: UserItem) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('HORARIO ESCOLAR 2026', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`DOCENTE: ${teacher.name.toUpperCase()}`, pageWidth / 2, 22, { align: 'center' });

  autoTable(doc, {
    startY: 30,
    head: [['HORA', ...DAYS]],
    body: HOURS.map((hour, hourIndex) => [hour, ...SCHEDULE.map((day) => day[hourIndex])]),
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], halign: 'center' },
    bodyStyles: { halign: 'center', fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
  });

  doc.save(`Horario_${teacher.name.replace(/\s+/g, '_')}.pdf`);
};

export const TeacherScheduleDialog: React.FC<{
  open: boolean;
  teacher: UserItem | null;
  onClose: () => void;
}> = ({ open, teacher, onClose }) => {
  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogShellContent>
        <DialogShellHeader
          icon={CalendarDays}
          title="Horario del docente"
          description={`${teacher.name} · Año escolar 2026`}
        />

        {/* La cuadrícula es más ancha que la ventana: se desplaza dentro de su
            propio contenedor, nunca ensanchando el modal. */}
        <DialogShellBody className="overflow-auto p-6">
          <table className="w-full min-w-[720px] border-collapse">
            <caption className="sr-only">Horario semanal de {teacher.name}</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="border border-slate-200 bg-slate-50 p-3 text-sm font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                >
                  Hora
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    scope="col"
                    className="border border-slate-200 bg-slate-50 p-3 text-sm font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour, hourIndex) => (
                <tr key={hour}>
                  <th
                    scope="row"
                    className="border border-slate-200 bg-slate-50/70 p-3 text-left text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                  >
                    {hour}
                  </th>
                  {SCHEDULE.map((day, dayIndex) => (
                    <td
                      key={DAYS[dayIndex]}
                      className={cn(
                        'border border-slate-200 p-3 text-center text-base dark:border-slate-800',
                        day[hourIndex] === 'RECREO'
                          ? 'bg-amber-50 font-bold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                          : 'text-slate-700 dark:text-slate-300',
                      )}
                    >
                      {day[hourIndex]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </DialogShellBody>

        <DialogShellFooter>
          <DialogShellCancelButton onClick={onClose}>Cerrar</DialogShellCancelButton>
          <DialogShellActionButton onClick={() => void downloadSchedulePdf(teacher)}>
            <Download size={20} /> Descargar PDF
          </DialogShellActionButton>
        </DialogShellFooter>
      </DialogShellContent>
    </Dialog>
  );
};
