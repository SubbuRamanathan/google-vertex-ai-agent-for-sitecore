const functions = require('@google-cloud/functions-framework');
const { VertexAI } = require('@google-cloud/vertexai');
const {SessionsClient} = require('@google-cloud/dialogflow-cx').v3;

const languageCode = 'en';
const location = 'global';
const agentId = '7dacca07-382c-4f99-aac5-e97b595df7c1';

const credentials = require('./key.json');
const keyFilter = (key) => (item) => (item.key === key);

functions.http('search', async(req, res) => {
    console.log(`Logged Message: ${JSON.stringify(req.headers)} "|||" ${JSON.stringify(req.body)}`);
    const sessionId = 'dfMessenger-69f4b4c4-b76c-4351-bbb3-657c1ab090ca';
    const query = 'what are the latest trends in fashion clothing';

    // Initialize Vertex with your Cloud project and location
    const vertex_ai = new VertexAI({ project: 'vertex-ai-demo-430916', location: 'us-central1' });
    const model = 'gemini-1.5-flash-001';

    const textsi_1 = { text: `You\'re a helpful customer service chatbot that responds back to any user\'s query related only to fashion clothing, ski tools, and electronic accessories like iPhones from the public internet search only if the user\'s question or parts of the question require online public data search. For example, if the user asks \'what should I buy if travelling to Amazon forest\', then you should do a public Google search for \'kinds of clothing, electronic accessories, ski tools required for travelling to Amazon forest\' and respond back with the search results summary.` };

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
        tools: [
            {
                googleSearchRetrieval: {
                    disableAttribution: false,
                },
            },
        ],
        systemInstruction: {
            parts: [textsi_1]
        },
    });

    async function fetchSearchResults() {
        const request = {
            contents: [{ role: 'user', parts: [{ text: query }] }],
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

    let searchResults = await fetchSearchResults();
    let renderedContent = searchResults.candidates[0].groundingMetadata.searchEntryPoint.renderedContent;
    let agentResponse = await generateKnowledgeBaseResponse();
    let response = {
        fulfillmentMessages: {
            searchResultContent: renderedContent,
            agentResponse: agentResponse
        }
    };
    res.send(JSON.stringify(response));
});
