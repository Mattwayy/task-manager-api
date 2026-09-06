import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/db.js';

describe('Tasks API (Protected Routes)', () => {
  let token;

  beforeAll(async () => {
    await pool.query('DELETE FROM tasks');
    await pool.query('DELETE FROM users');
    await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');

    await request(app).post('/api/auth/register').send({
      username: 'taskuser',
      email: 'task@example.com',
      password: '123456',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'task@example.com',
      password: '123456',
    });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM tasks');
    await pool.end();
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          status: 'pending',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Test Task');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'No token provided');
    });
  });
});
