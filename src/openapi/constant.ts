import { ControllerAPIResponseSchema, ValidatorItem } from './types';

export const OPEN_API_RESPONSES = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  404: 'Not Found',
  500: 'Server Internal Error',
};

export const getNullableField = (item: ValidatorItem, target: string): string => {
  let field = target;

  if (item.nullable) field += ' | null';

  return field;
};

export const convertArrayToObject = (items: ValidatorItem[], nullable: boolean | undefined) => {
  const obj: Record<string, any> = {};
  items.forEach(item => {
    if (item.type === 'array' || item.type === 'object') {
      obj[item.key] = convertOpenAPIItems(item);
    } else {
      obj[item.key] = getNullableField(item, item.type);
    }
  });
  if (nullable) return { NULLABLE: 'NULLABLE', ...obj };
  return obj;
};

export const convertOpenAPIItems = (item: ValidatorItem | string): string | object | Array<any> => {
  if (typeof item === 'string') return item;
  else if (item.example) return getNullableField(item, item.example);
  else if (item.default) return getNullableField(item, item.default);
  else if (item.type === 'array' && item.items) {
    if (typeof item.items === 'string') return ['string'];
    else return [convertArrayToObject(item.items, item.nullable)];
  } else if (item.type === 'object' && item.items) {
    if (typeof item.items === 'string') return ['string'];
    else return convertArrayToObject(item.items, item.nullable);
  } else {
    return item.type;
  }
};

export const convertAPISchema = (schema: ControllerAPIResponseSchema) => {};
