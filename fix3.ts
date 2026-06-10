import fs from 'fs';
let code = fs.readFileSync('modules/CitationsModule.tsx', 'utf8');

code = code.replace(
`  ];me: '08:00 AM', status: 'Confirmada' },
    { id: 16, student: 'Ariana Vega', parent: 'Esteban Vega', relationship: 'Padre', grade: '3° A', reason: 'Uso de celular en clase', category: 'Incidencias', date: '29/04/2026', time: '10:00 AM', status: 'Pendiente', incidents: [{ type: "Uso de celular (Reincidencia 3)", date: "27/04/2026" }] },
  ];`,
`    { id: 16, student: 'Ariana Vega', parent: 'Esteban Vega', relationship: 'Padre', grade: '3° A', reason: 'Uso de celular en clase', category: 'Incidencias', date: '29/04/2026', time: '10:00 AM', status: 'Pendiente', incidents: [{ type: "Uso de celular (Reincidencia 3)", date: "27/04/2026" }] },
  ];`
);

fs.writeFileSync('modules/CitationsModule.tsx', code);
