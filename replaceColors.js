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

const replacements = {
  'text-neu-textDark': 'text-[#2d3748]',
  'text-neu-textLight': 'text-[#a0aec0]',
  'text-neu-text': 'text-[#4a5568]',
  'border-neu-textLight': 'border-[#a0aec0]',
  'bg-neu-textLight': 'bg-[#a0aec0]',
  'bg-neu-base': 'bg-[#e0e5ec]'
};

cssFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  for (const [search, replace] of Object.entries(replacements)) {
    if (content.includes(search)) {
      content = content.split(search).join(replace);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
