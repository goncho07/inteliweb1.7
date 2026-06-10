const fs = require('fs');

const content = fs.readFileSync('modules/CitationsModule.tsx', 'utf8');
const returnBody = content.substring(content.indexOf('return ('));

const tagRegex = /<\/?([a-zA-Z0-9_\.]+)(?:\s+[^>]*)?\/?>/g;
let stack = [];
let match;
while ((match = tagRegex.exec(returnBody)) !== null) {
  const fullTag = match[0];
  const tagName = match[1];

  if (fullTag.endsWith('/>')) {
    continue;
  }
  
  if (fullTag.startsWith('</')) {
    const last = stack.pop();
    if (last !== tagName) {
      console.log(`Mismatch! Expected to close ${last} but got ${tagName} at index ${match.index}. surrounding context:`);
      const context = returnBody.substring(Math.max(0, match.index - 50), match.index + 50);
      console.log(context);
      break;
    }
  } else {
    // some tags we ignore
    if (tagName === 'img' || tagName === 'input' || tagName === 'br' || tagName === 'hr' || tagName === 'textarea' || tagName === 'col') {
      continue;
    }
    stack.push(tagName);
  }
}
console.log("Remaining on stack at end:", stack);
