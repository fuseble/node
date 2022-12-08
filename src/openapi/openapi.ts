import type { OpenAPIOptions, ControllerAPI } from './types';

import getOpenAPI from './getOpenAPI';
import getOpenAPITags from './getOpenAPITags';
import getOpenAPIPath from './getOpenAPIPath';
import getOpenAPIPathSummary from './getOpenAPIPathSummary';
import getOpenAPIPathSecurity from './getOpenAPIPathSecurity';
import getOpenAPIPathParameters from './getOpenAPIPathParameters';
import getOpenAPIPathRequestBody from './getOpenAPIPathRequestBody';
import getOpenAPIPathResponses from './getOpenAPIPathResponses';
import getOpenAPISchemas from './getOpenAPISchemas';

export interface CreateOpenAPIOptions extends OpenAPIOptions {
  controllers: any;
  modelMap?: any;
  enums?: any;
}

const getOpenAPIPaths = async (controllers: Record<string, any>) => {
  const paths: any = {};

  Object.entries(controllers).forEach(([key, value]: [string, any]) => {
    if (key.includes('API')) {
      const api = value as ControllerAPI;
      const name = key.replace('API', '');

      const path = getOpenAPIPath(api);
      const summary = getOpenAPIPathSummary(api, name);
      const description = api.description ? `# ${name}\n${api.description}` : `# ${name}`;
      const security = getOpenAPIPathSecurity(api);
      const parameters = getOpenAPIPathParameters(api);
      const requestBody = getOpenAPIPathRequestBody(api);
      const responses = getOpenAPIPathResponses(api);

      paths[path] = {
        ...paths[path],
        [api.method.toLowerCase()]: {
          tags: api.tags || [],
          summary,
          description,
          security,
          parameters,
          responses,
          requestBody,
        },
      };
    }
  });
  return paths;
};

const createOpenAPI = async ({
  title,
  version,
  urls,
  controllers,
  modelMap,
  enums,
}: CreateOpenAPIOptions): Promise<string> => {
  const tags = getOpenAPITags(controllers);
  const schemas = getOpenAPISchemas(modelMap, enums);
  const paths = await getOpenAPIPaths(controllers);
  const result = getOpenAPI({ title, version, urls, tags, paths, schemas });

  return JSON.stringify(result);
};

export default createOpenAPI;
