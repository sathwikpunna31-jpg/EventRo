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

  // We want to safely replace quotes surrounding the URL.
  // Match 'http://localhost:5000/anything' or "http://localhost:5000/anything" or `http://localhost:5000/anything`
  // We use [\'"\`] to match the exact same quote type, but we replace the entire string with a backtick wrapped template literal.
  const regex = /(['"`])http:\/\/localhost:5000(.*?)\1/g;
  
  content = content.replace(regex, "`\\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}$2`");

  // There might be places where they did: `http://localhost:5000${someVar}`
  // In this case, `http://localhost:5000(something)` is already inside backticks.
  // If we matched it, it will be wrapped correctly because $1 and \1 matched the backticks.

  // Let's also catch cases where it's concatenated: 'http://localhost:5000' + '/api'
  // It will be matched by the regex since (.*?) can be empty.

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
});

console.log(`Safely replaced URLs in ${changedCount} files.`);
