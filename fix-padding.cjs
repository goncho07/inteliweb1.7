const fs = require('fs');
let content = fs.readFileSync('modules/ClassroomsModule.tsx', 'utf-8');

// ClassroomSidebar gap-4 containers
content = content.replace(
  /<div className="flex flex-col gap-4 overflow-y-auto hidden-scrollbar pr-1 pb-4">/g,
  '<div className="flex flex-col gap-4 overflow-y-auto hidden-scrollbar px-4 pt-4 pb-4 bg-white dark:bg-[#111b21] h-full">'
);

// StudentsSidebar gap-3 container
content = content.replace(
  /<div className="flex flex-col gap-3 overflow-y-auto hidden-scrollbar pr-1 pb-4">/g,
  '<div className="flex flex-col gap-3 overflow-y-auto hidden-scrollbar px-4 pt-2 pb-4 bg-white dark:bg-[#111b21] h-full">'
);

fs.writeFileSync('modules/ClassroomsModule.tsx', content);
console.log('Fixed padding!');
