import Express, { Application } from 'express';
import fs from 'fs';
import { createOpenAPI, OpenAPIOptions } from '../../openapi';
import { json, urlencoded, cors, pagination, swagger } from '../middlewares';

import { createRouter, errorController, globalController, IErrorProps, IGlobalProps, ExpressController } from '.';
import Validator from '../validator';

const defaultOpenAPIOptions: OpenAPIOptions = {
  title: 'outqource-node/express',
  version: '1.0.0',
  urls: ['http://localhost:8000'],
};

type InitAppOpenAPI = {
  path: string;
  options?: OpenAPIOptions;
  endPoint?: string;
};

export interface InitAppProps {
  controllers: Record<string, any>;
  authControllers?: Record<string, ExpressController>;
  modelMap?: Record<string, any>;
  enums?: Record<string, any>;
  openAPI?: InitAppOpenAPI;
}

export class App {
  public app: Application;
  private controllers: any;
  private authControllers?: Record<string, ExpressController>;
  private modelMap?: any;
  private enums?: any;
  private openAPI?: InitAppOpenAPI;

  constructor(props: InitAppProps) {
    this.app = Express();
    this.controllers = props?.controllers;
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

  public listen(port: number, callback?: () => void) {
    this.app.listen(port, callback);
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
      corsOptions?: cors.CorsOptions;
    },
  ) {
    const corsOptions = props?.corsOptions;

    // default
    this.app.use(cors(corsOptions));
    this.app.use(json({}));
    this.app.use(urlencoded({ extended: true }));
    this.app.use(Express.static('public'));
    this.app.use(pagination());

    if (!Array.isArray(middlewares) && middlewares?.before) {
      this.applyMiddlewares(middlewares.before);
    }

    if (this.openAPI) {
      this.app.use(this.openAPI.endPoint as string, ...swagger(this.openAPI.path));
    }

    if (Array.isArray(middlewares)) {
      this.applyMiddlewares(middlewares);
    }

    if (!Array.isArray(middlewares) && middlewares?.after) {
      this.applyMiddlewares(middlewares.after);
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
    this.app.get('/', (req, res) => res.redirect(this.openAPI?.endPoint ?? '/api-docs'));
    this.app.get('/healthy', (req, res) => res.status(200).send('Health Check'));
  }
}

export const ExpressApp = App;
