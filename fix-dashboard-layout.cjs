const fs = require('fs');
let content = fs.readFileSync('modules/DashboardModule.tsx', 'utf-8');

const returnStart = content.indexOf('return (');
if (returnStart === -1) throw new Error("Could not find return (");

// Let's first extract the "Enlaces Rapidos" section up to before "COLUMNA 2:"
// and then extract the "KPI Charts" data.

// Actually I know the exact JSX that I need. I will extract the blocks and reassemble.

const fastLinksRegex = /<div className="flex-1 overflow-y-auto hidden-scrollbar p-3 space-y-3">([\s\S]*?)<\/section>/;
const fastLinksMatch = content.match(fastLinksRegex);
const fastLinks = fastLinksMatch ? fastLinksMatch[0].replace('</section>', '') : '';

const chartsRegex = /\{\/\* Welcome Banner \*\/\}([\s\S]*?)\{\/\* Ranking Estudiantes \*\/\}/;
// Wait, Ranking Estudiantes is followed by the rest of the file.
const mainAreaRegex = /<div className="max-w-4xl mx-auto space-y-6">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/;

// It's safer to just let me extract what's inside the charts and rebuild everything.
