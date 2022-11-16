import { type ControllerAPI, type ValidatorItem } from './types';
import { convertOpenAPIItems } from './constant';

const getRequestBodyExample = (body?: ValidatorItem[]) => {
  const examples: Record<string, any> = {};
  if (!body) return examples;

  body.forEach(item => {
    const { key } = item;

    if (item.example) examples[key] = item.example;
    else if (item.default) examples[key] = item.default;
    else if (item.type === 'string') examples[key] = 'string';
    else if (item.type === 'number') examples[key] = 123;
    else if (item.type === 'boolean') examples[key] = true;
    else if (item.type === 'array') {
      if (item.items === 'string') examples[key] = ['string1', 'string2'];
      if (item.items === 'number') examples[key] = [1, 2, 3];
      if (item.items === 'boolean') examples[key] = [true, false];
    } else if (item.type === 'object') {
      examples[key] = {
        key1: 'value1',
        key2: 'value2',
      };
    } else if (item.type === 'any') {
      examples[key] = 'any';
    }
  });

  return examples;
};

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
    const example = getRequestBodyExample(api.body);

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
