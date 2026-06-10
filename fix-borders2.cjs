const fs = require('fs');
const files = ['components/Modals.tsx', 'components/UI.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/rounded-\[32px\]/g, 'rounded-2xl');
  content = content.replace(/rounded-\[28px\]/g, 'rounded-2xl');
  content = content.replace(/rounded-\[24px\]/g, 'rounded-2xl');
  content = content.replace(/rounded-3xl/g, 'rounded-2xl');
  content = content.replace(/rounded-\[20px\]/g, 'rounded-xl');
  fs.writeFileSync(file, content);
}
