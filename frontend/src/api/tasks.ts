import client from './client';

type ApiError = {
  error?: string;
  errors?: { field: string; message: string }[];
};
type TaskStatus = 'pending' | 'in_progress' | 'completed';

const parseError = (error: unknown, fallback: string): string => {
  if (!error) return fallback;
  const err = error as ApiError;
  if (typeof err.error === 'string') return err.error;
  if (Array.isArray(err.errors) && err.errors.length > 0) {
    return err.errors.map((e) => e.message).join(', ');
  }
  return fallback;
};

export const getTasks = async () => {
  const { data, error } = await client.GET('/api/tasks');
  if (error) throw new Error(parseError(error, 'Failed to fetch tasks'));
  return data;
};

export const createTask = async (data: {
  title: string;
  description?: string;
  status?: TaskStatus;
}) => {
  const { data: response, error } = await client.POST('/api/tasks', {
    body: data as any,
  });
  if (error) throw new Error(parseError(error, 'Failed to create task'));
  return response;
};

export const updateTask = async (
  id: number,
  data: { title?: string; description?: string; status?: TaskStatus }
) => {
  const { data: response, error } = await client.PUT('/api/tasks/{id}', {
    params: { path: { id } },
    body: data as any,
  });
  if (error) throw new Error(parseError(error, 'Failed to update task'));
  return response;
};

export const deleteTask = async (id: number) => {
  const { error } = await client.DELETE('/api/tasks/{id}', {
    params: { path: { id } },
  });
  if (error) throw new Error(parseError(error, 'Failed to delete task'));
};
