import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { SessionsClient } = require('@google-cloud/dialogflow-cx').v3;

const languageCode = 'en';
const location = 'global';
const agentId = '7dacca07-382c-4f99-aac5-e97b595df7c1';

export const generateResponse = async (sessionId, query, credentials) => {
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
        },
          queryParams: {
            currentPage: "projects/vertex-ai-demo-430916/locations/global/agents/7dacca07-382c-4f99-aac5-e97b595df7c1/flows/79568bb8-4930-4f7e-b3f9-870b677e651a/pages/START_PAGE"
          }
    };

    // const request = {
    //     matchIntentRequest: {
    //       session: sessionPath,
    //       queryInput: {
    //         languageCode: languageCode,
    //         text: { text: query }
    //       },
    //       queryParams: {
    //         currentPage: "projects/vertex-ai-demo-430916/locations/global/agents/7dacca07-382c-4f99-aac5-e97b595df7c1/flows/00000000-0000-0000-0000-000000000000/pages/124971d3-3499-4fd4-8522-0177bdde6a4e"
    //       }
    //     },
    //     match: {
    //         intent: null,
    //         event: "",
    //         parameters: null,
    //         resolvedInput: query,
    //         matchType: "KNOWLEDGE_CONNECTOR",
    //         confidence: 1
    //       }
    //   };

    const knowledgeConnectorResponse = await sessionClient.detectIntent(request);
    console.log(`KnowledgeBot Response: ${JSON.stringify(knowledgeConnectorResponse[0].queryResult)}`)
    return knowledgeConnectorResponse[0].queryResult.responseMessages[0].text.text[0];
}

export default generateResponse;