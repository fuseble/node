'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const constant_1 = require('./constant');
const getOpenAPIPathRequestBody = api => {
  if (api.method === 'GET') return null;
  if (api.formData) {
    const type = api.formData.key === 'multiple' ? 'array' : 'object';
    let formDataProperties = {};
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
    const otherProperties = {};
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
    const example = {};
    if (Array.isArray(api.body)) {
      api.body.forEach(item => {
        let type = item.type;
        if (item.nullable) type += ' | null';
        if (item.example) {
          example[item.key] = item.example;
        } else if (item.default) {
          example[item.key] = item.default;
        } else
          example[item.key] =
            item.type === 'array' || item.type === 'object' ? (0, constant_1.convertOpenAPIItems)(item) : type;
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
exports.default = getOpenAPIPathRequestBody;
