import { type ControllerAPI } from '@fuseble.inc/node';
import functions from './functions';

export const getAdminUsersAPI: ControllerAPI = {
  tags: ['User'],
  method: 'GET',
  path: '/admin/users',
};

export const getAdminUserAPI: ControllerAPI = {
  tags: ['User'],
  method: 'GET',
  path: '/admin/users/:id',
};

export const getAdminUsers = functions.User.findMany;
export const getAdminUser = functions.User.findUnique;
