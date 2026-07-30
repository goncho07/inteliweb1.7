const fs = require('fs');
let content = fs.readFileSync('modules/ClassroomLeaderboard.tsx', 'utf-8');

const regex = /<div className="flex flex-col h-full bg-\[\#EFEAE2\] dark:bg-\[\#0b141a\] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">([\s\S]*?)<\/div>\s*<\/div>\s*<div className="flex-1 overflow-y-auto hidden-scrollbar pb-8">/;

if (content.match(regex)) {
  // It replaced it! I need to append `</div>` before the final `);` of the return in ClassroomLeaderboard
  
  // Actually, wait, let's find the main component return.
  let lines = content.split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
     if (lines[i].includes('export const ClassroomLeaderboard')) {
         break;
     }
  }
}
