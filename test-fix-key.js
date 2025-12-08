require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');

async function testUpload() {
    console.log('--- TEST: Sanitized Key ---');
    try {
        const keyPath = process.env.GCS_KEYFILE_PATH;
        const fullPath = path.resolve(keyPath);
        const keyFileContent = fs.readFileSync(fullPath, 'utf8');
        const keyData = JSON.parse(keyFileContent);

        // AGGRESSIVE SANITIZATION
        let privateKey = keyData.private_key;
        if (privateKey) {
            // Replace literal \n with real newline
            privateKey = privateKey.replace(/\\n/g, '\n');
            // Ensure headers are correct
            if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
                console.log('Adding headers...');
                privateKey = '-----BEGIN PRIVATE KEY-----\n' + privateKey + '\n-----END PRIVATE KEY-----\n';
            }
        }

        console.log('Key length:', privateKey.length);

        const storage = new Storage({
            projectId: keyData.project_id,
            credentials: {
                client_email: keyData.client_email,
                private_key: privateKey
            }
        });

        const bucketName = process.env.GCS_BUCKET_NAME;
        const bucket = storage.bucket(bucketName);

        console.log('Testing connection...');
        const [exists] = await bucket.exists();
        console.log('✅ Connection SUCCESS! Bucket exists:', exists);

    } catch (error) {
        console.error('❌ FAILURE');
        console.error(error.message);
        if (error.code) console.error('Code:', error.code);
    }
}

testUpload();
