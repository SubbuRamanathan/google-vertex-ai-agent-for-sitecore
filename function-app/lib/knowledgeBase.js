import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { SessionsClient } = require('@google-cloud/dialogflow-cx').v3;

const languageCode = 'en-US';
const location = 'global';
const agentId = '1257da63-f102-49ca-97ec-0a9fa94ee8b9';
const kbPlaybookId = '00000000-0000-0000-0000-000000000000';

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
            text: { text: `The website user asked: ${query}. Share all of the relevant details you could find from the knowledge base.` },
            languageCode: languageCode,
        },
        queryParams: {
            llmModelSettings: { model: "gemini-1.5-flash" },
            playbookStateOverride: {currentSessionTrace: {actions:[], name:`projects/${credentials.project_id}/locations/${location}/agents/${agentId}/playbooks/${kbPlaybookId}/examples/-`}}
        }
    };

    const knowledgeConnectorResponse = await sessionClient.detectIntent(request);
    return knowledgeConnectorResponse[0].queryResult.responseMessages[0].text.text[0];
}

export default generateResponse;