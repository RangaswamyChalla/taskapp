const fs = require('fs');
const filePath = 'C:/Users/admin/Downloads/logistics-demo_1.html';
const destPath = 'd:/AIDEN/taskapp/frontend/src/data/demoApps.js';

try {
  const logisticsDemo = fs.readFileSync(filePath, 'utf8');
  let content = fs.readFileSync(destPath, 'utf8');
  content += '\nexport const LOGISTICS_DEMO = `\n' + logisticsDemo.replace(/`/g, '\\`') + '\n`;\n';
  fs.writeFileSync(destPath, content);
  console.log('Successfully appended LOGISTICS_DEMO');
} catch (e) {
  console.error(e);
}
