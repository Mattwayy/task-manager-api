import client from './client';

type ApiError = {
  error?: string;
  errors?: { field: string; message: string }[];
};

const parseError = (error: unknown, fallback: string): string => {
  if (!error) return fallback;
  const err = error as ApiError;
  if (typeof err.error === 'string') return err.error;
  if (Array.isArray(err.errors) && err.errors.length > 0) {
    return err.errors.map((e) => e.message).join(', ');
  }
  return fallback;
};

export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
}) => {
  const { data: response, error } = await client.POST('/api/auth/register', {
    body: data,
  });
  if (error) throw new Error(parseError(error, 'Registration failed'));
  return response;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const { data: response, error } = await client.POST('/api/auth/login', {
    body: data,
  });
  if (error) throw new Error(parseError(error, 'Login failed'));
  if (response && 'token' in response) {
    localStorage.setItem('token', (response as { token: string }).token);
  }
  return response;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
};
