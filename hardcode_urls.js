const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const urlPattern = /\$\{process\.env\.REACT_APP_API_URL\s*\|\|\s*'http:\/\/localhost:5000'\}/g;
const replacement = 'https://eventro-backend.onrender.com';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (urlPattern.test(content)) {
        content = content.replace(urlPattern, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverseDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            traverseDirectory(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            replaceInFile(fullPath);
        }
    });
}

console.log('Starting URL hardcoding...');
traverseDirectory(srcDir);
console.log('Complete!');
