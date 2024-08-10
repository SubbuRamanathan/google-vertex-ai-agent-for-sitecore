const functions = require('@google-cloud/functions-framework');
const { VertexAI } = require('@google-cloud/vertexai');

functions.http('search', async(req, res) => {
    console.log(`Logged Message: ${JSON.stringify(req.headers)} "|||" ${JSON.stringify(req.body)}`);

    // Initialize Vertex with your Cloud project and location
    const vertex_ai = new VertexAI({ project: 'vertex-ai-demo-430916', location: 'us-central1' });
    const model = 'gemini-1.5-flash-001';

    const textsi_1 = { text: `You\'re a helpful customer service chatbot that responds back to any user\'s query related only to fashion clothing, ski tools, and electronic accessories like iPhones from the public internet search only if the user\'s question or parts of the question require online public data search. For example, if the user asks \'what should I buy if travelling to Amazon forest\', then you should do a public Google search for the kinds of clothing, electronic accessories, ski tools required for travelling to Amazon forest and respond back with the search results summary.` };

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

    async function generateContent() {
        const request = {
            contents: [{ role: 'user', parts: [{ text: `what should I buy if I\'m traveling to Australia next month` }] }],
        };
        const result = await generativeModel.generateContent(request);
        const response = result.response;
        console.log('Response: ', JSON.stringify(response));
        return response;
    };

    let generatedContent = await generateContent();
    console.log('finished');
    res.send(JSON.stringify(generatedContent));
});
