import { type Request, type Response, type NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { flatten, unflatten } from 'flat';
import { type ExpressController } from '../index';

export enum ModelAction {
  findUnique = 'findUnique',
  findFirst = 'findFirst',
  findMany = 'findMany',
  create = 'create',
  createMany = 'createMany',
  update = 'update',
  updateMany = 'updateMany',
  upsert = 'upsert',
  delete = 'delete',
  deleteMany = 'deleteMany',
  groupBy = 'groupBy',
  count = 'count',
  aggregate = 'aggregate',
  findRaw = 'findRaw',
  aggregateRaw = 'aggregateRaw',
}
export type PrismaCallback = (req: Request, res: Response, next: NextFunction, options: any) => any | Promise<any>;

export type PrismaArgsWithCallback<T> = T & { callback?: PrismaCallback };

export type PrismaFunctionInterfaces = {
  [key: string]: PrismaFunctionInterface | any;
  function?: string;
};

export type PrismaFunctionInterface = {
  [P in Partial<ModelAction>]: any;
};

export type PrismaFunctionsGroup = {
  [key: string]: PrismaFunctions;
};

export type PrismaFunctions = {
  [P in Partial<ModelAction>]: ExpressController;
};

export class PrismaCore {
  public prisma: PrismaClient;
  public modelNames: string[] = [];

  public functions: PrismaFunctionsGroup = {};

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.modelNames = Object.keys((this.prisma as any)._baseDmmf?.modelMap);
  }

  public init<ModelClients = PrismaFunctionInterfaces>(options?: ModelClients) {
    return this.modelNames.reduce((acc, modelName) => {
      const option = (options as any)?.[modelName];
      return { ...acc, [modelName]: this.create(modelName, option?.function ?? modelName, option) };
    }, {});
  }

  public get<ModelClient = PrismaFunctionInterface>(modelName: string, option?: ModelClient) {
    if (this.functions[modelName]) return this.functions[modelName];

    return this.create<ModelClient>(modelName, modelName, option);
  }

  public create<ModelClient = PrismaFunctionInterface>(modelName: string, functionName: string, option?: ModelClient) {
    const functionGroup = {
      ...this.#find(functionName, option),
      ...this.#create(functionName, option),
      ...this.#delete(functionName, option),
      ...this.#update(functionName, option),
    } as PrismaFunctions;

    this.functions = {
      ...this.functions,
      [modelName]: functionGroup,
    };

    return functionGroup;
  }

  #is_json(value: string): boolean {
    try {
      const result = JSON.parse(value);
      if (result && typeof result === 'object') {
        return true;
      }
      throw new Error('not json');
    } catch (error) {
      return false;
    }
  }

  #parse_auto(value: string) {
    const isNumberValue = Number(value);
    const isBooleanValue = value === 'TRUE' || value === 'FALSE' || value === 'true' || value === 'false';
    const isJsonValue = this.#is_json(value);

    if (isNumberValue) {
      return isNumberValue;
    } else if (isBooleanValue) {
      return value === 'TRUE' || value === 'true';
    } else if (isJsonValue) {
      return JSON.parse(value);
    } else {
      return value;
    }
  }

  #parse(value: any, type?: string) {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value;
    }

    switch (type) {
      case 'string':
        return value;
      case 'boolean':
        return value === 'TRUE' || value === 'true';
      case 'number':
        return Number(value);
      case 'json':
        return JSON.parse(value);
      case 'auto':
        return this.#parse_auto(value);
      default:
        return this.#parse_auto(value);
    }
  }

  #requestOptions(req: Request, options?: any) {
    const { params, query, body } = req;
    const request = { ...params, ...query, ...body };

    options = flatten(options ?? {});

    Object.entries(options).forEach(([_optionKey, _optionValue]) => {
      Object.entries(request).forEach(([_requestKey, _requestValue]) => {
        if (typeof _optionValue === 'string' && _optionValue.startsWith(`$${_requestKey}`)) {
          let optionKey = _optionValue.replace('$', '');
          let dataType = 'auto';

          if (optionKey.includes('$')) {
            optionKey = optionKey.split('$')[0];
            dataType = optionKey.split('$')[1];
          }

          if (_requestKey === optionKey) {
            options[_optionKey] = this.#parse(_requestValue as string, dataType);
          }
        }
      });
    });

    Object.entries(options).forEach(([_optionKey, _optionValue]) => {
      if (typeof _optionValue === 'string' && _optionValue.includes('$')) {
        delete options[_optionKey];
      }
    });

    return unflatten(options) as any;
  }

  #find(modelName: string, _options?: any) {
    const findUnique = async (req: Request, res: Response, next: NextFunction) => {
      const options = this.#requestOptions(req, _options?.findUnique);

      try {
        if (options.callback) {
          return await options.callback(req, res, next, options);
        }

        const row = await (this.prisma as any)[modelName].findUnique(options);
        if (!row) {
          throw { status: 404, message: `${modelName} 정보를 찾을 수 없습니다.` };
        }

        res.status(200).json({ row });
      } catch (error) {
        next(error);
      }
    };

    const findFirst = async (req: Request, res: Response, next: NextFunction) => {
      const options = this.#requestOptions(req, _options?.findFirst);

      try {
        if (options.callback) {
          return await options.callback(req, res, next, options);
        }

        const row = await (this.prisma as any)[modelName].findFirst(options);
        if (!row) {
          throw { status: 404, message: `${modelName} 정보를 찾을 수 없습니다.` };
        }

        res.status(200).json({ row });
      } catch (error) {
        next(error);
      }
    };

    const findMany = async (req: Request, res: Response, next: NextFunction) => {
      const page = (req.query?.page || '1') as string;
      const limit = (req.query?.limit || '20') as string;

      const take = Number(limit) || 20;
      const skip = (Number(page) - 1) * take;

      const options = { ...(await this.#requestOptions(req, _options?.findMany)), skip, take };

      try {
        if (options.callback) {
          return await options.callback(req, res, next, options);
        }

        const [count, rows] = await Promise.all([
          (this.prisma as any)[modelName].count({ where: options?.where ?? {} }),
          (this.prisma as any)[modelName].findMany(options),
        ]);

        res.status(200).json({ count, rows });
      } catch (error) {
        next(error);
      }
    };

    return { findUnique, findFirst, findMany };
  }

  #create(modelName: string, _options?: any) {
    const create = async (req: Request, res: Response, next: NextFunction) => {
      const options = this.#requestOptions(req, _options?.create);

      try {
        if (options.callback) {
          return await options.callback(req, res, next, options);
        }

        const row = await (this.prisma as any)[modelName].create(options);

        res.status(200).json({ row });
      } catch (error) {
        next(error);
      }
    };

    const createMany = async (req: Request, res: Response, next: NextFunction) => {
      const options = this.#requestOptions(req, _options?.createMany);

      try {
        if (options.callback) {
          return await options.callback(req, res, next, options);
        }

        const rows = await (this.prisma as any)[modelName].createMany(options);

        res.status(200).json({ rows });
      } catch (error) {
        next(error);
      }
    };

    return { create, createMany };
  }

  #delete(modelName: string, _options?: any) {
    const deleteUniuqe = async (req: Request, res: Response, next: NextFunction) => {
      const options = this.#requestOptions(req, _options?.delete);

      try {
        if (options.callback) {
          return await options.callback(req, res, next, options);
        }

        const row = await (this.prisma as any)[modelName].delete(options);

        res.status(200).json({ row });
      } catch (error) {
        next(error);
      }
    };

    const deleteMany = async (req: Request, res: Response, next: NextFunction) => {
      const options = this.#requestOptions(req, _options?.deleteMany);

      try {
        if (options.callback) {
          return await options.callback(req, res, next, options);
        }

        const rows = await (this.prisma as any)[modelName].deleteMany(options);

        res.status(200).json({ rows });
      } catch (error) {
        next(error);
      }
    };

    return { delete: deleteUniuqe, deleteMany };
  }

  #update(modelName: string, _options?: any) {
    const update = async (req: Request, res: Response, next: NextFunction) => {
      const options = this.#requestOptions(req, _options?.update);

      try {
        if (options.callback) {
          return await options.callback(req, res, next, options);
        }

        const row = await (this.prisma as any)[modelName].findFirst({ where: options.where });
        if (!row) {
          throw { status: 404, message: `${modelName} 정보를 찾을 수 없습니다.` };
        }

        await (this.prisma as any)[modelName].update(options);

        res.status(204).end();
      } catch (error) {
        next(error);
      }
    };

    const updateMany = async (req: Request, res: Response, next: NextFunction) => {
      const options = this.#requestOptions(req, _options?.updateMany);

      try {
        if (options.callback) {
          return await options.callback(req, res, next, options);
        }

        const rows = await (this.prisma as any)[modelName].updateMany(options);

        res.status(200).json({ rows });
      } catch (error) {
        next(error);
      }
    };

    return { update, updateMany };
  }
}

export default PrismaCore;
