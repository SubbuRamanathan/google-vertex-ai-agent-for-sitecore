import { generateResponse } from './lib/knowledgeBase.js';
import { getUnansweredQueries, getInternetSearchGroundedResponse } from './lib/generativeModel.js';

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const functions = require('@google-cloud/functions-framework');
const credentials = require('./key.json');

functions.http('search', async (req, res) => {
    console.log(`Logged Message: ${req.body.sessionId} "|||" ${req.body.query}`);
    const sessionId = req.body.sessionId ?? 'dfMessenger-b7bdc90d-7b80-4a2d-a83b-1cb00ccb3572';
    const query = req.body.query ?? 'what are the latest trends in fashion clothing? how can I maintain my clothes so they look fresh and better always?';

    let agentResponse = await generateResponse(sessionId, query, credentials);
    //let unansweredQueries = await getUnansweredQueries(`{"question": "${query}", "websiteBotResponse": "${agentResponse}"}  }`, credentials);
    
    let unansweredQueriesResponse, searchResponse, renderedContent = '';
    // if(unansweredQueries != ''){
    //     unansweredQueriesResponse = await getInternetSearchGroundedResponse(unansweredQueries, credentials);
    //     searchResponse = unansweredQueriesResponse.content.parts[0].text;
    //     renderedContent = unansweredQueriesResponse.groundingMetadata.searchEntryPoint.renderedContent;
    // }
    
    let response = {
        fulfillmentMessages: {
            response: agentResponse + searchResponse,
            searchResponse: searchResponse,
            searchEntryPoint: renderedContent
        }
    };

    res.send(JSON.stringify(response));
});
