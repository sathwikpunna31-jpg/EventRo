const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== 'node_modules' && file !== 'build' && file !== '.git') {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      const ext = path.extname(file);
      if (ext === '.js' || ext === '.jsx') {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles('src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace `http://localhost:5000/something`
  // We will replace http://localhost:5000 entirely with a global variable or env var string prefix.
  // Actually, replacing exactly: http://localhost:5000
  // If it's inside backticks: `http://localhost:5000/api/...`
  // We can change http://localhost:5000 to ${process.env.REACT_APP_API_URL || 'http://localhost:5000'}
  content = content.replace(/http:\/\/localhost:5000/g, "${process.env.REACT_APP_API_URL || 'http://localhost:5000'}");
  
  // The above replace will break if it's inside single or double quotes, because ${...} is not evaluated.
  // So we must convert single and double quotes containing this literal to backticks!
  // Regex to find '...${process.env...}...' and turn into `...${process.env...}...`
  // Look for single quote, followed by anything, followed by ${process.env.REACT_APP_API_URL || 'http://localhost:5000'}, followed by anything, followed by single quote.
  const regexSingle = /'([^']*\$\{process\.env\.REACT_APP_API_URL \|\| 'http:\/\/localhost:5000'\}[^']*)'/g;
  content = content.replace(regexSingle, "`$1`");

  const regexDouble = /"([^"]*\$\{process\.env\.REACT_APP_API_URL \|\| 'http:\/\/localhost:5000'\}[^"]*)"/g;
  content = content.replace(regexDouble, "`$1`");

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
});

console.log(`Replaced URLs in ${changedCount} files.`);
