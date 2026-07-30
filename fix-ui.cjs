const fs = require('fs');
let content = fs.readFileSync('components/UI.tsx', 'utf-8');

content = content.replace(
  "className={`${expanded ? 'text-[15px] font-bold' : 'text-xs font-bold text-center px-1'} tracking-tight whitespace-nowrap`}",
  "className={`${expanded ? 'text-[15px] font-bold' : 'text-[11px] font-bold text-center px-1 w-full truncate'} tracking-tight whitespace-nowrap`}"
);

fs.writeFileSync('components/UI.tsx', content);
console.log('UI.tsx updated!');
