const fs = require('fs');
let content = fs.readFileSync('modules/ClassroomsModule.tsx', 'utf-8');

const regex = /<div className="bg-\[\#f0f4f8\] dark:bg-slate-800\/50 p-4 sm:p-5 shrink-0 rounded-t-\[2rem\]">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<div className="p-4 sm:p-5 space-y-4">/;

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
                  <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-[16px] leading-tight truncate">{student.name}</h2>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {student.grade} {student.section} • DNI: {student.dni}
                  </span>
               </div>
            </div>
            <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1] shrink-0">
               <Search className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
               <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
            </div>
          </div>
          <div className="p-4 sm:p-5 space-y-4">`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('modules/ClassroomsModule.tsx', content);
  console.log('Replaced StudentView with regex!');
} else {
  console.log('Regex no match!');
}
