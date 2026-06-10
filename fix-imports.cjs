const fs = require('fs');
const file = 'modules/ClassroomsModule.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix the framer-motion import
content = content.replace('import { ListFilter, ArrowDown,  motion, AnimatePresence } from "framer-motion";', 'import { motion, AnimatePresence } from "framer-motion";');

// Add to lucide-react if not there
if (!content.includes('ListFilter,') && content.includes('from "lucide-react"')) {
    content = content.replace('} from "lucide-react";', '  ListFilter,\n  ArrowDown,\n} from "lucide-react";');
}

fs.writeFileSync(file, content);
console.log("fixed imports");
