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

// The exact strings that my previous script injected, which broke the CSS by inserting semicolons into @apply
const brokenComponents = [
  {
    find: "bg-[#e0e5ec] rounded-[1.5rem]; box-shadow: 9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5)",
    replace: "bg-[#e0e5ec] rounded-[1.5rem] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]"
  },
  {
    find: "bg-[#e0e5ec] rounded-2xl; box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.5)",
    replace: "bg-[#e0e5ec] rounded-2xl shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.5)]"
  },
  {
    find: "bg-[#e0e5ec] rounded-2xl; box-shadow: inset 6px 6px 10px 0 rgba(163, 177, 198, 0.7), inset -6px -6px 10px 0 rgba(255, 255, 255, 0.8)",
    replace: "bg-[#e0e5ec] rounded-2xl shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)]"
  },
  {
    find: "bg-[#e0e5ec] rounded-2xl outline-none text-[#2d3748] px-4 py-3; box-shadow: inset 6px 6px 10px 0 rgba(163, 177, 198, 0.7), inset -6px -6px 10px 0 rgba(255, 255, 255, 0.8)",
    replace: "bg-[#e0e5ec] rounded-2xl outline-none text-[#2d3748] px-4 py-3 shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)]"
  },
  {
    find: "bg-[#e0e5ec] rounded-2xl transition-all duration-300; box-shadow: 9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5)",
    replace: "bg-[#e0e5ec] rounded-2xl transition-all duration-300 shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]"
  }
];

cssFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  for (const comp of brokenComponents) {
    if (content.includes(comp.find)) {
      content = content.split(comp.find).join(comp.replace);
      changed = true;
    }
  }
  
  // Also clean up any lingering semicolons inside @apply that are followed by Tailwind classes
  // e.g. "@apply ... shadow-[...] ; px-4 md:px-6" -> "@apply ... shadow-[...] px-4 md:px-6"
  // Wait, I replaced `neu-flat` with `bg-[#e0e5ec] rounded-[1.5rem]; box-shadow: ...;`
  // So there is a semicolon AFTER the box-shadow!
  
  const brokenComponentsWithSemicolon = brokenComponents.map(c => ({
    find: c.find + ";",
    replace: c.replace
  }));

  for (const comp of brokenComponentsWithSemicolon) {
    if (content.includes(comp.find)) {
      content = content.split(comp.find).join(comp.replace);
      changed = true;
    }
  }

  // Fallback for random semicolons in middle of @apply block:
  // We can just find `@apply[^\;]+;` and ensure there are no other semicolons inside.
  // Actually, standard string replace is safer. Let's do a regex replace for the known injected string + semicolon
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
