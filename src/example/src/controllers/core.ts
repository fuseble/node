import { type Request, type Response, type NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { DMMF } from '@prisma/client/runtime';
import { flatten, unflatten } from 'flat';

declare interface Dictionary<T> {
  [key: string]: T;
}

export type PrismaFunctionsInterface = Record<keyof Dictionary<DMMF.Model>, PrismaFunctionInterface>;

export interface PrismaFunctionInterface {
  [DMMF.ModelAction.findUnique]?: any;
  [DMMF.ModelAction.findFirst]?: any;
  [DMMF.ModelAction.findMany]?: any;
  [DMMF.ModelAction.create]?: any;
  [DMMF.ModelAction.createMany]?: any;
  [DMMF.ModelAction.delete]?: any;
  [DMMF.ModelAction.deleteMany]?: any;
  [DMMF.ModelAction.update]?: any;
  [DMMF.ModelAction.updateMany]?: any;
}

export default class PrismaCore {
  public prisma: PrismaClient;
  public models: Dictionary<DMMF.Model>;

  public modelNames: string[] = [];

  constructor(prisma: PrismaClient, dmmfModels: Dictionary<DMMF.Model>) {
    this.prisma = prisma;
    this.models = dmmfModels;

    this.#modelNames();
  }

  public functions<T = Dictionary<DMMF.Model>>() {}

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

    options = flatten(options);

    Object.entries(options).forEach(([_optionKey, _optionValue]) => {
      Object.entries(request).forEach(([_requestKey, _requestValue]) => {
        if (typeof _optionValue === 'string' && _optionValue.includes('$_')) {
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

  #modelNames() {
    this.modelNames = Object.entries(this.models).map(([modelName]) => modelName);
  }

  #find(modelName: keyof Dictionary<DMMF.Model>, _options: PrismaFunctionInterface) {
    const findUnique = async (req: Request, res: Response, next: NextFunction) => {
      const options = this.#requestOptions(req, _options.findUnique);

      try {
        const row = await this.prisma[modelName].findUnique(options);
        if (!row) {
          throw { status: 404, message: `${modelName} 정보를 찾을 수 없습니다.` };
        }

        res.status(200).json({ row });
      } catch (error) {
        next(error);
      }
    };

    const findFirst = async (req: Request, res: Response, next: NextFunction) => {
      const options = this.#requestOptions(req, _options.findFirst);

      try {
        const row = await this.prisma[modelName].findFirst(options);
        if (!row) {
          throw { status: 404, message: `${modelName} 정보를 찾을 수 없습니다.` };
        }

        res.status(200).json({ row });
      } catch (error) {
        next(error);
      }
    };

    const findMany = async (req: Request, res: Response, next: NextFunction) => {
      const options = await this.#requestOptions(req, _options.findMany);

      try {
        const [count, rows] = await Promise.all([
          this.prisma[modelName].count({ where: options?.where ?? {} }),
          this.prisma[modelName].findMany(options),
        ]);

        res.status(200).json({ count, rows });
      } catch (error) {
        next(error);
      }
    };

    return { findUnique, findFirst, findMany };
  }

  #create(modelName: keyof Dictionary<DMMF.Model>) {
    const _create = this.prisma[modelName].create;
    const _createMany = this.prisma[modelName].createMany;

    return {
      create: _create,
      createMany: _createMany,
    };
  }

  #delete(modelName: keyof Dictionary<DMMF.Model>) {
    const _delete = this.prisma[modelName].delete;
    const _deleteMany = this.prisma[modelName].deleteMany;

    return {
      delete: _delete,
      deleteMany: _deleteMany,
    };
  }

  #update(modelName: keyof Dictionary<DMMF.Model>) {
    const _update = this.prisma[modelName].update;
    const _updateMany = this.prisma[modelName].updateMany;

    return {
      update: _update,
      updateMany: _updateMany,
    };
  }

  #function<T extends PrismaFunctionsInterface>(props?: T) {
    return this.modelNames.reduce((acc, modelName) => {
      let option = {} as PrismaFunctionInterface;
      if ((props as any)[modelName]) {
        option = (props as any)[modelName];
      }

      acc[modelName] = {
        ...this.#find(modelName as keyof Dictionary<DMMF.Model>, option),
        ...this.#create(modelName as keyof Dictionary<DMMF.Model>),
        ...this.#delete(modelName as keyof Dictionary<DMMF.Model>),
        ...this.#update(modelName as keyof Dictionary<DMMF.Model>),
      };

      return acc;
    }, {} as Record<keyof Dictionary<DMMF.Model>, any>);
  }
}
