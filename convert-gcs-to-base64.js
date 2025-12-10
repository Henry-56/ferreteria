/**
 * Convierte gcs-credentials.json a Base64
 * Para usar en Railway como variable de entorno
 */

const fs = require('fs');
const path = require('path');

const credentialsPath = path.join(__dirname, 'src', 'config', 'gcs-credentials.json');

try {
    // Leer el archivo JSON
    const jsonContent = fs.readFileSync(credentialsPath, 'utf8');

    // Convertir a Base64
    const base64String = Buffer.from(jsonContent, 'utf8').toString('base64');

    console.log('✅ Conversión exitosa!\n');
    console.log('📋 Copia este valor completo y pégalo en Railway como GCS_CREDENTIALS_BASE64:\n');
    console.log('─'.repeat(80));
    console.log(base64String);
    console.log('─'.repeat(80));
    console.log('\n💡 Instrucciones:');
    console.log('1. Ve a Railway → Tu proyecto → Variables');
    console.log('2. Agregar nueva variable: GCS_CREDENTIALS_BASE64');
    console.log('3. Pega el valor de arriba (todo el bloque)');
    console.log('4. Guarda\n');

} catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Asegúrate de que exista: src/config/gcs-credentials.json');
}
