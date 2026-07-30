const fs = require('fs');
let content = fs.readFileSync('modules/ClassroomsModule.tsx', 'utf-8');

// Fix ClassroomSidebar margins
content = content.replace(
  /className="bg-\[\#f0f2f5\] dark:bg-\[\#202c33\] h-\[59px\] px-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800\/60 -mx-4 -mt-4 mb-4"/g,
  'className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60"'
);

// Fix StudentsSidebar margins
content = content.replace(
  /className="bg-\[\#f0f2f5\] dark:bg-\[\#202c33\] h-\[59px\] px-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800\/60 -mx-4 -mt-4"/g,
  'className="bg-[#f0f2f5] dark:bg-[#202c33] h-[59px] px-4 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-slate-800/60"'
);

content = content.replace(
  /<div className="p-3 border-b border-slate-200 dark:border-slate-700\/50 flex flex-col gap-3 mb-4 -mx-4">/g,
  '<div className="px-3 py-3 border-b border-slate-200 dark:border-slate-700/50 flex flex-col gap-3 bg-white dark:bg-[#111b21]">'
);

fs.writeFileSync('modules/ClassroomsModule.tsx', content);
console.log('Fixed margins!');
