import { OpenAPI3, OpenAPIOptions } from './types';
interface GetOpenAPIProps extends OpenAPIOptions {
  tags: any[];
  paths: any;
  schemas?: any;
}

const getOpenAPI = ({ title, version, urls, tags, paths, schemas }: GetOpenAPIProps): OpenAPI3 => ({
  openapi: '3.0.0',
  info: {
    title,
    version,
  },
  servers: urls.map(url => ({ url })),
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: schemas || {},
  },
  tags,
  paths,
});

export default getOpenAPI;
