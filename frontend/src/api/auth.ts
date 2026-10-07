import client from './client';

type ApiError = { message?: string };

export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
}) => {
  const { data: response, error } = await client.POST('/api/auth/register', {
    body: data,
  });
  if (error) throw new Error((error as ApiError)?.message || 'Registration failed');
  return response;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const { data: response, error } = await client.POST('/api/auth/login', {
    body: data,
  });
  if (error) throw new Error((error as ApiError)?.message || 'Login failed');
  if (response && typeof response === 'object' && 'token' in response) {
    localStorage.setItem('token', (response as { token: string }).token);
  }
  return response;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
};
