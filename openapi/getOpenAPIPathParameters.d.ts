import { ControllerAPI } from './types';
declare const getOpenAPIPathParameters: (api: ControllerAPI) => {
  name: string;
  in: string;
  required?: boolean | undefined;
  description?: string | undefined;
  schema: {
    type: string;
    enum?: string[];
  };
}[];
export default getOpenAPIPathParameters;
