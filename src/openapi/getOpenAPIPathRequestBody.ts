import { ControllerAPI } from './types';
import { convertOpenAPIItems } from './constant';

const getOpenAPIPathRequestBody = (api: ControllerAPI) => {
  if (api.method === 'GET') return null;

  if (api.formData) {
    const type = api.formData.key === 'multiple' ? 'array' : 'object';
    let formDataProperties: any = {};

    if (type === 'array') {
      formDataProperties = {
        type: 'array',
        items: { format: 'binary', type: 'string' },
      };
    } else {
      formDataProperties = {
        type: 'string',
        format: 'binary',
      };
    }

    const otherProperties: Record<string, any> = {};
    if (Array.isArray(api.body)) {
      api.body.forEach(item => {
        otherProperties[item.key] = {
          type: item.type,
          example: item.example || item.default || (Array.isArray(item.type) ? item.type[0] : item.type),
        };
      });
    }

    return {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              [api.formData.key]: formDataProperties,
              ...otherProperties,
            },
          },
        },
      },
    };
  } else {
    const example: Record<string, any> = {};
    if (Array.isArray(api.body)) {
      api.body.forEach(item => {
        const type = item.type;
        if (item.example) {
          example[item.key] = item.example;
        } else if (item.default) {
          example[item.key] = item.default;
        } else if (item.type === 'array') {
          example[item.key] = ['array1', 'array2', 1, 2];
        } else if (item.type === 'object') {
          example[item.key] = {
            key1: 'value1',
            key2: 'value2',
          };
        }
      });
    }

    const requestBody = {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            example,
          },
        },
      },
    };

    return requestBody;
  }
};

export default getOpenAPIPathRequestBody;
