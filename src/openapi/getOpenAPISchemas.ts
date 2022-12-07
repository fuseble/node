import { Dictionary, DMMF } from './types';

const getOpenAPISchemas = (modelMap: Dictionary<DMMF.Model>, enums: any) => {
  const schemas: any = {};

  Object.entries(modelMap).forEach(([_, model]) => {
    schemas[model.name] = {
      type: 'object',
      properties: model.fields.reduce((acc, curr) => {
        if (curr.type === 'String') {
          acc[curr.name] = { type: 'string' };
        } else if (curr.type === 'Int') {
          acc[curr.name] = { type: 'integer', format: 'int64' };
        } else if (curr.type === 'DateTime') {
          acc[curr.name] = { type: 'string', format: 'date-time' };
        } else if (curr.kind === 'enum') {
          acc[curr.name] = { type: 'string', enum: Object.values(enums[curr.type] ?? {}) };
        }

        return acc;
      }, {} as any),
    };
  });

  Object.entries(modelMap).forEach(([_, model]) => {
    let properties = schemas?.[model.name]?.properties;

    if (typeof properties === 'object') {
      properties = model.fields.reduce((acc, curr) => {
        if (schemas[curr.type]) {
          if (curr.isList) {
            acc[curr.name] = { type: 'array', items: { $ref: `#/components/schemas/${curr.type}` } };
          } else {
            acc[curr.name] = { $ref: `#/components/schemas/${curr.type}` };
          }
        }
        return acc;
      }, properties);

      schemas[model.name].properties = properties;
    }
  });

  return schemas;
};

export default getOpenAPISchemas;
