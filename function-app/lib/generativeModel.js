import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { VertexAI } = require('@google-cloud/vertexai');

const model = 'gemini-1.5-flash-002';

function getGenerativeModel(instruction, isPublicSearchGroundingRequired, credentials) {
    const vertex_ai = new VertexAI({ project: credentials.project_id, location: 'us-central1', googleAuthOptions: { credentials: { private_key: credentials.private_key, client_email: credentials.client_email } } });
    const generationConfig = {
        'maxOutputTokens': 4096,
        'temperature': 1,
        'topP': 0.95,
    };
    const safetySettings = [
        {
            'category': 'HARM_CATEGORY_HATE_SPEECH',
            'threshold': 'OFF'
        },
        {
            'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
            'threshold': 'OFF'
        },
        {
            'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            'threshold': 'OFF'
        },
        {
            'category': 'HARM_CATEGORY_HARASSMENT',
            'threshold': 'OFF'
        }
    ]
    if (isPublicSearchGroundingRequired) {
        return vertex_ai.preview.getGenerativeModel({
            model: model,
            generationConfig: generationConfig,
            safetySettings: safetySettings,
            tools: [
                {
                    googleSearchRetrieval: {},
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

async function generateModelResponse(instruction, query, isPublicSearchGroundingRequired, credentials) {
    const request = {
        contents: [{ role: 'user', parts: [{ text: query }] }],
    };
    let result = await getGenerativeModel(instruction, isPublicSearchGroundingRequired, credentials).generateContent(request);
    return result.response.candidates[0].content.parts[0].text;
};

export const getPAIInfo = async (query, infoAgentResponse, credentials) => {
    let instruction = `You're an assistant that analyzes the user input question, identifies any elements that change periodically from the provided input(Eg, current inflation rate), and pulls the latest figures for those elements set by the Canadian government from the publicly available generic information. Do not share any recommendations or any other additional details.`;
    let rewrittenQuery = `I'm a chatbot and here are the details from my website comprising of the services that we offer: '${infoAgentResponse}'. My user asked this '${query}'. Could you analyze the question for elements that change periodically and pull the latest figures for all of those identified dynamic elements for ${new Date().getFullYear()} set by Canadian government from the publicly available generic information? Do not share any recommendations or any other additional details.`;
    return await generateModelResponse(instruction, rewrittenQuery, true, credentials);
}

export const prepareAgentResponse = async (query, paiInfo, infoAgentResponse, credentials) => {
    let instruction = `You're an assistant that analyzes the user input question, combine the website data and internet search data to generate a response for the user.`;
    let prompt = `Here are the details from my website: ${infoAgentResponse} | Here is the most up-to-date accurate information from my Internet Search in Canada: ${paiInfo} | Here's the user's question: ${query}? As a financial consultant, could you combine the above website & internet search data to generate a response for the user. Do not include any information outside of the above provided website data and internet search data. Do not include any summary of the original question/ask, so I can copy paste the response to the user directly without any edit.`
    return await generateModelResponse(instruction, prompt, false, credentials);
}

export default { getPAIInfo, prepareAgentResponse };