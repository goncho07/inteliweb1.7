const fs = require('fs');

const files = ['modules/ClassroomsModule.tsx', 'components/ReportShared.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Format replacement 1
  content = content.replace(
    /\{report\.section\}\s*-\s*\{report\.level\.substring\(0,\s*3\)\.toUpperCase\(\)\}/g,
    "{report.grade.replace('° Grado', '°').replace(/ Años/i, ' AÑOS')}{report.level === 'Inicial' ? '' : report.section} - {report.level.substring(0, 3).toUpperCase()}"
  );

  // Format replacement 2
  content = content.replace(
    /\$\{report\.section\}\s*-\s*\$\{report\.level\.substring\(0,\s*3\)\.toUpperCase\(\)\}/g,
    "${report.grade.replace('° Grado', '°').replace(/ Años/i, ' AÑOS')}${report.level === 'Inicial' ? '' : report.section} - ${report.level.substring(0, 3).toUpperCase()}"
  );

  // Unconditionally render "Anexo Incidencias"
  // For pending state
  content = content.replace(
    /\{\s*isMensual\s*&&\s*\(\s*(<div className="bg-rose-50\/20[^>]+>[\s\S]*?)<\/div>\s*\)\s*\}/g,
    "$1</div>"
  );
  // Also the other wrapper for pending state in ReportShared
  
  // For generated state "Reporte de Incidencias" card (starts with <div className="bg-white)
  // In both files, the block is: 
  // {isMensual && (
  //    <div className="bg-white dark:bg-slate-800 ... 'Anexo Incidencias' ... 
  //        ...
  //    </div>
  // )}
  // We can just remove "{isMensual && (" and the matching ")}" at the end.
  content = content.replace(/\{\s*isMensual\s*&&\s*\(\s*(<div className="[^\"]*bg-white[^>]*>[\s\S]*?Anexo Incidencias[\s\S]*?<\/div>)\s*\)\s*\}/g, "$1");

  // In ClassroomsModule, there's `const isIncidencia = isMensual;`. We could ignore it.
  
  fs.writeFileSync(file, content);
});
