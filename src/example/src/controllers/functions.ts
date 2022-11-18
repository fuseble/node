import database from 'database';
import Core, { type PrismaArgsWithCallback } from 'controllers/core';

import { Prisma } from '@prisma/client';

const core = new Core(database);

export const userAdminFunctions = core.function<{
  findUnique: PrismaArgsWithCallback<Prisma.UserFindUniqueArgs>;
  findMany: PrismaArgsWithCallback<Prisma.UserFindManyArgs>;
  findFirst: Prisma.UserFindFirstArgs;
}>('User', {
  findMany: {},
  findUnique: {
    where: {
      id: '$id',
    },
    include: {
      posts: true,
    },
    callback: async (req, res, next, options) => {
      res.status(200).json({ row: options });
    },
  },
  findFirst: {
    where: {
      id: '#id',
    },
    include: {
      posts: true,
    },
  },
});
