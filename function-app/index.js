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
    let unansweredQueries = await getUnansweredQueries(`{"question": "${query}", "websiteBotResponse": "${agentResponse}"}  }`, credentials);
    
    let unansweredQueriesResponse, searchResponse, renderedContent = '';
    if(unansweredQueries != ''){
        unansweredQueriesResponse = await getInternetSearchGroundedResponse(unansweredQueries, credentials);
        searchResponse = unansweredQueriesResponse.content.parts[0].text;
        
        const customStyles = `<style>.container{font-size: 11px !important;}.chip{color:#5e5e5e !important;background-color: #d8d8d8 !important;padding: 4px 12px !important; text-wrap: wrap !important; text-align: left !important;line-height: 15px !important;}  .chip:hover {background-color: #f2f2f2 !important;}.chip:focus {background-color: #f2f2f2 !important;}.chip:active { background-color: #d8d8d8 !important; border-color: #b6b6b6 !important; }.headline{background:url(https://logos-world.net/wp-content/uploads/2020/09/Google-Symbol.png) no-repeat center !important;width: 40px !important;height: 40px !important;-webkit-background-size: contain !important;-moz-background-size: contain !important;-o-background-size: contain !important;background-size: contain !important;margin-left: -20px !important;margin-right: -5px !important;}</style>`;
        renderedContent = customStyles + unansweredQueriesResponse.groundingMetadata.searchEntryPoint.renderedContent;
    }
    
    let response = {
        fulfillmentMessages: {
            response: agentResponse,
            searchResponse: searchResponse,
            searchEntryPoint: renderedContent
        }
    };

    res.send(JSON.stringify(response));
});
