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
  [key: string]: PrismaFunctionInterface;
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
  public customs: PrismaFunctionsGroup = {};

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.modelNames = Object.keys((this.prisma as any)._baseDmmf?.modelMap);
  }

  public init<ModelClients = PrismaFunctionInterfaces>(options?: ModelClients) {
    return this.modelNames.reduce((acc, modelName) => {
      const option = (options as any)?.[modelName];
      return { ...acc, [modelName]: this.create(modelName, modelName, option) };
    }, {});
  }

  public get<ModelClient = PrismaFunctionInterface>(modelName: string, option?: ModelClient) {
    if (this.functions[modelName]) return this.functions[modelName];

    return this.create<ModelClient>(modelName, modelName, option);
  }

  public create<ModelClient = PrismaFunctionInterface>(modelName: string, name: string, option?: ModelClient) {
    const functionGroup = {
      ...this.#find(modelName, option),
      ...this.#create(modelName, option),
      ...this.#delete(modelName, option),
      ...this.#update(modelName, option),
    } as PrismaFunctions;

    if (modelName === name) {
      this.functions = {
        ...this.functions,
        [name]: functionGroup,
      };
    } else {
      this.customs = {
        ...this.customs,
        [name]: functionGroup,
      };
    }

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

  #parse(value: string, type?: string) {
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
        if (typeof _optionValue === 'string' && _optionValue.includes('$')) {
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

        const row = await (this.prisma as any)[(modelName as string).toLowerCase()].findUnique(options);
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

        const row = await (this.prisma as any)[(modelName as string).toLowerCase()].findFirst(options);
        if (!row) {
          throw { status: 404, message: `${modelName} 정보를 찾을 수 없습니다.` };
        }

        res.status(200).json({ row });
      } catch (error) {
        next(error);
      }
    };

    const findMany = async (req: Request, res: Response, next: NextFunction) => {
      const options = await this.#requestOptions(req, _options?.findMany);

      try {
        if (options.callback) {
          return await options.callback(req, res, next, options);
        }

        const [count, rows] = await Promise.all([
          (this.prisma as any)[(modelName as string).toLowerCase()].count({ where: options?.where ?? {} }),
          (this.prisma as any)[(modelName as string).toLowerCase()].findMany(options),
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

        const row = await (this.prisma as any)[(modelName as string).toLowerCase()].create(options);

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

        const rows = await (this.prisma as any)[(modelName as string).toLowerCase()].createMany(options);

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

        const row = await (this.prisma as any)[(modelName as string).toLowerCase()].delete(options);

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

        const rows = await (this.prisma as any)[(modelName as string).toLowerCase()].deleteMany(options);

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

        const row = await (this.prisma as any)[(modelName as string).toLowerCase()].findFirst({ where: options.where });
        if (!row) {
          throw { status: 404, message: `${modelName} 정보를 찾을 수 없습니다.` };
        }

        await (this.prisma as any)[(modelName as string).toLowerCase()].update(options);

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

        const rows = await (this.prisma as any)[(modelName as string).toLowerCase()].updateMany(options);

        res.status(200).json({ rows });
      } catch (error) {
        next(error);
      }
    };

    return { update, updateMany };
  }
}

export default PrismaCore;
