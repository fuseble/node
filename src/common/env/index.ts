export type EnvType = 'string' | 'boolean' | 'number' | 'json' | 'auto';

export type Env = { key: string; type?: EnvType } | string;

const parseJsonValue = (value: string): any | null => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const parseAutoValue = (value: string) => {
  const valueWithNumber = Number(value);
  if (!isNaN(valueWithNumber)) return valueWithNumber;

  const isBoolValue = value === 'TRUE' || value === 'FALSE' || value === 'true' || value === 'false';
  if (isBoolValue) return value === 'TRUE' || value === 'true';

  const valueWithJson = parseJsonValue(value);
  if (valueWithJson) return valueWithJson;

  return value;
};

const parseValue = (value: string, type?: EnvType): any | null => {
  if (!type) return value;

  switch (type) {
    case 'string':
      return value;
    case 'boolean':
      return value === 'TRUE' || value === 'true';
    case 'number':
      return Number(value);
    case 'json':
      return parseJsonValue(value);
    case 'auto':
    default:
      return parseAutoValue(value);
  }
};

export const parseEnv = <T = any>(values: any, envs: Env[]): T => {
  const result: any = {} as T;

  envs.forEach(item => {
    if (typeof item === 'string') {
      result[item] = parseValue(values[item], 'auto');
    } else {
      const { key, type } = item;
      const value = values[key];
      result[key] = parseValue(value, type);
    }
  });

  return result;
};
