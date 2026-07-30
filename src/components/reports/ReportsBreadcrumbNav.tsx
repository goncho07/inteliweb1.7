import React from 'react';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';

/** Barra de navegación (breadcrumb) del historial de reportes de `ReportsModule`. */
export const ReportsBreadcrumbNav: React.FC<{
  historyPath: string[];
  setHistoryPath: React.Dispatch<React.SetStateAction<string[]>>;
}> = ({ historyPath, setHistoryPath }) => {
  return (
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-t-[28px] overflow-x-auto">
            {historyPath.length > 0 && (
              <button
                onClick={() => setHistoryPath(historyPath.slice(0, -1))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors mr-2 border border-gray-200 dark:border-slate-700 shrink-0"
                title="Retroceder"
              >
                <ArrowLeft size={16} />
                Atrás
              </button>
            )}
            <button
              onClick={() => setHistoryPath([])}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shrink-0 ${historyPath.length === 0 ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              <Home size={16} />
              Inicio
            </button>

            {historyPath.map((path, index) => (
              <React.Fragment key={path}>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
                <button
                  onClick={() => setHistoryPath(historyPath.slice(0, index + 1))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shrink-0 whitespace-nowrap ${index === historyPath.length - 1 ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                >
                  {path}
                </button>
              </React.Fragment>
            ))}
          </div>
  );
};
