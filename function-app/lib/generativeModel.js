import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { VertexAI } = require('@google-cloud/vertexai');

const model = 'gemini-1.5-flash-001';

function getGenerativeModel(instruction, isPublicSearchGroundingRequired, credentials) {
    const vertex_ai = new VertexAI({ project: credentials.project_id, location: 'us-central1', googleAuthOptions: { credentials: { private_key: credentials.private_key, client_email: credentials.client_email } } });
    const generationConfig = {
        'maxOutputTokens': 8192,
        'temperature': 0.5,
        'topP': 0.5,
    };
    const safetySettings = [
        {
            'category': 'HARM_CATEGORY_HATE_SPEECH',
            'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
            'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
            'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
            'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
            'category': 'HARM_CATEGORY_HARASSMENT',
            'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
        }
    ]
    if (isPublicSearchGroundingRequired) {
        return vertex_ai.preview.getGenerativeModel({
            model: model,
            generationConfig: generationConfig,
            safetySettings: safetySettings,
            tools: [
                {
                    googleSearchRetrieval: {
                        disableAttribution: false,
                    },
                },
            ],
            systemInstruction: {
                parts: [{ text: instruction }]
            },
        });
    }
    else {
        return vertex_ai.preview.getGenerativeModel({
            model: model,
            generationConfig: generationConfig,
            safetySettings: safetySettings,
            systemInstruction: {
                parts: [{ text: instruction }]
            },
        });
    }
}

async function generateModelResponse(instructions, query, isPublicSearchGroundingRequired, credentials) {
    const request = {
        contents: [{ role: 'user', parts: [{ text: query }] }],
    };
    return await getGenerativeModel(instructions, isPublicSearchGroundingRequired, credentials).generateContent(request);
};

export const getUnansweredQueries = async (knowledgeBaseResponse, credentials) => {
    let instruction = `You're a helpful bot that analyzes the users question and website bot's response supplied in json format, and respond back with only the question(s) or parts of the question(s) which is unanswered by the website bot in this exact format without any prefix or suffix, "{'question' : '<unanswered questions/parts goes here>', 'reason' : '<reason for why you think these questions/parts are unanswered>'}". If there are no unanswered questions/parts, then send an empty response.`;
    let result = await generateModelResponse(instruction, knowledgeBaseResponse, false, credentials);
    console.log(`Generative Model Response: ${JSON.stringify(result.response.candidates[0].content.parts[0].text)}`)
    return JSON.parse(result.response.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '')).question;
}

export const getInternetSearchGroundedResponse = async (query, credentials) => {
    let instruction = `You're a helpful bot that searches only for general information about the tips and real-time data associated with fashion clothing and electronic accessories. You shouldn't respond with any other brand or company information.`;
    let result = await generateModelResponse(instruction, query, true, credentials);
    return result.response.candidates[0];
}

export default { getUnansweredQueries, getInternetSearchGroundedResponse };