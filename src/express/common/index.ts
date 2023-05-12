import type { Request, Response, NextFunction } from 'express';

export type ExpressController = (req: Request, res: Response, next: NextFunction) => any | void | Promise<any | void>;

// @ts-ignore
export const wrapAsync: ExpressController = (fn: ExpressController) => {
  return (async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  }) as ExpressController;
};

export * from './Router';
export * from './ErrorController';
export * from './GlobalController';
export * from './Response';
export * from './App';
