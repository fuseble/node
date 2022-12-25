import type { Request, Response, NextFunction } from 'express';
import createGlobalHtml from './createGlobalHtml';

export interface IGlobalProps {
  html?: string;
  title?: string;
  status?: number;
}

export const globalController = (props?: IGlobalProps) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const html = props?.html || createGlobalHtml(props?.title);
    const status = props?.status || 404;

    res.status(status).contentType('html').send(html);
  };
};
