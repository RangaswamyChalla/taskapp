const fs = require('fs');
let demoApps = fs.readFileSync('d:/AIDEN/taskapp/frontend/src/data/demoApps.js', 'utf8');
const bankingDemo = fs.readFileSync('C:/Users/admin/Downloads/banking-demo.html', 'utf8');

const regex = /export const BANK_DEMO = `[\s\S]*?`;/;
const replacement = 'export const BANK_DEMO = `\n' + bankingDemo.replace(/`/g, '\\`') + '\n`;';

fs.writeFileSync('d:/AIDEN/taskapp/frontend/src/data/demoApps.js', demoApps.replace(regex, replacement));
console.log('Successfully updated BANK_DEMO');
