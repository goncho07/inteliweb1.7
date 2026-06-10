const fs = require('fs');
let appContent = fs.readFileSync('App.tsx', 'utf8');
appContent = appContent.replace(/Director General/g, 'Carlos Cerquera');
appContent = appContent.replace(/Admin Principal/g, 'Docente Secundaria');
appContent = appContent.replace(/admin@peepos.edu.pe/g, 'ccerquera@pedro-poveda.edu.pe');
appContent = appContent.replace(/background: 'bg-gradient-to-tr from-blue-600 to-cyan-500'/g, 'background: ""');

fs.writeFileSync('App.tsx', appContent);

let profileContent = fs.readFileSync('modules/ProfileModule.tsx', 'utf8');
profileContent = profileContent.replace(/Director General con más de 15 años de experiencia/g, 'Docente de Secundaria del colegio Pedro Poveda, encargado del curso de Aritmética, Geometría y Razonamiento Matemático.');
profileContent = profileContent.replace(/Director General/g, 'Docente');
profileContent = profileContent.replace(/Admin Principal/g, 'Carlos Cerquera');
profileContent = profileContent.replace(/admin@peepos.edu.pe/g, 'ccerquera@pedro-poveda.edu.pe');

fs.writeFileSync('modules/ProfileModule.tsx', profileContent);
