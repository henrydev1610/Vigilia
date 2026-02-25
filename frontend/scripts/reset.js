const fs = require('fs');
const path = require('path');

const targets = ['node_modules', 'package-lock.json', '.expo', '.expo-shared'];

for (const target of targets) {
  const fullPath = path.join(process.cwd(), target);
  if (!fs.existsSync(fullPath)) {
    continue;
  }
  fs.rmSync(fullPath, { recursive: true, force: true });
  console.log(`removed ${target}`);
}

console.log('Reset completed. Run `npm install` if not already triggered by the script.');
