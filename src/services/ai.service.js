const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require('../utils/logger');

class AiService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            logger.warn('⚠️ Alerta: GEMINI_API_KEY no definido. La IA no funcionará.');
        }
        // Inicializar Gemini con el modelo Gemini 2.5 Flash (Confirmado 200 OK)
        this.genAI = new GoogleGenerativeAI(apiKey || 'dummy_key');
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }

    /**
     * Identifica el producto con protección anti-crashes (Rate Limits)
     */
    async identifyProduct(imageBase64) {
        try {
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('API Key de Gemini no configurada en el servidor');
            }

            const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

            const prompt = `Actúa como un motor de búsqueda visual para inventario.
            Tu misión es conectar esta FOTO con un registro de BASE DE DATOS.
            
            ESTRATEGIA DE BÚSQUEDA (Prioridad):
            1. **CÓDIGO DE BARRAS**: Si ves números de barra, ÚSALOS. Es el match perfecto.
            2. **TEXTO EXACTO (OCR)**: Lee el texto MÁS GRANDE y DISTINTIVO (ej: "Oreo", "Coca Cola").
            3. **OBJETO VISUAL (Si no hay texto)**: Identifica el sustantivo PRINCIPAL en SINGULAR. (Ej: Si ves un zapato negro de cuero, tu búsqueda es SOLO "Zapato". Si ves una silla roja, es SOLO "Silla").

            Responde SIEMPRE JSON (sin markdown):
            {
                "productName": "Descripción detallada del visual (ej: Zapato de cuero negro)",
                "brand": "Marca detectada o 'Genérico'",
                "searchQuery": "LA PALABRA CLAVE DE ENLACE. Si hay texto, usa el texto. Si es visual, usa SOLO EL SUSTANTIVO GENÉRICO (ej: 'Zapato'). Mantenlo lo más corto posible para que coincida con nombres simples en la Base de Datos."
            }`;

            // --- LÓGICA DE REINTENTOS Y FALLBACK ---
            const maxRetries = 3;
            let lastError;

            for (let i = 0; i < maxRetries; i++) {
                try {
                    const result = await this.model.generateContent([
                        prompt,
                        {
                            inlineData: {
                                data: cleanBase64,
                                mimeType: "image/jpeg",
                            },
                        },
                    ]);

                    const response = await result.response;
                    const text = response.text();
                    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                    return JSON.parse(cleanText);

                } catch (error) {
                    lastError = error;
                    // Si es error de cuota (429) o sobrecarga (503)
                    const msg = error.message || '';
                    if (msg.includes('429') || msg.includes('503') || error.status === 429) {
                        const waitTime = 2000 * (i + 1);
                        console.log(`⏳ Gemini ocupado (429). Reintentando en ${waitTime / 1000}s...`);
                        await new Promise(r => setTimeout(r, waitTime));
                        continue;
                    }
                    throw error;
                }
            }

            // SI AGOTAMOS LOS INTENTOS Y SIGUE EL ERROR 429:
            // Devolvemos un objeto "fake" para que el frontend NO se rompa.
            if (lastError && (lastError.message.includes('429') || lastError.status === 429)) {
                return {
                    productName: "Sistema saturado (Espera 30s)",
                    brand: "Google AI",
                    searchQuery: ""
                };
            }

            throw lastError;

        } catch (error) {
            logger.error('Error en AiService.identifyProduct:', error);
            // Fallback final de seguridad
            return {
                productName: "Error de conexión IA",
                brand: "Reintentar",
                searchQuery: ""
            };
        }
    }
}

module.exports = new AiService();
