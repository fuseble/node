import { ControllerAPI, ControllerAPIResponse, ControllerAPIResponsStatusCode } from './types';
import { OPEN_API_RESPONSES } from './constant';

const getOpenAPIPathResponses = (api: ControllerAPI) => {
  const responses: any = {
    500: {
      description: OPEN_API_RESPONSES[500],
      content: {
        'application/json': {},
      },
    },
  };

  // Response 있을 경우
  if (Array.isArray(api.responses)) {
    api.responses.forEach((item: ControllerAPIResponse) => {
      if (typeof item === 'number') {
        const statusCode = item as ControllerAPIResponsStatusCode;
        responses[statusCode] = {
          description: OPEN_API_RESPONSES[statusCode] as string,
          content: {
            'application/json': {},
          },
        };
      } else {
        const {
          status,
          message = OPEN_API_RESPONSES[item.status],
          exampleContentType = 'application/json',
          example = {},
        } = item;
        const content: any = { [exampleContentType]: {} };

        if (example) {
          content[exampleContentType].example = example;
        }

        responses[status] = {
          description: message,
          content,
        };
      }
    });
  } else if (!Array.isArray(api.responses) && api.schema) {
    if (api.method === 'GET') {
      responses[200] = {
        description: `${OPEN_API_RESPONSES[200]} ${api.schema} 성공`,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                row: {
                  $ref: '#/components/schemas/' + api.schema,
                },
                rows: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/' + api.schema,
                  },
                },
              },
            },
          },
        },
      };
    } else if (api.method === 'POST') {
      responses[201] = {
        description: `${OPEN_API_RESPONSES[201]} ${api.schema} 성공`,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                row: {
                  $ref: '#/components/schemas/' + api.schema,
                },
              },
            },
          },
        },
      };
    }
  } else if (api.method === 'GET') {
    responses[200] = {
      description: OPEN_API_RESPONSES[200],
      content: { 'application/json': {} },
    };
  } else if (api.method === 'POST') {
    responses[201] = {
      description: OPEN_API_RESPONSES[201],
      content: { 'application/json': {} },
    };
  } else if (api.method === 'DELETE' || api.method === 'PATCH' || api.method === 'PUT') {
    responses[204] = {
      desciption: OPEN_API_RESPONSES[204],
      content: { 'application/json': {} },
    };
  }

  return responses;
};

export default getOpenAPIPathResponses;
