const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'client', 'src');

function findCssFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findCssFiles(filePath, fileList);
    } else if (filePath.endsWith('.css')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const cssFiles = findCssFiles(directoryPath);

cssFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let lines = content.split('\n');
  let changed = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('@apply') && lines[i].includes(']; ')) {
      // If the line has an @apply and a trailing bracket semicolon space
      // meaning it prematurely ends the @apply before the actual end of line semicolon
      // We will replace all occurrences of `]; ` with `] `
      let orig = lines[i];
      lines[i] = lines[i].split(']; ').join('] ');
      if (orig !== lines[i]) changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log(`Fixed ${file}`);
  }
});
