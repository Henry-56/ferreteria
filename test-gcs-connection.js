require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

// Manually load credentials to simulate specific loading process
const keyPath = './src/config/gcs-credentials.json';
const fullPath = path.resolve(keyPath);
const keyFileContent = fs.readFileSync(fullPath, 'utf8');
const keyData = JSON.parse(keyFileContent);

// Instantiate Storage with explicit credentials object (sanitized)
const storage = new Storage({
    projectId: keyData.project_id,
    credentials: {
        client_email: keyData.client_email,
        private_key: keyData.private_key ? keyData.private_key.replace(/\\n/g, '\n') : undefined
    }
});

async function testConnection() {
    console.log('--- GCS CONNECTION TEST ---');
    try {
        const [buckets] = await storage.getBuckets();
        console.log('✅ Connection Successful!');
        console.log('Buckets found:');
        buckets.forEach(bucket => {
            console.log(`- ${bucket.name}`);
        });
    } catch (err) {
        console.error('❌ Connection Failed:', err);
    }
}

testConnection();
