const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
};

const files = walk('./src').concat(walk('./modules')).concat(walk('./components'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  content = content.replace(/rounded-\[32px\]/g, 'rounded-xl');
  content = content.replace(/rounded-\[28px\]/g, 'rounded-xl');
  content = content.replace(/rounded-\[24px\]/g, 'rounded-xl');
  content = content.replace(/rounded-\[20px\]/g, 'rounded-xl');
  content = content.replace(/rounded-\[16px\]/g, 'rounded-xl');
  content = content.replace(/rounded-3xl/g, 'rounded-xl');
  content = content.replace(/rounded-2xl/g, 'rounded-xl');
  content = content.replace(/rounded-\[12px\]/g, 'rounded-xl');

  if(content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
