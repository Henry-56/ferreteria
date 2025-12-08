require('dotenv').config();
const fs = require('fs');
const path = require('path');

const keyPath = process.env.GCS_KEYFILE_PATH;
const fullPath = path.resolve(keyPath);
const keyFileContent = fs.readFileSync(fullPath, 'utf8');
const keyData = JSON.parse(keyFileContent);
const pk = keyData.private_key;

if (pk) {
    console.log('--- KEY HEADER CHECK ---');
    // Print first 40 chars
    console.log(pk.substring(0, 40));
    // Check for newlines
    console.log('Has real newline:', pk.includes('\n'));
    console.log('Has escaped newline:', pk.includes('\\n'));
} else {
    console.log('No private key found');
}
