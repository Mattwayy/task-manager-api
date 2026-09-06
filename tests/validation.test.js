import { describe, it, expect } from 'vitest';
import { registerSchema } from '../src/schemas/authSchemas.js';
import { createTaskSchema } from '../src/schemas/taskSchemas.js';

describe('Zod Validation Schemas', () => {
  describe('Register Schema', () => {
    it('should validate valid user data', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123456',
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        username: 'testuser',
        email: 'invalid-email',
        password: '123456',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject short password', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Create Task Schema', () => {
    it('should validate valid task data', () => {
      const validData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
      };
      const result = createTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject task without title', () => {
      const invalidData = {
        description: 'Test Description',
        status: 'pending',
      };
      const result = createTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
