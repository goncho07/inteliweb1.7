const fs = require('fs');
let content = fs.readFileSync('modules/DashboardModule.tsx', 'utf-8');

// Add LabelList to imports
content = content.replace(
  /} from 'recharts';/,
  ', LabelList } from \'recharts\';'
);

// Fix the Asistencia chart
const asistenciaChartRegex = /<Bar dataKey="tardanza" name="Tardanzas" fill="\#f59e0b" radius=\[\[4,4,0,0\]\] barSize=\{12\} \/>\s*<Bar dataKey="ausente" name="Ausentes" fill="\#ef4444" radius=\[\[4,4,0,0\]\] barSize=\{12\} \/>/;

const newAsistenciaChart = `<Bar dataKey="tardanza" name="Tardanzas" fill="#f59e0b" radius={[4,4,0,0]} barSize={12}>
                          <LabelList dataKey="tardanza" position="top" style={{ fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />
                        </Bar>
                        <Bar dataKey="ausente" name="Ausentes" fill="#ef4444" radius={[4,4,0,0]} barSize={12}>
                          <LabelList dataKey="ausente" position="top" style={{ fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                        </Bar>`;

content = content.replace(asistenciaChartRegex, newAsistenciaChart);

// Unify icons and colors
content = content.replace(
  /<CalendarDays className="w-5 h-5 text-indigo-500" \/>/,
  `<div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0"><CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /></div>`
);
content = content.replace(
  /<AlertTriangle className="w-5 h-5 text-orange-500" \/>/,
  `<div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" /></div>`
);
content = content.replace(
  /<AlertTriangle className="w-5 h-5 text-rose-500" \/>/,
  `<div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" /></div>`
);
content = content.replace(
  /<Users className="w-5 h-5 text-orange-500" \/>/,
  `<div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-rose-600 dark:text-rose-400" /></div>`
);

// Fix colors for "Aulas con más incidencias" and "Estudiantes incidentes" to use red (#ef4444)
content = content.replace(
  /<Bar dataKey="score" name="Incidencias" fill="\#f43f5e" radius=\{\[0,4,4,0\]\} barSize=\{16\} \/>/,
  `<Bar dataKey="score" name="Incidencias" fill="#ef4444" radius={[0,4,4,0]} barSize={16} />`
);
content = content.replace(
  /<Bar dataKey="score" name="Incidencias" fill="\#f59e0b" radius=\{\[0,4,4,0\]\} barSize=\{16\} \/>/,
  `<Bar dataKey="score" name="Incidencias" fill="#ef4444" radius={[0,4,4,0]} barSize={16} />`
);

// Write changes
fs.writeFileSync('modules/DashboardModule.tsx', content);
console.log('Charts and icons fixed!');
