import { ControllerAPIResponseSchema, ValidatorItem } from './types';
export declare const OPEN_API_RESPONSES: {
  200: string;
  201: string;
  204: string;
  400: string;
  401: string;
  404: string;
  500: string;
};
export declare const getNullableField: (item: ValidatorItem, target: string) => string;
export declare const convertArrayToObject: (
  items: ValidatorItem[],
  nullable: boolean | undefined,
) => Record<string, any>;
export declare const convertOpenAPIItems: (item: ValidatorItem | string) => string | object | Array<any>;
export declare const convertAPISchema: (schema: ControllerAPIResponseSchema) => void;
