const functions = require('@google-cloud/functions-framework');
const { VertexAI } = require('@google-cloud/vertexai');
const {SessionsClient} = require('@google-cloud/dialogflow-cx').v3;

const languageCode = 'en';
const location = 'global';
const agentId = '7dacca07-382c-4f99-aac5-e97b595df7c1';

const credentials = require('./key.json');

functions.http('search', async(req, res) => {
    console.log(`Logged Message: ${JSON.stringify(req.headers)} "|||" ${JSON.stringify(req.body)}`);
    const sessionId = 'dfMessenger-8b34ab8b-e488-4d8b-9a01-722a16c9389e';
    const query = 'what are the latest trends in fashion clothing? how can I maintain the clothes during winter?';

    // Initialize Vertex with your Cloud project and location
    const vertex_ai = new VertexAI({ project: 'vertex-ai-demo-430916', location: 'us-central1' });
    const model = 'gemini-1.5-flash-001';

    const textsi_1 = { text: `You're a helpful bot that analyzes the users question and website bot's response supplied in json format, and respond back with only the question(s) or parts of the question(s) which is unanswered without any additional details or explanation.`};

    // Instantiate the models
    const generativeModel = vertex_ai.preview.getGenerativeModel({
        model: model,
        generationConfig: {
            'maxOutputTokens': 8192,
            'temperature': 1,
            'topP': 0.95,
        },
        safetySettings: [
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
        ],
        systemInstruction: {
            parts: [textsi_1]
        },
    });

    async function fetchSearchResults(agentResponse) {
        const request = {
            contents: [{ role: 'user', parts: [{ text: `{"question": "${query}", "websiteBotResponse": "${agentResponse}"}  }` }] }],
        };
        const result = await generativeModel.generateContent(request);
        const response = result.response;
        return response;
    };

    async function generateKnowledgeBaseResponse() {
        const projectId = credentials.project_id;
        let config = {
            credentials: {
                private_key: credentials.private_key,
                client_email: credentials.client_email
            }
        }

        const sessionClient = new SessionsClient(config);

        const sessionPath = sessionClient.projectLocationAgentSessionPath(
            projectId,
            location,
            agentId,
            sessionId
          );

        const request = {
            session: sessionPath,
            queryInput: {
                text: { text: query },
                languageCode: languageCode,
            }
        };

        const knowledgeConnectorResponse = await sessionClient.detectIntent(request);
        return knowledgeConnectorResponse[0].queryResult.responseMessages[0].text.text[0];
    }

    let agentResponse = await generateKnowledgeBaseResponse();
    let searchResults = await fetchSearchResults(agentResponse);
    let searchResponse = searchResults.candidates[0].content.parts[0].text;
    let renderedContent = searchResults.candidates[0].groundingMetadata.searchEntryPoint.renderedContent;
    let response = {
        fulfillmentMessages: {
            searchResponse: searchResponse,
            searchRenderedContent: renderedContent,
            agentResponse: agentResponse
        }
    };
    res.send(JSON.stringify(response));
});
