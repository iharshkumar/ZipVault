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

const components = {
  'neu-flat-sm': `bg-[#e0e5ec] rounded-2xl; box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.5);`,
  'neu-flat': `bg-[#e0e5ec] rounded-[1.5rem]; box-shadow: 9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5);`,
  'neu-pressed-sm': `bg-[#e0e5ec] rounded-2xl; box-shadow: inset 4px 4px 8px rgba(163, 177, 198, 0.7), inset -4px -4px 8px rgba(255, 255, 255, 0.8);`,
  'neu-pressed': `bg-[#e0e5ec] rounded-2xl; box-shadow: inset 6px 6px 10px 0 rgba(163, 177, 198, 0.7), inset -6px -6px 10px 0 rgba(255, 255, 255, 0.8);`,
  'neu-input': `bg-[#e0e5ec] rounded-2xl outline-none text-[#2d3748] px-4 py-3; box-shadow: inset 6px 6px 10px 0 rgba(163, 177, 198, 0.7), inset -6px -6px 10px 0 rgba(255, 255, 255, 0.8);`,
  'neu-button': `bg-[#e0e5ec] rounded-2xl transition-all duration-300; box-shadow: 9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5);`
};

cssFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  for (const [cls, replacement] of Object.entries(components)) {
    // Regex to match `@apply ... neu-flat ...;`
    // We'll just replace the specific word `neu-flat` inside the file if it's not the definition itself.
    // Actually, since `@apply` requires standard classes, if we replace `neu-flat` with `bg-[#e0e5ec] rounded-[1.5rem]; box-shadow: ...;`
    // We have to be careful about the `@apply` line. 
    // Let's replace the whole word and split the `@apply` block if necessary.
    
    // Simplest way: replace `neu-flat` with `bg-[#e0e5ec] rounded-[1.5rem]; box-shadow: ...`
    // Since it's inside `@apply`, injecting a `; box-shadow: ...` will terminate the `@apply` and add valid CSS!
    
    const regex = new RegExp(`\\b${cls}\\b`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  }
  
  // Cleanup any double semicolons caused by replacement
  content = content.replace(/;+/g, ';');
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
