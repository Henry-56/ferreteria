const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const crypto = require('crypto');

class StorageService {
    constructor() {
        try {
            // Cargar credenciales manualmente para evitar problemas con la librería en ciertos entornos
            const keyPath = process.env.GCS_KEYFILE_PATH;
            let credentials = null;
            let projectId = process.env.GCS_PROJECT_ID;

            if (keyPath) {
                try {
                    const fullPath = path.resolve(keyPath);
                    const keyFileContent = fs.readFileSync(fullPath, 'utf8');
                    const keyData = JSON.parse(keyFileContent);
                    credentials = {
                        client_email: keyData.client_email,
                        private_key: keyData.private_key ? keyData.private_key.replace(/\\n/g, '\n') : undefined
                    };
                    projectId = keyData.project_id || projectId;
                } catch (err) {
                    logger.error(`Error leyendo archivo de credenciales GCS: ${err.message}`);
                }
            }

            if (!credentials) {
                credentials = {
                    client_email: process.env.GCS_CLIENT_EMAIL,
                    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n')
                };
            }

            this.storage = new Storage({
                projectId,
                credentials
            });

            this.bucketName = process.env.GCS_BUCKET_NAME;
            this.bucket = this.storage.bucket(this.bucketName);
            this.folder = 'productos/';

            logger.info('StorageService inicializado correctamente');

        } catch (error) {
            logger.error(`Error inicalizando StorageService: ${error.message}`);
        }
    }

    /**
     * Probar conexión con GCS
     */
    async testConnection() {
        try {
            const [exists] = await this.bucket.exists();
            if (exists) {
                logger.info(`✅ Conexión exitosa con bucket: ${this.bucketName}`);
                return true;
            } else {
                logger.warn(`⚠️ El bucket ${this.bucketName} no existe (según verificación local).`);
                return false;
            }
        } catch (error) {
            logger.error(`❌ Error al conectar con GCS: ${error.message}`);
            // No lanzar error para permitir que la app arranque, pero loguear fuertemente
            return false;
        }
    }

    /**
     * Optimizar imagen antes de subir
     * @param {Buffer} buffer - Buffer de la imagen
     * @returns {Promise<Buffer>} - Buffer optimizado
     */
    async optimizeImage(buffer) {
        try {
            return await sharp(buffer)
                .resize(800, 800, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 85 })
                .toBuffer();
        } catch (error) {
            logger.error(`Error al optimizar imagen: ${error.message}`);
            return buffer;
        }
    }

    /**
     * Subir imagen de producto a GCS
     * @param {Object} file - Archivo de multer (file.buffer, file.mimetype, file.originalname)
     * @returns {Promise<string>} - URL pública de la imagen
     */
    async uploadProductImage(file) {
        try {
            // Optimizar imagen
            const optimizedBuffer = await this.optimizeImage(file.buffer);

            // Generar nombre único
            const timestamp = Date.now();
            const randomId = crypto.randomUUID();
            const extension = path.extname(file.originalname) || '.jpg';
            const filename = `${this.folder}producto_${timestamp}_${randomId}${extension}`;

            // Crear archivo en el bucket
            const blob = this.bucket.file(filename);
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: file.mimetype || 'image/jpeg',
                    metadata: {
                        firebaseStorageDownloadTokens: crypto.randomUUID()
                    }
                },
                resumable: false
            });

            return new Promise((resolve, reject) => {
                blobStream.on('error', (error) => {
                    logger.error(`Error al subir imagen a GCS: ${error.message}`);
                    reject(error);
                });

                blobStream.on('finish', async () => {
                    try {
                        // Intentar hacer público (puede fallar si hay Uniform Bucket Level Access)
                        try {
                            await blob.makePublic();
                        } catch (aclError) {
                            // Ignorar error de ACL si el bucket ya es público por política
                        }

                        // URL Pública
                        const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${filename}`;

                        logger.info(`✅ Imagen subida exitosamente: ${publicUrl}`);
                        resolve(publicUrl);
                    } catch (error) {
                        logger.error(`Error finalizando upload: ${error.message}`);
                        reject(error);
                    }
                });

                blobStream.end(optimizedBuffer);
            });
        } catch (error) {
            logger.error(`Error en uploadProductImage: ${error.message}`);
            throw error;
        }
    }

    /**
     * Eliminar imagen de producto de GCS
     * @param {string} imageUrl - URL de la imagen a eliminar
     * @returns {Promise<boolean>} - true si se eliminó, false si no
     */
    async deleteProductImage(imageUrl) {
        try {
            if (!imageUrl) return false;

            // Ignorar locales
            if (imageUrl.startsWith('/uploads')) return false;

            const urlParts = imageUrl.split('/');
            const bucketIndex = urlParts.indexOf(this.bucketName);
            if (bucketIndex === -1) return false;

            const filename = urlParts.slice(bucketIndex + 1).join('/');

            if (!filename) return false;

            const file = this.bucket.file(filename);
            const [exists] = await file.exists();

            if (exists) {
                await file.delete();
                logger.info(`✅ Imagen eliminada de GCS: ${filename}`);
                return true;
            }
            return false;
        } catch (error) {
            logger.error(`Error al eliminar imagen de GCS: ${error.message}`);
            return false;
        }
    }
}

module.exports = new StorageService();
