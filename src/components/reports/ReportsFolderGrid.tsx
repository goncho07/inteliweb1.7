import React from 'react';
import { Clock, Layers } from 'lucide-react';

import { getFolderStyle } from '@/components/reports/folderStyles';

/** Vista de carpetas (Diario, Semanal, Mensual, Bimestral) del historial de reportes. */
export const ReportsFolderGrid: React.FC<{
  items: string[];
  historyPath: string[];
  setHistoryPath: (path: string[]) => void;
}> = ({ items, historyPath, setHistoryPath }) => {
  return (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-2">
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-5 flex gap-4 items-start">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                      <Layers size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Distribución de Reportes</h4>
                      <p className="text-sm font-medium text-blue-800/80 dark:text-blue-200/70 mb-2">
                        Ahora el sistema de reportes genera las cantidades exactas requeridas:
                      </p>
                      <ul className="text-sm text-blue-800/80 dark:text-blue-200/70 space-y-1 list-disc list-inside">
                        <li><strong>Diarios:</strong> 5 reportes (Lunes a Viernes).</li>
                        <li><strong>Semanales:</strong> 4 reportes (de las semanas del mes actual).</li>
                        <li><strong>Mensuales:</strong> 5 reportes (de los meses del año escolar).</li>
                        <li><strong>Bimestrales:</strong> 4 reportes.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl p-5 flex gap-4 items-start">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-2">Reportes Figurados pero Deshabilitados</h4>
                      <p className="text-sm text-amber-800/80 dark:text-amber-200/70 leading-relaxed font-medium">
                        Se implementó una lógica de "futuro" basado en el tiempo actual para los reportes por semana (y los demás tiempos también). Si estás en las semanas 1 o 2 del mes actual, los reportes correspondientes a la semana 3 y 4 saldrán figurados pero en un tono más atenuado/gris, con la etiqueta de <span className="font-bold px-1.5 py-0.5 rounded-md bg-amber-200/50 dark:bg-amber-800/50">Próximamente</span> y sin opciones disponibles para su descarga.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {items.map(folderName => {
                    const style = getFolderStyle(folderName);
                    return (
                      <button
                        key={folderName}
                        onClick={() => setHistoryPath([...historyPath, folderName])}
                        className={`group relative flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${style.borderClass}`}
                      >
                      {/* Background subtle glow on hover */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${style.bgClass}`}></div>

                      <div className="relative w-28 h-28 mb-5 drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
                        <img
                          src="https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/file-folder.svg"
                          alt="Folder"
                          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200 opacity-100 group-hover:opacity-0"
                        />
                        <img
                          src="https://unpkg.com/fluentui-emoji@1.3.0/icons/modern/open-file-folder.svg"
                          alt="Open Folder"
                          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                        />
                      </div>

                      <div className="relative z-10 flex flex-col items-center">
                        <h4 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-1">{folderName}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{style.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              </div>
  );
};
