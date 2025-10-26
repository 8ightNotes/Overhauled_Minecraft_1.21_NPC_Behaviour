// validate_entities_json.js - quick validator to parse all behavior JSON files
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'entities');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.behavior.json'));
let ok = true;
files.forEach(f => {
  const p = path.join(dir, f);
  try {
    const raw = fs.readFileSync(p,'utf8');
    JSON.parse(raw);
    console.log('OK:', f);
  } catch (e) {
    ok = false;
    console.error('ERROR parsing', f, e.message);
  }
});
if (!ok) process.exit(2);
console.log('All parsed successfully');
