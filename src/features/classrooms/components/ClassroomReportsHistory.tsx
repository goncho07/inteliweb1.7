import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, MoreVertical, Search } from 'lucide-react';
import { getFolderStyle } from '@/components/reports/folderStyles';
import { ReportPreviewModal } from '@/components/reports/ReportPreviewModal';
import { ScrollableReportList } from '@/components/reports/ScrollableReportList';
import { ReportHistoryItem } from '@/components/reports/types';
import { MOCK_USERS } from '@/data/users';
import { getScopedReportsHistory } from '@/features/classrooms/utils';

export const ClassroomReportsHistory: React.FC<{
  classroom: { level: string; grade: string; section: string };
  globalDate?: Date;
  onBack: () => void;
  setHeaderData: React.Dispatch<
    React.SetStateAction<{
      title?: string;
      subtitle?: string;
      icon?: any;
      onBack?: () => void;
    } | null>
  >;
  onDownloadReport: (
    type: "Asistencia" | "Incidencias",
    period: "Día" | "Semana" | "Mes" | "Bimestre",
    month?: number,
    bimestre?: number,
  ) => void;
}> = ({ classroom, globalDate, onBack, setHeaderData, onDownloadReport }) => {
  const [historyPath, setHistoryPath] = useState<string[]>([]);
  const [previewReport, setPreviewReport] = useState<ReportHistoryItem | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const week = Math.ceil(
      Math.floor(
        (d.getTime() - new Date(year, 0, 1).getTime()) / (24 * 60 * 60 * 1000),
      ) / 7,
    );
    return `${year}-W${week.toString().padStart(2, "0")}`;
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedBimestre, setSelectedBimestre] = useState("1");

  const scopedReports = useMemo(
    () => getScopedReportsHistory(classroom, globalDate),
    [classroom, globalDate],
  );

  const currentFolderContent = useMemo(() => {
    if (historyPath.length === 0) {
      return {
        type: "folders",
        items: ["Diario", "Semanal", "Mensual", "Bimestral"],
      };
    }

    const currentFolder = historyPath[historyPath.length - 1];
    const filteredFiles = scopedReports.filter((r) => r.type === currentFolder);

    return {
      type: "files",
      items: filteredFiles,
    };
  }, [historyPath, scopedReports]);

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const tutor = useMemo(() => {
    return MOCK_USERS.find(
      (u) =>
        u.role === "Docente" &&
        u.level === classroom.level &&
        u.grade === classroom.grade &&
        u.section === classroom.section,
    );
  }, [classroom]);

  useEffect(() => {
    setHeaderData({
      title:
        historyPath.length > 0
          ? `Reportes ${
              historyPath[0] === "Diario"
                ? "Diarios"
                : historyPath[0] === "Semanales"
                  ? "Semanales"
                  : historyPath[0] === "Mensual"
                    ? "Mensuales"
                    : "Bimestrales"
            }`
          : "Historial de Reportes",
      subtitle:
        historyPath.length > 0
          ? historyPath.join(" / ")
          : "Registro completo de asistencia e incidencias del aula",
       
      onBack: historyPath.length > 0 ? () => setHistoryPath([]) : onBack,
      icon: BookOpen,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyPath, setHeaderData]);

  return (
    <>
      <div className={`w-full lg:w-[320px] xl:w-[340px] shrink-0 flex flex-col h-[600px] lg:h-full bg-white dark:bg-[#111b21] border-r border-slate-200 dark:border-slate-800/60 z-10 animate-in fade-in slide-in-from-left-4 duration-500`}>
         <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col hidden-scrollbar px-4 pt-4 pb-4">
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <h1 className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">Reportes</h1>
            </div>
          </div>
         <div className="flex flex-col gap-3">
             {["Diario", "Semanal", "Mensual", "Bimestral"].map((folderName) => {
                 const style = getFolderStyle(folderName, false);
                 const isActive = historyPath[0] === folderName;
                 return (
                     <button
                         key={folderName}
                         onClick={() => setHistoryPath([folderName])}
                         className={`bg-orange-50/80 dark:bg-orange-900/20 rounded-[24px] border-2 p-5 flex flex-row items-center gap-5 text-left shadow-sm hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md transition-all group ${isActive ? "border-orange-400 dark:border-orange-500 ring-1 ring-orange-400/20" : "border-orange-100/50 dark:border-orange-800/30"}`}
                     >
                        <div className={`w-16 h-16 shrink-0 transition-transform flex items-center justify-center rounded-[16px] ${isActive ? "scale-110 bg-white/60 dark:bg-slate-900/60" : "group-hover:scale-110 bg-white/40 dark:bg-slate-900/40"}`}>
                           <img src={`https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/${isActive ? 'open-file-folder' : 'file-folder'}.svg`} alt="Folder" className="w-[40px] h-[40px] object-contain drop-shadow-sm" />
                        </div>
                        <div className="flex flex-col flex-1 w-full justify-center">
                             <h4 className={`font-extrabold text-[18px] mb-1.5 transition-colors ${isActive ? "text-orange-700 dark:text-orange-400" : "text-[#1A2642] dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400"}`}>{folderName}</h4>
                             <p className="text-[14px] text-orange-600/80 dark:text-orange-400 font-bold leading-tight truncate">{style.subtitle}</p>
                        </div>
                     </button>
                 )
             })}
         </div>
         </div>
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 relative h-[650px] lg:h-auto bg-[#EFEAE2] dark:bg-[#0b141a] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60 shadow-sm z-20">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px]">Detalle de Reportes</h2>
            <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
              <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
              <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
            </div>
        </div>
        <div className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto custom-scrollbar">
            {historyPath.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-center p-8">
                     <div className="w-32 h-32 mb-6 opacity-80 transition-transform hover:scale-105 duration-500">
                         <img src="https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/open-file-folder.svg" alt="Folder" className="w-full h-full object-contain filter drop-shadow-xl saturate-150" />
                     </div>
                     <h2 className="text-[24px] font-black text-slate-800 dark:text-white mb-3 tracking-tight">Selecciona una Carpeta</h2>
                     <p className="text-slate-500 dark:text-slate-400 text-[15px] font-medium max-w-md mx-auto leading-relaxed">Navega por las carpetas en la barra lateral para ver los reportes de asistencia e incidencias según el periodo deseado.</p>
                 </div>
            ) : (
              <div className="mt-1 h-full flex flex-col">
                {/* File List */}

                {currentFolderContent.items &&
                currentFolderContent.items.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-800/40 rounded-[24px] p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                      <h3 className="text-[18px] font-black text-slate-800 dark:text-emerald-100 flex items-center gap-3 mb-5 tracking-tight">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg"
                            alt="Excel"
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        Reportes de Asistencia
                      </h3>
                      <ScrollableReportList
                        items={currentFolderContent.items}
                        type="asistencia"
                        historyPath={historyPath}
                        onPreview={setPreviewReport}
                      />
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-800/40 rounded-[24px] p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                      <h3 className="text-[18px] font-black text-slate-800 dark:text-rose-100 flex items-center gap-3 mb-5 tracking-tight">
                        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center border border-rose-100 dark:border-rose-800/50">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg"
                            alt="Word"
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        Reporte de Incidencias
                      </h3>
                      <ScrollableReportList
                        items={currentFolderContent.items}
                        type="incidencias"
                        historyPath={historyPath}
                        onPreview={() => {
                          alert("Vista previa del anexo de incidencias");
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px]">
                    <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700/50">
                      <FileText size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-[18px] font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                      No hay reportes
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-[14px] max-w-sm">
                      No se encontraron reportes para la carpeta seleccionada en este salón.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <AnimatePresence>
            {previewReport && (
              <ReportPreviewModal
                report={previewReport}
                onClose={() => setPreviewReport(null)}
              />
            )}
          </AnimatePresence>
      </div>
    </>
  );
};
