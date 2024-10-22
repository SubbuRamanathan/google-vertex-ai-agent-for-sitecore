import { generateResponse } from './lib/knowledgeBase.js';
import { getPAIInfo, prepareUserResponse } from './lib/generativeModel.js';

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const functions = require('@google-cloud/functions-framework');
const credentials = require('./key.json');
const { randomUUID } = require('crypto');

functions.http('post', async (req, res) => {
    const query = req.body.user_question;
    const sessionId = req.body.session_id ?? randomUUID();

    let infoAgentResponse = await generateResponse(sessionId, query, credentials);
    let paiInfo = await getPAIInfo(query, infoAgentResponse, credentials);

    let modelResponse = await prepareUserResponse(query, paiInfo, infoAgentResponse, credentials);
    let finalResponse = {
        agent_response: modelResponse
    };

    res.send(finalResponse);
});
