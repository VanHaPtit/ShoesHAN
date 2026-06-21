const fs = require('fs');

const logPath = 'C:\\Users\\MMC\\.gemini\\antigravity\\brain\\5060b0e3-1e80-4ada-8ee9-34da02fdc8f3\\.system_generated\\logs\\overview.txt';
const targetPath = 'e:\\TMDT\\FEShopShoes\\src\\admin\\components\\BannerManager.tsx';

try {
    const lines = fs.readFileSync(logPath, 'utf8').split('\n');
    let codeContent = null;
    
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const json = JSON.parse(line);
            if (json.tool_calls) {
                for (const call of json.tool_calls) {
                    if (call.name === 'write_to_file' && call.args.TargetFile && call.args.TargetFile.includes('BannerManager.tsx')) {
                        codeContent = call.args.CodeContent;
                    }
                }
            }
        } catch (e) {
            // ignore JSON parse errors for non-JSON lines
        }
    }
    
    if (codeContent) {
        fs.writeFileSync(targetPath, codeContent, 'utf8');
        console.log('Successfully extracted BannerManager.tsx!');
    } else {
        console.log('Could not find BannerManager.tsx code in logs.');
    }
} catch (err) {
    console.error('Error:', err);
}
