const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src');

const replacements = {
    // Primary
    '#c8102e': '#2563EB',
    'bg-red-800': 'bg-[#1D4ED8]',
    'hover:bg-red-800': 'hover:bg-[#1D4ED8]',
    'hover:text-red-800': 'hover:text-[#1D4ED8]',
    '#fff5f5': '#F8FAFC',
    
    // Background
    'bg-gray-50': 'bg-[#F8FAFC]',
    'bg-[#fafafa]': 'bg-[#F8FAFC]',
    'bg-[#f8f9fa]': 'bg-[#F8FAFC]',
    'bg-[#F9FAFB]': 'bg-[#F8FAFC]',
    
    // Text
    'text-gray-900': 'text-[#0F172A]',
    'text-gray-800': 'text-[#0F172A]',
    'text-black': 'text-[#0F172A]',
    'hover:text-black': 'hover:text-[#0F172A]',
    
    // Border
    'border-gray-100': 'border-[#E2E8F0]',
    'border-gray-200': 'border-[#E2E8F0]',
    'border-black': 'border-[#0F172A]'
};

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content;
            
            for (const [oldStr, newStr] of Object.entries(replacements)) {
                // simple global string replace
                newContent = newContent.split(oldStr).join(newStr);
            }
            
            if (newContent !== content) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

// Also process index.html in root
const rootHtml = path.join(__dirname, 'index.html');
if (fs.existsSync(rootHtml)) {
    let content = fs.readFileSync(rootHtml, 'utf8');
    let newContent = content;
    for (const [oldStr, newStr] of Object.entries(replacements)) {
        newContent = newContent.split(oldStr).join(newStr);
    }
    if (newContent !== content) {
        fs.writeFileSync(rootHtml, newContent, 'utf8');
        console.log(`Updated ${rootHtml}`);
    }
}

processDirectory(dirPath);
console.log('Color scheme replacement complete!');
