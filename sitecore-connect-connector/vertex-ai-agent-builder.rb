{
  title: 'Vertex AI Agent Builder',

  connection: {
    fields: [
      { name: 'service_account_email',
        optional: false,
        hint: 'The service account created to delegate other domain users. ' \
              'e.g. name@project.iam.gserviceaccount.com' },
      { name: 'client_id', optional: false },
      { name: 'private_key',
        control_type: 'password',
        hint: 'Copy and paste the private key that came from the downloaded json. <br/>' \
        "Click <a href='https://developers.google.com/identity/protocols/oauth2/' " \
        "service-account/target='_blank'>here</a> to learn more about Google Service Accounts." \
        '<br><br>Required scope: <b>https://www.googleapis.com/auth/cloud-platform</b>',
        multiline: true,
        optional: false },
      { name: 'location',
        control_type: 'select',
        options: [
          ['Global','global'],
          ['US','us'],
          ['EU','eu']
        ],
        optional: false,
        hint: 'Select the location of your Data Store.' },
      { name: 'project',
        optional: false },
      { name: 'collection',
        default: 'default_collection',
        optional: false },
      { name: 'datastore',
        optional: false },
      { name: 'branch',
        default: '0',
        optional: false }
    ],
    authorization: {
      type: 'custom_auth',

      acquire: lambda do |connection|
        jwt_body_claim = {
          'iat' => now.to_i,
          'exp' => 1.hour.from_now.to_i,
          'aud' => 'https://oauth2.googleapis.com/token',
          'iss' => connection['service_account_email'],
          'sub' => connection['service_account_email'],
          'scope' => 'https://www.googleapis.com/auth/cloud-platform'
        }
        private_key = connection['private_key'].gsub(/\\n/, "\n")
        jwt_token =
          workato.jwt_encode(jwt_body_claim,
                             private_key, 'RS256',
                             kid: connection['client_id'])

        response = post('https://oauth2.googleapis.com/token',
                        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                        assertion: jwt_token).
                   request_format_www_form_urlencoded

        { access_token: response['access_token'] }
      end,

      apply: lambda do |connection|
        headers(Authorization: "Bearer #{connection['access_token']}")
      end
    },

    base_uri: lambda do |connection|
      "https://discoveryengine.googleapis.com/v1/"
    end
  },

  test: lambda do |connection|
    get("projects/#{connection['project']}/locations/#{connection['location']}/collections/#{connection['collection']}/dataStores/#{connection['datastore']}/branches/#{connection['branch']}/documents")
  end,

  actions: {
    import_document: {
      title: 'Import Document',
      subtitle: 'Import document into Agent Builder Data Store',
      description: "Import document into <span class='provider'>Data Store</span>",
      help: lambda do
        {
          body: 'This action will import document into Agent Builder Data Store.',
          learn_more_url: 'https://cloud.google.com/dialogflow/vertex/docs/concept/data-store',
          learn_more_text: 'Learn more'
        }
      end,

      input_fields: lambda do |object_definitions|
        object_definitions['import_document_input']
      end,

      execute: lambda do |connection, input|
        patch("projects/#{connection['project']}/locations/#{connection['location']}/collections/#{connection['collection']}/dataStores/#{connection['datastore']}/branches/#{connection['branch']}/documents/#{input['DocumentID']}?allowMissing=true", input['Document']).
          after_error_response(/.*/) do |_, body, _, message|
            error("#{message}: #{body}")
          end
      end,

      output_fields: lambda do |object_definitions|
        object_definitions['document']
      end
    }
  },

  object_definitions: {
    content: {
      fields: lambda do
        [
              { name: 'mimeType', type: 'string', default: 'text/plain' },
              { name: 'rawBytes', type: 'string' }
        ]
      end
    },
    structData: {
      fields: lambda do
        [
              { name: 'title', type: 'string' },
              { name: 'link', type: 'string' }
        ]
      end
    },
    document: {
      fields: lambda do |connection, config_fields, object_definitions|
        [
              { name: 'name', type: 'string', optional: false },
              { name: 'id', type: 'string', optional: false },
              { name: 'structData', type: 'object', properties: object_definitions['structData'], optional: false },
              { name: 'content', type: 'object', properties: object_definitions['content'], optional: false }
        ]
      end
    },
    import_document_input: {
      fields: lambda do |connection, config_fields, object_definitions|
        [
          { name: 'DocumentID',
            type: 'string',
            optional: false
          },
          { name: 'Document',
            type: 'object',
            properties: object_definitions['document'],
            optional: false
          }
        ]
      end
    }
  }
}