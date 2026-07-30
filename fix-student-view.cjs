const fs = require('fs');
let content = fs.readFileSync('modules/ClassroomsModule.tsx', 'utf-8');

const target = `<div className="bg-[#f0f4f8] dark:bg-slate-800/50 p-4 sm:p-5 shrink-0 rounded-t-[2rem]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {!isParentView && (
                  <button
                    onClick={onBack}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 dark:hover:text-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group"
                  >
                    <ArrowLeft
                      className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                      strokeWidth={3}
                    />
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div
                    className={\`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm \${student.avatarColor}\`}
                  >
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                      {student.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {student.id}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                      <span className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                        {student.grade} {student.section}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto hidden-scrollbar pb-1 md:pb-0">`;

const replacement = `<div className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-6 flex items-center shrink-0 border-b border-slate-200 dark:border-slate-800/60 z-20 gap-4">
              {!isParentView && (
                <button onClick={onBack} className="text-[#54656f] dark:text-[#aebac1] hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1 flex items-center gap-3">
                 <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm \${student.avatarColor}\`}>
                    {student.name.charAt(0)}
                 </div>
                 <div className="flex flex-col">
                    <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px] leading-tight">{student.name}</h2>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {student.grade} {student.section} • {student.id}
                    </span>
                 </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('modules/ClassroomsModule.tsx', content);
  console.log('Replaced StudentView header!');
} else {
  console.log('Not found string match!');
}
