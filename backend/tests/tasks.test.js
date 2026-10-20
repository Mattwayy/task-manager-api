import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/db.js';

describe('Tasks API (Protected Routes)', () => {
  let tokenA, tokenB;
  let taskIdA;

  beforeAll(async () => {
    await pool.query('TRUNCATE TABLE tasks, users RESTART IDENTITY CASCADE');

    // User A
    await request(app).post('/api/auth/register').send({
      username: 'userA',
      email: 'usera@test.com',
      password: '123456',
    });
    const loginA = await request(app).post('/api/auth/login').send({
      email: 'usera@test.com',
      password: '123456',
    });
    tokenA = loginA.body.token;

    // User B
    await request(app).post('/api/auth/register').send({
      username: 'userB',
      email: 'userb@test.com',
      password: '123456',
    });
    const loginB = await request(app).post('/api/auth/login').send({
      email: 'userb@test.com',
      password: '123456',
    });
    tokenB = loginB.body.token;

    // User A creates a task
    const taskRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'User A Task' });
    taskIdA = taskRes.body.id;
  });
it('should return only own tasks', async () => {
  const res = await request(app)
    .get('/api/tasks')
    .set('Authorization', `Bearer ${tokenB}`);
  expect(res.status).toBe(200);
  expect(res.body).toEqual([]);
});
it('should return own tasks for user A', async () => {
  const res = await request(app)
    .get('/api/tasks')
    .set('Authorization', `Bearer ${tokenA}`);
  expect(res.status).toBe(200);
  expect(res.body.length).toBeGreaterThan(0);
  expect(res.body[0]).toHaveProperty('title', 'User A Task');
});

  afterAll(async () => {
    await pool.query('DELETE FROM tasks');
    await pool.query('DELETE FROM users');
    await pool.end();
  });

  it('should create a new task', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'New Task', description: 'Test' });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('title', 'New Task');
  });

  it('should return 401 without token', async () => {
    const response = await request(app).post('/api/tasks').send({ title: 'Test' });
    expect(response.status).toBe(401);
  });

  it('should NOT allow user B to read user A task', async () => {
    const response = await request(app)
      .get(`/api/tasks/${taskIdA}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(response.status).toBe(404);
  });

  it('should NOT allow user B to update user A task', async () => {
    const response = await request(app)
      .put(`/api/tasks/${taskIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Hacked' });
    expect(response.status).toBe(404);
  });

  it('should NOT allow user B to delete user A task', async () => {
    const response = await request(app)
      .delete(`/api/tasks/${taskIdA}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(response.status).toBe(404);
  });

  it('should allow user A to read own task', async () => {
    const response = await request(app)
      .get(`/api/tasks/${taskIdA}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('title', 'User A Task');
  });
});
