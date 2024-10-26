import { generateResponse } from './lib/knowledgeBase.js';
import { getPAIInfo, prepareAgentResponse } from './lib/generativeModel.js';

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const functions = require('@google-cloud/functions-framework');
const credentials = require('./key.json');
const { randomUUID } = require('crypto');

functions.http('post', async (req, res) => {
    try{
        const query = req.body.user_question;
        const sessionId = req.body.session_id ?? randomUUID();

        let infoAgentResponse = await generateResponse(sessionId, query, credentials);
        let paiInfo = await getPAIInfo(query, infoAgentResponse, credentials);

        let modelResponse = await prepareAgentResponse(query, paiInfo, infoAgentResponse, credentials);
        let finalResponse = {
            agent_response: modelResponse
        };

        res.send(finalResponse);
    }
    catch (error) {
        console.error("Encountered error while executing the function: ", error);
        res.send({ agent_response: "Sorry I couldn't find the best response for your question from the supplied information, please send your query to info@company.com" });
    }
});
