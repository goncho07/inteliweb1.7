const fs = require('fs');
const file = 'modules/ClassroomsModule.tsx';
let content = fs.readFileSync(file, 'utf8');

// Change `const IncidenciasPanel: React.FC<{` to `function IncidenciasPanel(props: {`
// Actually, it's easier to just change `const IncidenciasPanel = ` to `function`.
// But React.FC takes props. So:
// const IncidenciasPanel: React.FC<{ ... }> = ({ ... }) => {
// Let's replace `const IncidenciasPanel: React.FC<{` with `function IncidenciasPanel(props: {`
// Wait it's destructured: `}> = ({ classroom, ... }) => {`

// Let's do a simple hoisting by moving the entire IncidenciasPanel to the top, right after imports.
const incStart = content.indexOf('const IncidenciasPanel: React.FC<{');
if (incStart !== -1) {
    const incCode = content.slice(incStart);
    content = content.slice(0, incStart);
    
    // find end of imports
    const importsEnd = content.indexOf('export const ClassroomsModule');
    
    content = content.slice(0, importsEnd) + '\n\n' + incCode + '\n\n' + content.slice(importsEnd);
    fs.writeFileSync(file, content);
    console.log("Moved IncidenciasPanel to the top");
} else {
    console.log("Not found");
}
