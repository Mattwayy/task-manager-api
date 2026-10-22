import { Request, Response } from 'express';
import pool from '../db.js';
import { Task } from '../types.js';

const checkTaskOwnership = async (taskId: number, userId: number): Promise<Task | null> => {
  const result = await pool.query<Task>(
    'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
    [taskId, userId]
  );
  return result.rows[0] || null;
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const result = await pool.query<Task>(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const userId = req.user!.id;

    const task = await checkTaskOwnership(id, userId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, status } = req.body;
    const userId = req.user!.id;

    const result = await pool.query<Task>(
      'INSERT INTO tasks (title, description, status, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, status || 'pending', userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const userId = req.user!.id;
    const { title, description, status } = req.body;

    const result = await pool.query<Task>(
      `UPDATE tasks 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           status = COALESCE($3, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [title, description, status, id, userId]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const userId = req.user!.id;

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
