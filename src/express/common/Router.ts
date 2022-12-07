import type { Application } from 'express';
import type { ControllerAPI, ControllerAPIMethodLowerCase } from '../../openapi';
import { ExpressController } from './index';

export interface CreateRouterProps {
  app: Application;
  controllers: Record<string, ExpressController | ControllerAPI>;
  authControllers?: Record<string, ExpressController>;
  validators?: any;
}

export const createRouter = ({ app, controllers, authControllers, validators }: CreateRouterProps) => {
  Object.entries(controllers).forEach(([key, value]: [string, any]) => {
    if (key.includes('API')) {
      const api = value as ControllerAPI;

      const name = key.replace('API', '');
      const controller = controllers[name];

      const path = api.path;
      const method = api.method.toLowerCase() as ControllerAPIMethodLowerCase;
      const middlewares: ExpressController[] = [...(api.middlewares || []), ...(validators[name] || [])];
      if (api.authorize && authControllers?.[api.authorize]) {
        middlewares.unshift(authControllers[api.authorize] as ExpressController);
      }

      if (method && path && controller) {
        app[method](path, ...middlewares, controller as ExpressController);
      }
    }
  });
};
