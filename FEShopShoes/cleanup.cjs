const fs = require('fs');
const path = require('path');

const root = 'e:/TMDT/FEShopShoes';

// Old source directories to remove (only if empty or containing already-migrated files)
const oldDirs = [
  'api',
  'types',
  'context',
  'hooks',
  'services',
  'store',
  'utils',
  'websocket',
  'components',
  'pages',
  'Admin/components',
  'Admin/services',
  'Admin',
];

const oldFiles = [
  'App.tsx',
  'index.tsx',
  'types.tsx',
  'migrate.cjs',
  'restructure.bat',
];

// Delete old files
for (const f of oldFiles) {
  const fp = path.join(root, f);
  if (fs.existsSync(fp)) {
    fs.unlinkSync(fp);
    console.log('Deleted file: ' + f);
  }
}

// Delete old directories (reverse order so children first)
for (const d of oldDirs) {
  const dp = path.join(root, d);
  if (fs.existsSync(dp)) {
    try {
      fs.rmSync(dp, { recursive: true });
      console.log('Deleted dir: ' + d);
    } catch (err) {
      console.log('SKIP dir (in use?): ' + d + ' - ' + err.message);
    }
  }
}

console.log('\n=== CLEANUP DONE ===');
