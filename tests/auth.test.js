import { describe, it, expect } from 'vitest';
import bcrypt from 'bcrypt';

describe('Auth - Password Hashing', () => {
  it('should hash password correctly', async () => {
    const password = '123456';
    const hashed = await bcrypt.hash(password, 10);
    
    expect(hashed).not.toBe(password);
    expect(hashed).toMatch(/^\$2[aby]\$.+/);
  });

  it('should compare password with hash', async () => {
    const password = '123456';
    const hashed = await bcrypt.hash(password, 10);
    
    const isValid = await bcrypt.compare(password, hashed);
    expect(isValid).toBe(true);
    
    const isInvalid = await bcrypt.compare('wrong', hashed);
    expect(isInvalid).toBe(false);
  });
});
