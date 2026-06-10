const fs = require('fs');
const content = fs.readFileSync('migrated_prompt_history/prompt_2026-02-15T17:55:36.300Z.json', 'utf8');
const data = JSON.parse(content);
const dashDiff = data.history.find(h => h.author === 'model' && h.payload && h.payload.entries && h.payload.entries.find(e => e.path === 'modules/DashboardModule.tsx'));

if(dashDiff) {
  const entry = dashDiff.payload.entries.find(e => e.path === 'modules/DashboardModule.tsx');
  fs.writeFileSync('old_dash.tsx', entry.diffs[0].replacement);
  console.log("Success");
} else {
  console.log("Not found in direct way, trying regex on whole file...");
  const regex = /"replacement": "(import React.*?export const DashboardModule: React\.FC<ModuleProps>.*?\}?);"/s;
  const match = content.match(regex);
  if(match) {
     const unescaped = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
     fs.writeFileSync('old_dash.tsx', unescaped);
     console.log("Success regex");
  } else {
     console.log("Regex failed too");
  }
}
