# Google Vertex AI Agent Builder + Sitecore Integration
This repository contains the Sitecore PowerShell & Sitecore Connect Modules for building AI-Powered Chat/Search Experience with content from Sitecore XP/XM Cloud leveraging Google Vertex AI Agent Builder, DialogFlow CX, and Google Search Grounding.

## Prerequisites
* Active Google Cloud Subscription

## Setup & Configuration
* Create a new project in Google Cloud Console and enable Vertex AI API & Dialogflow API
* Create an Agent/Chat/Search app from [Agent Builder](https://console.cloud.google.com/gen-app-builder/engines)
* Attach an existing Data Store or create a new Data Store from the GUI or API by following the below steps,
  * Install [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) in your machine
  * Run _gcloud auth print-access-token_ command in your command prompt to generate access token
  * You may create the Data Store using Postman leveraging [Discovery Engine REST API](https://cloud.google.com/generative-ai-app-builder/docs/reference/rest/v1/projects.locations.collections.dataStores/create)
    * Url: _https://discoveryengine.googleapis.com/v1/projects/{project-id}/locations/{location-id}/collections/default_collection/dataStores?dataStoreId={data-store-id}_
    * Authorization: Bearer {access-token}
    * Request Header: x-goog-user-project: {project-id}
    * Sample Payload: { "displayName": "Lighthouse Financial", "industryVertical": "GENERIC", "contentConfig": "CONTENT_REQUIRED" }
* Restore the [sample agent app](https://github.com/SubbuRamanathan/google-vertex-ai-agent-for-sitecore/raw/refs/heads/main/agent-builder/exported_agent_Lighthouse-Finance.zip) using the Restore App option within the created Agent. You may also build your own app comprising of agents & tools following the [Google Documentation](https://cloud.google.com/dialogflow/cx/docs/quick/build-agent-playbook). The sample agent includes the following,
  * Info Agent, which relies on Data Store Tool powered by the Data Store created above
  * Insights Agent, which depends on OpenAPI Tool that invokes a [function app](https://github.com/SubbuRamanathan/google-vertex-ai-agent-for-sitecore/tree/main/function-app) for Google Search grounding described in the below steps
* Create a Service Account for authentication from the [Credentials](https://console.cloud.google.com/apis/credentials) page
* Ensure the Service Account has permissions to 'Vertex AI Service Agent' and 'AI Platform Service Agent' roles
* For XP implementations, customize and deploy the [Sitecore Powershell Module](https://github.com/SubbuRamanathan/google-vertex-ai-agent-for-sitecore/tree/main/spe-module) in your Sitecore by following the steps described in the next section
  * Generate a P12 Key for the Service Account and add the downloaded certificate to _\sitecore modules\PowerShell\Vertex AI Agent Builder_ folder
* For XM Cloud implementations, install this [Connector SDK](https://app.workato.com/custom_adapters/594877?token=0fc70fdce7b0e1934cf2fc116d6716d0b92ae600ea5cf5340e12e590bb5d489a) and this [Recipe](https://app.workato.com/recipes/51251037?st=c5d9135ff2da9c86248ebb80191c5d0850ffc75f6c042d42feb4dfee3969faa4) in your Sitecore Connect and link the recipe to your XM Cloud Webhook. Source Code for the Connector & Recipe is also available in this repository [here](https://github.com/SubbuRamanathan/google-vertex-ai-agent-for-sitecore/tree/main/sitecore-connect).
  * Generate a JSON Key for the Service Account and leverage the credentials for creating a connection in Sitecore Connect
* If you would like to leverage Google Search Grounding, it is important to note that Agent Builder doesn't support that by default, and hence, you may need to build a Google Cloud function or similar solution to handle such a scenario via OpenAPI tool in the Agent. This repository includes a [sample function app](https://github.com/SubbuRamanathan/google-vertex-ai-agent-for-sitecore/tree/main/function-app) which analyzes the user's question, fetches the Website Agent response(powered by Sitecore content), appends the Publicly Available Information from Gemini AI API call with Google Search Grounding enabled, summarize the response and returns the response to the user
* Publish all content items necessary for the Chat/Search experience in Sitecore to populate the Data Store. You could publish the respective individual item or the parent item along with subitems for indexing
* Once you have validated the agent responses, you could embed the agent to your website using the 'Publish agent' option located in the top right of the Agent Builder
  
![Info Agent](https://github.com/SubbuRamanathan/google-vertex-ai-agent-for-sitecore/blob/main/agent-builder/Info%20Agent%20-%20Vertex%20AI%20Agent%20Builder.png?raw=true)

![Insights Agent](https://github.com/SubbuRamanathan/google-vertex-ai-agent-for-sitecore/blob/main/agent-builder/Insights%20Agent%20-%20Vertex%20AI%20Agent%20Builder.png?raw=true)

## To deploy, extend, or customize the SPE module for project-specific needs:
* Clone SPE folder of this GitHub repository
* Migrate the config & serialized items into your repository
* Sync the items with Sitecore
* Populate the General Settings(Templates & Fields to be included), Google OAuth, Data Store Settings in _/sitecore/system/Modules/PowerShell/Script Library/Vertex AI Agent Builder/Settings_. For production deployments, you may need to optimize the _Index-Content_ function to retrieve the secrets from Key Vault and/or any existing solution you may be following for storing/handling secrets.
* Validate and promote your changes to production!

## Considerations/Limitations:
* When you use Grounding with Google Search, and you receive Google Search Suggestions in your response, you must display the Search Suggestions in production and in your apps. More details [here](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/grounding-search-suggestions).
* Consider fine-tuning the model to match your brand guidelines if needed. Please note that fine-tuning involves additional costs. In most cases, you may also be able to achieve your goals via Prompt Engineering.
* Consider supplying more context about the person, his/her interests, historical information, etc., to Gemini AI from your orchestrating application for a personalized chat experience
* Set up log monitoring and alerting to track any indexing failures and address issues proactively. This module logs the failures within SPE.log files.
* You may need to customize the solution, including the module, build a custom app, etc., for supporting multiple languages, multiple publishing targets, etc.
* Apply Content Filters in Agent Builder Settings for filtering harmful content if needed

