const fs = require('fs');
let content = fs.readFileSync('modules/ClassroomsModule.tsx', 'utf-8');

const targetStr = `<div className="bg-slate-100/50 dark:bg-slate-800/30 p-4 border-b border-slate-200 dark:border-slate-700/50 -mx-4 -mt-4 mb-4 flex flex-col gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-[15px]"
        >
          <ChevronLeft className="w-5 h-5" /> {classroom.grade} {classroom.section}
        </button>`;

const replacementStr = `<div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60 -mx-4 -mt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-semibold text-[#54656f] dark:text-[#aebac1] hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-[15px]"
        >
          <ChevronLeft className="w-5 h-5" /> {classroom.grade} {classroom.section}
        </button>
      </div>
      <div className="p-3 border-b border-slate-200 dark:border-slate-700/50 flex flex-col gap-3 mb-4 -mx-4">`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('modules/ClassroomsModule.tsx', content);
console.log('StudentsSidebar header updated!');
