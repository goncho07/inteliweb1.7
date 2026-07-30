const fs = require('fs');
let code = fs.readFileSync('modules/CitationsModule.tsx', 'utf-8');

// 1. Import getStudentAvatarUrl
code = code.replace("import { APP_CONFIG } from '../constants';", "import { APP_CONFIG, getStudentAvatarUrl } from '../constants';");

// 2. Add STUDENT_PHOTOS and helper function
const helperCode = `
const STUDENT_PHOTOS: Record<string, string> = {
  'Mateo Rojas': 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
  'Valentina Sol': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'Lucas Vega': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'Camila Paz': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'Juan Pérez': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'Luciana Delgado': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'Nicolas Salas': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'Valeria Quispe': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
};

const getAvatarForStudent = (studentName: string, id?: number) => {
  if (STUDENT_PHOTOS[studentName]) {
    return STUDENT_PHOTOS[studentName];
  }
  return getStudentAvatarUrl({ name: studentName, id });
};
`;

code = code.replace("export const CitationsModule:", helperCode + "\nexport const CitationsModule:");

// 3. Add selectedCategory state
code = code.replace(
  "const [selectedSection, setSelectedSection] = useState<string>('Todos');",
  "const [selectedSection, setSelectedSection] = useState<string>('Todos');\n  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');"
);

// 4. Category filter in useMemo
code = code.replace(
  "// Status filter",
  "// Category filter\n      if (selectedCategory !== 'Todos' && c.category !== selectedCategory) return false;\n\n      // Status filter"
);

code = code.replace(
  "[citationsList, searchTerm, selectedStatusTab, selectedLevel, selectedGrade, selectedSection]",
  "[citationsList, searchTerm, selectedStatusTab, selectedLevel, selectedGrade, selectedSection, selectedCategory]"
);

// 5. Replace Status filter bar to fit 6 tabs without horizontal scroll
const oldStatusFilter = `<div className="flex gap-2 px-2 pb-1 overflow-x-auto hidden-scrollbar">
              {['Todas', 'Pendiente', 'Confirmada', 'Reprogramada', 'Completada', 'Cancelada'].map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatusTab(st)}
                  className={\`px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors whitespace-nowrap \${
                    selectedStatusTab === st
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/60'
                      : 'bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] hover:bg-[#e9edef] dark:hover:bg-[#2a3942]'
                  }\`}
                >
                  {st}
                </button>
              ))}
            </div>`;

const newStatusFilter = `{/* STATUS FILTER */}
            <div className="grid grid-cols-6 gap-1 px-2 pb-1 w-full">
              {[
                { label: 'Todas', value: 'Todas' },
                { label: 'Pendiente', value: 'Pendiente' },
                { label: 'Confirmada', value: 'Confirmada' },
                { label: 'Reprog.', value: 'Reprogramada' },
                { label: 'Completada', value: 'Completada' },
                { label: 'Cancelada', value: 'Cancelada' },
              ].map(st => (
                <button
                  key={st.value}
                  onClick={() => setSelectedStatusTab(st.value)}
                  title={st.value}
                  className={\`px-1 py-1.5 text-[11px] font-semibold rounded-full transition-colors text-center truncate \${
                    selectedStatusTab === st.value
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                      : 'bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] hover:bg-[#e9edef] dark:hover:bg-[#2a3942]'
                  }\`}
                >
                  {st.label}
                </button>
              ))}
            </div>`;

code = code.replace(/\{\/\* STATUS FILTER \*\/\}[\s\S]*?<\/div>/, newStatusFilter);

// 6. Replace Educational filters to fit 4 dropdowns cleanly
const oldEduFilters = `<div className="flex gap-2 px-2 pb-1 overflow-x-auto hidden-scrollbar">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] text-[12px] px-2 py-1.5 rounded-full outline-none"
              >
                <option value="Todos">Nivel</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
              </select>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] text-[12px] px-2 py-1.5 rounded-full outline-none"
              >
                <option value="Todos">Grado</option>
                <option value="1°">1°</option>
                <option value="2°">2°</option>
                <option value="3°">3°</option>
                <option value="4°">4°</option>
                <option value="5°">5°</option>
                <option value="6°">6°</option>
              </select>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] text-[12px] px-2 py-1.5 rounded-full outline-none"
              >
                <option value="Todos">Sec.</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>`;

const newEduFilters = `{/* EDUCATIONAL & CATEGORY FILTERS */}
            <div className="grid grid-cols-4 gap-1 px-2 pb-1 w-full">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] text-[11px] font-semibold px-1.5 py-1.5 rounded-lg outline-none cursor-pointer truncate"
              >
                <option value="Todos">Nivel</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
              </select>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] text-[11px] font-semibold px-1.5 py-1.5 rounded-lg outline-none cursor-pointer truncate"
              >
                <option value="Todos">Grado</option>
                <option value="1°">1°</option>
                <option value="2°">2°</option>
                <option value="3°">3°</option>
                <option value="4°">4°</option>
                <option value="5°">5°</option>
                <option value="6°">6°</option>
              </select>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] text-[11px] font-semibold px-1.5 py-1.5 rounded-lg outline-none cursor-pointer truncate"
              >
                <option value="Todos">Sec.</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] text-[11px] font-semibold px-1.5 py-1.5 rounded-lg outline-none cursor-pointer truncate"
              >
                <option value="Todos">Motivo</option>
                <option value="Académico">Académico</option>
                <option value="Incidencias">Incidencias</option>
                <option value="Gestión">Gestión</option>
                <option value="Otros">Otros</option>
              </select>
            </div>`;

code = code.replace(/\{\/\* EDUCATIONAL FILTERS \*\/\}[\s\S]*?<\/div>/, newEduFilters);

// 7. Update avatars in list item
const oldListAvatar = `<div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-lg shrink-0">
                        {c.student.charAt(0)}
                      </div>
                    </div>`;

const newListAvatar = `<div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                        <img
                          src={getAvatarForStudent(c.student, c.id)}
                          alt={c.student}
                          className="w-full h-full object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>`;

code = code.replace(oldListAvatar, newListAvatar);

// 8. Update avatar in header
const oldHeaderAvatar = `<div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shrink-0">
                    {activeCitation.student.charAt(0)}
                  </div>`;

const newHeaderAvatar = `<div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                    <img
                      src={getAvatarForStudent(activeCitation.student, activeCitation.id)}
                      alt={activeCitation.student}
                      className="w-full h-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  </div>`;

code = code.replace(oldHeaderAvatar, newHeaderAvatar);

fs.writeFileSync('modules/CitationsModule.tsx', code);
console.log("CitationsModule updated successfully.");
