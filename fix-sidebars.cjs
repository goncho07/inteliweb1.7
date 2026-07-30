const fs = require('fs');
let content = fs.readFileSync('modules/ClassroomsModule.tsx', 'utf-8');

// Replace ClassroomSidebar header (Todos)
content = content.replace(
  '<div className="bg-slate-100/50 dark:bg-slate-800/30 p-4 border-b border-slate-200 dark:border-slate-700/50 -mx-4 -mt-4 mb-4">\n            <h2 className="font-extrabold text-[15px] text-slate-800 dark:text-slate-100 flex items-center gap-2 px-1 tracking-wider uppercase">\n              <School className="w-5 h-5 text-blue-600" /> NIVELES EDUCATIVOS\n            </h2>\n          </div>',
  `<div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60 -mx-4 -mt-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                <School className="w-5 h-5" />
              </div>
              <h1 className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">Niveles Educativos</h1>
            </div>
          </div>`
);

// Replace ClassroomSidebar header (Todos - Grade)
content = content.replace(
  '<div className="bg-slate-100/50 dark:bg-slate-800/30 p-4 border-b border-slate-200 dark:border-slate-700/50 -mx-4 -mt-4 mb-4 flex items-center justify-between">\n            <button\n              onClick={() => {\n                setSelectedLevel("Todos");\n              }}\n              className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-[15px]"\n            >\n              <ChevronLeft className="w-5 h-5" /> Niveles Educativos\n            </button>\n          </div>',
  `<div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60 -mx-4 -mt-4 mb-4">
            <button
              onClick={() => setSelectedLevel("Todos")}
              className="flex items-center gap-2 font-semibold text-[#54656f] dark:text-[#aebac1] hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-[15px]"
            >
              <ChevronLeft className="w-5 h-5" /> Niveles Educativos
            </button>
          </div>`
);

// Replace ClassroomSidebar header (Grade selection)
content = content.replace(
  '<div className="bg-slate-100/50 dark:bg-slate-800/30 p-4 border-b border-slate-200 dark:border-slate-700/50 -mx-4 -mt-4 mb-4 flex items-center justify-between">\n            <button\n              onClick={() => {\n                setSelectedGrade("Todos");\n              }}\n              className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-[15px]"\n            >\n              <ChevronLeft className="w-5 h-5" /> {selectedGrade}\n            </button>\n          </div>',
  `<div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60 -mx-4 -mt-4 mb-4">
            <button
              onClick={() => setSelectedGrade("Todos")}
              className="flex items-center gap-2 font-semibold text-[#54656f] dark:text-[#aebac1] hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-[15px]"
            >
              <ChevronLeft className="w-5 h-5" /> {selectedGrade}
            </button>
          </div>`
);

fs.writeFileSync('modules/ClassroomsModule.tsx', content);
console.log('ClassroomsModule headers updated!');
