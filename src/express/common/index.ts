import type { Request, Response, NextFunction } from 'express';
export type ExpressController = (req: Request, res: Response, next: NextFunction) => any | Promise<any>;

export * from './Router';
export * from './ErrorController';
export * from './GlobalController';
export * from './Response';
export * from './App';
