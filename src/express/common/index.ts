import type { Request, Response, NextFunction } from 'express';

export type ExpressController = (req: Request, res: Response, next: NextFunction) => any | void | Promise<any | void>;

export function wrapAsync(fn: ExpressController): ExpressController {
  return async function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    await fn(req, res, next).catch(next);
  };
}

export * from './Router';
export * from './ErrorController';
export * from './GlobalController';
export * from './Response';
export * from './App';
