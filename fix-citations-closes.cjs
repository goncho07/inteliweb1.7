const fs = require('fs');
let content = fs.readFileSync('modules/CitationsModule.tsx', 'utf8');

content = content.replace(
  /<\/AnimatePresence>\n\s*<\/div>\n\s*<\/motion.div>\n\s*\);\n\s*\};/,
  `</AnimatePresence>\n      </div>\n      </div>\n    </motion.div>\n  );\n};`
);

fs.writeFileSync('modules/CitationsModule.tsx', content);
