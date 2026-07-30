import React from 'react';
import { ChevronDown, SearchX } from 'lucide-react';

import { CustomCalendar } from '@/components/calendar/CustomCalendar';
import { ScrollableReportList } from '@/components/reports/ScrollableReportList';
import { ReportHistoryItem } from '@/components/reports/types';

/** Vista de archivos (reportes) dentro de una carpeta del historial, con selector de fecha y listados. */
export const ReportsFileListView: React.FC<{
  historyPath: string[];
  monthNames: string[];
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  selectedWeek: string;
  setSelectedWeek: (value: string) => void;
  selectedMonth: number;
  setSelectedMonth: (value: number) => void;
  selectedYear: number;
  setSelectedYear: (value: number) => void;
  selectedBimestre: string;
  setSelectedBimestre: (value: string) => void;
  items: ReportHistoryItem[];
  onPreview: (report: ReportHistoryItem) => void;
}> = ({
  historyPath,
  monthNames,
  selectedDate,
  setSelectedDate,
  selectedWeek,
  setSelectedWeek,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  selectedBimestre,
  setSelectedBimestre,
  items,
  onPreview,
}) => {
  return (
              <div className="flex flex-col gap-6">
                {/* Cabecera de la carpeta con selector de fecha */}
                <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Reportes {historyPath[0] === 'Diario' ? 'Diarios' : historyPath[0] === 'Semanal' ? 'Semanales' : historyPath[0] === 'Mensual' ? 'Mensuales' : 'Bimestrales'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {historyPath[0] === 'Diario' ? 'Selecciona una fecha para ver los reportes de ese día.' : historyPath[0] === 'Semanal' ? 'Selecciona una semana para ver los reportes.' : 'Visualiza los reportes generados.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  {historyPath[0] === 'Diario' && (
                    <div className="shrink-0 w-full sm:w-auto">
                      <CustomCalendar
                        mode="date"
                        value={selectedDate}
                        onChange={setSelectedDate}
                        placeholder="Seleccionar Fecha"
                        align="left"
                      />
                    </div>
                  )}
                  {historyPath[0] === 'Semanal' && (
                    <div className="shrink-0 w-full sm:w-auto">
                      <CustomCalendar
                        mode="week"
                        value={selectedWeek}
                        onChange={setSelectedWeek}
                        placeholder="Seleccionar Semana"
                        align="left"
                      />
                    </div>
                  )}
                  {historyPath[0] === 'Mensual' && (
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                      <div className="relative">
                        <select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(Number(e.target.value))}
                          className="w-full sm:w-auto min-w-[180px] h-[52px] appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl px-5 py-3 pr-10 text-base font-bold text-gray-700 dark:text-gray-200 hover:border-blue-500/50 hover:bg-blue-50/30 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none cursor-pointer transition-all shadow-sm"
                        >
                          {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                      </div>
                      <div className="relative w-28">
                        <input
                          type="number"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(Number(e.target.value))}
                          className="w-full h-[52px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-base font-bold text-gray-700 dark:text-gray-200 hover:border-blue-500/50 hover:bg-blue-50/30 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-center transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                  {historyPath[0] === 'Bimestral' && (
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                      <div className="relative">
                        <select
                          value={selectedBimestre}
                          onChange={(e) => setSelectedBimestre(e.target.value)}
                          className="w-full sm:w-auto min-w-[180px] h-[52px] appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl px-5 py-3 pr-10 text-base font-bold text-gray-700 dark:text-gray-200 hover:border-blue-500/50 hover:bg-blue-50/30 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none cursor-pointer transition-all shadow-sm"
                        >
                          <option value="1">I Bimestre</option>
                          <option value="2">II Bimestre</option>
                          <option value="3">III Bimestre</option>
                          <option value="4">IV Bimestre</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                      </div>
                      <div className="relative w-28">
                        <input
                          type="number"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(Number(e.target.value))}
                          className="w-full h-[52px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-base font-bold text-gray-700 dark:text-gray-200 hover:border-blue-500/50 hover:bg-blue-50/30 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-center transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                  </div>
                </div>

                <div className="flex flex-col gap-8 w-full">
                  {items.length > 0 ? (
                    <>
                      <div className="bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl p-5 sm:p-6 w-full">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg" alt="Excel" className="w-5 h-5 object-contain" /> Reportes de Asistencia
                        </h3>
                        <ScrollableReportList
                          items={items}
                          type="asistencia"
                          historyPath={historyPath}
                          onPreview={onPreview}
                        />
                      </div>

                      <div className="bg-rose-50/30 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30 rounded-2xl p-5 sm:p-6 w-full">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg" alt="Word" className="w-5 h-5 object-contain" /> Reporte de Incidencias
                        </h3>
                        <ScrollableReportList
                          items={items}
                          type="incidencias"
                          historyPath={historyPath}
                          onPreview={() => alert('Vista previa del anexo')}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1">
                      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                          <SearchX size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Carpeta vacía</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                          Aún no se han generado reportes para esta sección en el periodo actual.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
            </div>
  );
};
