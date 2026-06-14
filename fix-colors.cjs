const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      // Replace text-[#1A1814] with text-[var(--text-primary)]
      content = content.replace(/text-\[\#1A1814\]/g, 'text-[var(--text-primary)]');
      
      // Replace inline styles style={{ color: '#1A1814' }} with className / or just use var
      content = content.replace(/style=\{\{ color: '\#1A1814' \}\}/g, "style={{ color: 'var(--text-primary)' }}");

      // Replace style={{ color: tokens.textPrimary }} if any
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src/app'));
processDirectory(path.join(__dirname, 'src/components'));
console.log('Done.');
