# Google Vertex AI Agent Builder + Sitecore Integration
This repository contains the Sitecore PowerShell & Sitecore Connect Modules for building AI-Powered Chat/Search Experience with content from Sitecore XP & XMC leveraging Google Vertex AI Agent Builder, DialogFlow CX, and Google Search Grounding. 

## Prerequisites
* Active Google Cloud Subscription

## Setup & Configuration
* 

## To deploy, extend, or customize this module for project-specific needs:
* Clone this Github repository
* Migrate the config & serialized items into your repository
* Sync the items with Sitecore
* Populate the General Settings(Templates & Fields to be included), Azure OAuth, OpenAI, and Cognitive Search Settings in _/sitecore/system/Modules/PowerShell/Script Library/Vertex AI Agent Builder/Settings_. For production deployments, you may need to optimize the _Index-Content_ function to retrieve the secrets from Key Vault and/or any existing solution you may be following for storing/handling secrets.
* Validate and promote your changes to production!

## Considerations/Limitations:
* Consider fine-tuning the model to match your brand guidelines if needed. Please note that fine-tuning involves additional costs. In most cases, you may also be able to achieve your goals via Prompt Engineering.
* Consider supplying more context about the person, his/her interests, historical information, etc., to Gemini AI from your orchestrating application for a personalized chat experience
* Set up log monitoring and alerting to track any indexing failures and address issues proactively. This module logs the failures within SPE.log files.
* You may need to customize the solution, including module, build cusom app, etc., for supporting multiple languages, multiple publishing targets, etc.
* Apply Content Filters in Agent Builder Settings for filtering harmful content if needed

