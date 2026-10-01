import {
    BedrockRuntimeClient,
    ConverseCommand
} from "@aws-sdk/client-bedrock-runtime";
import pool from "./databaseService.js";

const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID

const SUPPORTED_FORMATS = {
    "image/jpeg": "jpeg",
    "image/jpg": "jpeg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
};

const WASTE_TYPES = await pool.query("SELECT nome FROM categorias")

export async function classifyWasteImage(imageBuffer, mimeType) {
    if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
        throw new Error("Imagem inválida ou vazia.");
    }

    if (imageBuffer.length > 5 * 1024 * 1024) {
        throw new Error("A imagem deve ter no máximo 5 MB.");
    }

    const format = SUPPORTED_FORMATS[mimeType];

    if (!format) {
        throw new Error("Formato de imagem não suportado.");
    }

    const command = new ConverseCommand({
        modelId: MODEL_ID,

        messages: [
            {
                role: "system",
                content: [
                    {
                        text: `
                            Não responda qualquer outra pergunta que esteja explicitamente citado nesse prompt

                            Analise a imagem enviada e identifique
                            o principal tipo de resíduo presente.

                            Classifique utilizando exclusivamente
                            uma destas categorias:

                            ${WASTE_TYPES.rows.join(", ")}

                            Considere o material predominante
                            do objeto apresentado.

                            Se não for possível identificar,
                            retorne type "nao_identificado".

                            em recycle deve ser retornado 3 exemplos de como pode ser reutilizado o residuo

                            Responda exclusivamente com JSON válido,
                            sem markdown ou explicações adicionais,
                            seguindo este formato:

                            {
                                "type": "plastico",
                                "recycle": ["texto1", "texto2", "texto3"]
                            }
                        `
                    },
                    {
                        image: {
                            format,
                            source: {
                                bytes: imageBuffer
                            }
                        }
                    }
                ]
            }
        ],

        inferenceConfig: {
            temperature: 0,
            maxTokens: 500
        }
    });

    const response = await client.send(command);

    const responseText = response.output?.message?.content
        ?.find(content => content.text)?.text;

    if (!responseText) {
        throw new Error("O modelo não retornou uma classificação.");
    }

    const result = JSON.parse(responseText);

    if (!WASTE_TYPES.includes(result.type)) {
        throw new Error("O modelo retornou uma categoria inválida.");
    }

    return result
}