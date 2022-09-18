import type { ControllerAPI, ExpressController } from '../../../express';

export const createPostAPI: ControllerAPI = {
  path: '/posts',
  method: 'PATCH',
  middlewares: [],
  body: [
    { key: 'title', type: 'string' },
    { key: 'content', type: 'string' },
    { key: 'phoneNumber', type: 'string' },
    {
      key: 'phoneNumbers',
      type: 'array',
      nullable: true,
      items: [
        { key: 'id', type: 'string', nullable: true },
        { key: 'ids', type: 'array', items: [{ key: 'hi', type: 'string', nullable: true }] },
      ],
    },
    {
      key: 'heelo',
      type: 'object',
      nullable: true,
      items: [
        { key: 'id', type: 'string', nullable: true },
        { key: 'array', type: 'array', items: 'sdfsd' },
        { key: 'array2', type: 'array', items: [{ key: 'id', type: 'string' }] },
      ],
    },
    {
      key: 'tag',
      type: 'number',
      example: 'LUCKYCHART : 1 TAROT : 2 ',
    },
  ],
};

export const createPost: ExpressController = async (req, res, next) => {
  try {
    res.status(200).json({
      body: req.body,
      ...req.query,
    });
  } catch (error) {
    next({ status: 500, message: 'Server Internal Error' });
  }
};
