import { motion } from 'framer-motion';
import { Download, IdCard, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FilterChipGroup } from '@/features/users/components/FilterChipGroup';
import { generateBulkCarnets } from '@/features/users/utils';

/** Modal de generación de carnets QR por lote (filtrado por nivel/grado/sección). */
export const GenerateCarnetsModal: React.FC<{
  onClose: () => void;
  selectedLevel: string;
  changeLevel: (value: string) => void;
  selectedGrade: string;
  changeGrade: (value: string) => void;
  selectedSection: string;
  changeSection: (value: string) => void;
  gradeOptions: string[];
  sectionOptions: string[];
}> = ({
  onClose,
  selectedLevel,
  changeLevel,
  selectedGrade,
  changeGrade,
  selectedSection,
  changeSection,
  gradeOptions,
  sectionOptions,
}) => {
  return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shadow-sm">
                      <IdCard size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Generar Carnets</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Filtro de Lote</p>
                    </div>
                  </div>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={onClose}
                          aria-label="Cerrar generación de carnets"
                          className="rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                          <X size={20} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Cerrar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="space-y-6">
                  <FilterChipGroup
                    label="Nivel Educativo"
                    value={selectedLevel}
                    onChange={changeLevel}
                    options={[
                      { value: 'Todos', label: 'Todos', color: 'blue' },
                      { value: 'Inicial', label: 'Inicial', color: 'amber' },
                      { value: 'Primaria', label: 'Primaria', color: 'indigo' },
                      { value: 'Secundaria', label: 'Secundaria', color: 'pink' }
                    ]}
                  />

                  <div className="flex flex-col gap-6">
                    <FilterChipGroup
                      label=""
                      value={selectedGrade}
                      onChange={changeGrade}
                      disabled={selectedLevel === 'Todos'}
                      options={[
                        { value: 'Todos', label: 'Todos' },
                        ...gradeOptions.map(g => ({ value: g, label: g.replace(' Grado', '') }))
                      ]}
                    />
                    <FilterChipGroup
                      label="Sección"
                      value={selectedSection}
                      onChange={changeSection}
                      disabled={selectedGrade === 'Todos'}
                      options={[
                        { value: 'Todos', label: 'Todos' },
                        ...sectionOptions.map(s => ({ value: s, label: s }))
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="h-12 rounded-xl font-bold"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      generateBulkCarnets(selectedLevel, selectedGrade, selectedSection);
                      onClose();
                    }}
                    className="h-12 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none [&_svg]:size-[18px]"
                  >
                    <Download size={18} /> Generar PDF
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
  );
};
