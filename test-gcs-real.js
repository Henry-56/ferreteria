require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const crypto = require('crypto');

async function testUpload() {
    console.log('--- Starting GCS Upload Test (Manual Creds) ---');
    console.log('Project ID:', process.env.GCS_PROJECT_ID);
    console.log('Bucket Name:', process.env.GCS_BUCKET_NAME);

    try {
        const keyPath = process.env.GCS_KEYFILE_PATH;
        if (!keyPath) throw new Error('GCS_KEYFILE_PATH not defined');

        const fullPath = path.resolve(keyPath);
        const keyFileContent = fs.readFileSync(fullPath, 'utf8');
        const keyData = JSON.parse(keyFileContent);

        console.log('Loaded credentials for:', keyData.client_email);

        // 1. Instantiate Storage with explicit credentials object
        const storage = new Storage({
            projectId: keyData.project_id,
            credentials: {
                client_email: keyData.client_email,
                // CRITICAL FIX: Ensure newlines are real characters
                private_key: keyData.private_key ? keyData.private_key.replace(/\\n/g, '\n') : undefined
            }
        });

        const bucketName = process.env.GCS_BUCKET_NAME;
        const bucket = storage.bucket(bucketName);

        // 2. Test Connection
        console.log('\nTesting connection...');
        const [exists] = await bucket.exists();
        console.log('Bucket exists:', exists);

        if (!exists) {
            console.error('Bucket does not exist!');
            return;
        }

        // 3. Test Upload
        console.log('\nTesting upload...');
        const filename = `test_manual_${Date.now()}.jpg`;
        const blob = bucket.file(filename);
        const buffer = Buffer.from('test image content');

        await blob.save(buffer, {
            metadata: { contentType: 'image/jpeg' },
            resumable: false
        });

        // Try make public (might fail if uniform access)
        try {
            await blob.makePublic();
            console.log('Made public.');
        } catch (e) {
            console.warn('Could not make public (expected if using Uniform Access):', e.message);
        }

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
        console.log('Upload successful!');
        console.log('URL:', publicUrl);

        // 4. Test Delete
        console.log('\nTesting delete...');
        await blob.delete();
        console.log('Delete successful!');
        console.log('\n✅ ALL TESTS PASSED');

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        if (error.reason) console.error('Reason:', error.reason);
    }
}

testUpload();
