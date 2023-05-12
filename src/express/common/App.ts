import express, { Application } from 'express';
import http from 'http';
import * as bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import {
  createOpenAPI,
  Validator,
  json,
  urlencoded,
  cors,
  pagination,
  createRouter,
  errorController,
  globalController,
  type OpenAPIOptions,
  type IErrorProps,
  type IGlobalProps,
  type ExpressController,
} from '@/index';
import originDebug from '@/debug';

export interface AppProps {
  controllers?: Record<string, any>;
  authControllers?: Record<string, ExpressController>;
  modelMap?: Record<string, any>;
  enums?: Record<string, any>;
  openAPI?: {
    path: string;
    options?: OpenAPIOptions;
    endPoint?: string;
  };
}

const defaultOpenAPIOptions: OpenAPIOptions = {
  title: '@fuseble.inc/node',
  version: '1.0.0',
  urls: ['http://localhost:8000'],
};

const debug = originDebug('App');

export class App {
  public app: Application;
  public server: http.Server;

  private controllers: any;
  private authControllers?: Record<string, ExpressController>;
  private modelMap?: any;
  private enums?: any;
  private openAPI?: AppProps['openAPI'];

  constructor(props?: AppProps) {
    this.app = express();
    this.server = http.createServer(this.app);

    if (props) {
      this.controllers = props?.controllers ?? {};
      this.authControllers = props?.authControllers;
      this.modelMap = props?.modelMap;
      this.enums = props?.enums;

      if (props.openAPI?.path) {
        this.openAPI = {
          path: props.openAPI.path,
          options: props.openAPI?.options || defaultOpenAPIOptions,
          endPoint: props.openAPI?.endPoint || '/api-docs',
        };
      }
    }
  }

  public listen(
    port: number,
    props?: {
      callback?: () => void;
      keepAliveTimeout?: number;
      headersTimeout?: number;
    },
  ) {
    debug(`app listen ${port}`);
    this.server.listen(port, props?.callback);
    this.server.keepAliveTimeout = props?.keepAliveTimeout ?? 90 * 1000;
    this.server.headersTimeout = props?.headersTimeout ?? 90 * 1000;
  }

  public async init() {
    if (this.openAPI) {
      const openAPI = await createOpenAPI({
        ...(this.openAPI.options as OpenAPIOptions),
        controllers: this.controllers,
        modelMap: this.modelMap,
        enums: this.enums,
      });
      await fs.writeFileSync(this.openAPI.path, openAPI);
      debug('openapi created', this.openAPI.path);
    }
  }

  public applyMiddlewares(middlewares?: ExpressController[]) {
    if (!middlewares || !Array.isArray(middlewares) || middlewares.length === 0) {
      return;
    }

    middlewares.forEach(middleware => {
      this.app.use(middleware);
    });
  }

  public middlewares(
    middlewares?: ExpressController[] | { before?: ExpressController[]; after?: ExpressController[] },
    props?: {
      corsOption?: cors.CorsOptions;
      jsonOption?: bodyParser.Options;
      urlencodedOption?: bodyParser.OptionsUrlencoded;
    },
  ) {
    this.app.use(cors(props?.corsOption ?? {}));
    this.app.use(json(props?.jsonOption ?? {}));
    this.app.use(urlencoded(props?.urlencodedOption ?? { extended: true }));
    this.app.use(express.static('public'));
    this.app.use(pagination());

    if (this.openAPI) {
      const document = require(this.openAPI.path);
      this.app.use(this.openAPI.endPoint as string, swaggerUi.serve as any, swaggerUi.setup(document) as any);
      this.app.get('/api-json', (req, res) => res.contentType('application/json').send(require(this.openAPI!.path)));
    }

    if (Array.isArray(middlewares)) {
      this.applyMiddlewares(middlewares);
    } else {
      if (!Array.isArray(middlewares) && middlewares?.before) {
        this.applyMiddlewares(middlewares.before);
      }

      if (!Array.isArray(middlewares) && middlewares?.after) {
        this.applyMiddlewares(middlewares.after);
      }
    }
  }

  public routers(options?: { errorOptions?: IErrorProps; globalOptions?: IGlobalProps }) {
    createRouter({
      app: this.app,
      controllers: this.controllers,
      authControllers: this.authControllers,
      validators: Validator.create(this.controllers),
    });

    this.app.use(errorController(options?.errorOptions));
    this.app.use(globalController(options?.globalOptions));
  }
}
