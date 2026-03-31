const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const slashPattern = /`\\https:\/\/eventro-backend\.onrender\.com/g;
const replacement = '`https://eventro-backend.onrender.com';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (slashPattern.test(content)) {
        content = content.replace(slashPattern, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Cleaned: ${filePath}`);
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

console.log('Cleaning slashes...');
traverseDirectory(srcDir);
console.log('Complete!');
