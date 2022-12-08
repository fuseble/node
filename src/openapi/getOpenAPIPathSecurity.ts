import { ControllerAPI } from './types';

const getOpenAPIPathSecurity = (api: ControllerAPI) => {
  const security = [];

  if (api.auth) {
    if (api.auth === 'jwt') {
      security.push({ bearerAuth: [] });
    } else if (api.auth === 'cookie') {
      security.push({ cookieAuth: [] });
    } else if (api.auth === 'basic') {
      security.push({ basicAuth: [] });
    } else if (api.auth === 'session') {
      security.push({ sessionAuth: [] });
    }
  } else if (!api.auth && api.authorize) {
    security.push({ bearerAuth: [] });
    security.push({ basicAuth: [] });
  }

  return security;
};

export default getOpenAPIPathSecurity;
