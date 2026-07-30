import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

/** Dropdown en cascada (Nivel → Grado → Sección) usado en la columna de aula de la tabla de usuarios. */
export const HierarchicalDropdownFilter = ({
  selectedLevel, setSelectedLevel,
  selectedGrade, setSelectedGrade,
  selectedSection, setSelectedSection,
  gradeOptions, sectionOptions,
  isOpen, onToggle
}: any) => {
  let currentStep = 'level';
  if (selectedLevel !== 'Todos' && selectedGrade === 'Todos') currentStep = 'grade';
  if (selectedGrade !== 'Todos') currentStep = 'section';

  let buttonLabel = 'NIVEL / AULA';
  if (selectedSection !== 'Todos') buttonLabel = `${selectedGrade.replace(' Grado', '')} ${selectedSection}`;
  else if (selectedGrade !== 'Todos') buttonLabel = selectedGrade.replace(' Grado', '');
  else if (selectedLevel !== 'Todos') buttonLabel = selectedLevel;

  return (
    <div className="relative inline-block text-left font-poppins">
      <button
        onClick={onToggle}
        className={`flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors w-48 shadow-sm border border-gray-200 dark:border-slate-700 ${
          selectedLevel !== 'Todos'
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
            : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
        }`}
      >
        <span className="truncate">{buttonLabel.toUpperCase()}</span>
        <ChevronDown size={14} className={`transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle}></div>
          <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 z-20 py-1 overflow-hidden">

            {currentStep === 'grade' && (
              <button
                onClick={() => setSelectedLevel('Todos')}
                className="w-full text-left px-4 py-2 text-xs font-bold text-gray-500 hover:text-blue-600 hover:bg-gray-50 flex items-center gap-1 border-b border-gray-100 dark:border-slate-700"
              >
                <ChevronLeft size={14} /> Volver a Niveles
              </button>
            )}
            {currentStep === 'section' && (
              <button
                onClick={() => setSelectedGrade('Todos')}
                className="w-full text-left px-4 py-2 text-xs font-bold text-gray-500 hover:text-blue-600 hover:bg-gray-50 flex items-center gap-1 border-b border-gray-100 dark:border-slate-700"
              >
                <ChevronLeft size={14} /> Volver a Grados
              </button>
            )}

            <div className="max-h-60 overflow-y-auto">
              {currentStep === 'level' && ['Inicial', 'Primaria', 'Secundaria'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setSelectedLevel(opt)}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center justify-between transition-colors text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700"
                >
                  {opt}
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}

              {currentStep === 'grade' && gradeOptions.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => setSelectedGrade(opt)}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center justify-between transition-colors text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700"
                >
                  {opt.replace(' Grado', '')}
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}

              {currentStep === 'section' && sectionOptions.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSelectedSection(selectedSection === opt ? 'Todos' : opt);
                    onToggle();
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center justify-between transition-colors ${
                    selectedSection === opt
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700'
                  }`}
                >
                  Sección {opt}
                  {selectedSection === opt && <Check size={16} className="text-blue-600 dark:text-blue-400" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
