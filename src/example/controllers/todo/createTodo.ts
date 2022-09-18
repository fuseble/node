import { ControllerAPI } from '../../../openapi';
import { ExpressController } from '../../../express';

export const createTodoAPI: ControllerAPI = {
  tags: ['Todo'],
  method: 'POST',
  path: '/todos',
  body: [{ key: 'content', type: 'any' }],
};

export const createTodo: ExpressController = async (req, res, next) => {
  try {
    res.status(201).json({ ...req.body });
  } catch (error) {
    next(error);
  }
};
