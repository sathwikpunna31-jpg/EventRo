const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== 'node_modules' && file !== 'build' && file !== '.git' && file !== 'uploads') {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      const ext = path.extname(file);
      if (ext === '.js' || ext === '.jsx' || ext === '.css' || ext === '.ts' || ext === '.tsx') {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
}

const targetDir = process.argv[2] || 'src';
const allFiles = getAllFiles(targetDir);

// Read all files content once
const allContents = allFiles.map(file => ({
  file: file,
  content: fs.readFileSync(file, 'utf8')
}));

const unusedFiles = [];

for (const fileObj of allFiles) {
  const basename = path.basename(fileObj, path.extname(fileObj));
  // skip entry files
  if (basename === 'index' || basename === 'App' || basename === 'reportWebVitals' || basename === 'setupTests' || basename === 'server') continue;

  let isUsed = false;
  for (const checkObj of allContents) {
    if (checkObj.file === fileObj) continue; // Skip self
    
    // Look for the exact basename or something that looks like an import/usage
    if (checkObj.content.includes(basename)) {
      isUsed = true;
      break;
    }
  }

  if (!isUsed) {
    unusedFiles.push(fileObj);
  }
}

console.log(JSON.stringify(unusedFiles, null, 2));
