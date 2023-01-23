import debug from 'debug';

export const getDebugCreator = (name: string) => {
  return debug(`${name}:`);
};

export const getPrefixDebugCreator = (prefix: string) => {
  return (name: string) => getDebugCreator(`${prefix}:${name}`);
};
