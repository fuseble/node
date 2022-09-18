'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.convertAPISchema =
  exports.convertOpenAPIItems =
  exports.convertArrayToObject =
  exports.getNullableField =
  exports.OPEN_API_RESPONSES =
    void 0;
exports.OPEN_API_RESPONSES = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  404: 'Not Found',
  500: 'Server Internal Error',
};
const getNullableField = (item, target) => {
  let field = target;
  if (item.nullable) field += ' | null';
  return field;
};
exports.getNullableField = getNullableField;
const convertArrayToObject = (items, nullable) => {
  const obj = {};
  items.forEach(item => {
    if (item.type === 'array' || item.type === 'object') {
      obj[item.key] = (0, exports.convertOpenAPIItems)(item);
    } else {
      obj[item.key] = (0, exports.getNullableField)(item, item.type);
    }
  });
  if (nullable) return { NULLABLE: 'NULLABLE', ...obj };
  return obj;
};
exports.convertArrayToObject = convertArrayToObject;
const convertOpenAPIItems = item => {
  if (typeof item === 'string') return item;
  else if (item.example) return (0, exports.getNullableField)(item, item.example);
  else if (item.default) return (0, exports.getNullableField)(item, item.default);
  else if (item.type === 'array' && item.items) {
    if (typeof item.items === 'string') return ['string'];
    else return [(0, exports.convertArrayToObject)(item.items, item.nullable)];
  } else if (item.type === 'object' && item.items) {
    if (typeof item.items === 'string') return ['string'];
    else return (0, exports.convertArrayToObject)(item.items, item.nullable);
  } else {
    return item.type;
  }
};
exports.convertOpenAPIItems = convertOpenAPIItems;
const convertAPISchema = schema => {};
exports.convertAPISchema = convertAPISchema;
