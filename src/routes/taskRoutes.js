import express from 'express';
import authMiddleware from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema } from '../schemas/taskSchemas.js';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', validate(createTaskSchema), createTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;
