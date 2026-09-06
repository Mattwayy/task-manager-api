import z from 'zod';

const taskStatuses = ['pending', 'in_progress', 'completed'];

export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title is too long'),
  description: z.string()
    .optional()
    .default(''),
  status: z.enum(taskStatuses)
    .optional()
    .default('pending')
});

export const updateTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title is too long')
    .optional(),
  description: z.string()
    .optional(),
  status: z.enum(taskStatuses)
    .optional()
});
