import client from './client';

type ApiError = {
  error?: string;
  errors?: { field: string; message: string }[];
};
type TaskStatus = 'pending' | 'in_progress' | 'completed';

export class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const parseError = (error: unknown, fallback: TaskStatus): string => {
  if (!error) return fallback;
  const err = error as ApiError;
  if (typeof err.error === 'string') return err.error;
  if (Array.isArray(err.errors) && err.errors.length > 0) {
    return err.errors.map((e) => e.message).join(', ');
  }
  return fallback;
};

export const getTasks = async () => {
  const { data, error, response } = await client.GET('/api/tasks');
  if (error) throw new ApiRequestError(parseError(error, 'Failed to fetch tasks'), response.status);
  return data;
};

export const createTask = async (data: {
  title: string;
  description?: string;
  status?: TaskStatus;
}) => {
  const { data: response, error, response: raw } = await client.POST('/api/tasks', { body: data });
  if (error) throw new ApiRequestError(parseError(error, 'Failed to create task'), raw.status);
  return response;
};
export const updateTask = async (
  id: number,
  data: { title?: string; description?: string; status?: TaskStatus }
) => {
  const { data: response, error, response: rawResponse } = await client.PUT('/api/tasks/{id}', {
    params: { path: { id } },
    body: data,
  });
  if (error) throw new ApiRequestError(parseError(error, 'Failed to update task'), rawResponse.status);
  return response;
};

export const deleteTask = async (id: number) => {
  const { error, response } = await client.DELETE('/api/tasks/{id}', {
    params: { path: { id } },
  });
  if (error) throw new ApiRequestError(parseError(error, 'Failed to delete task'), response.status);
};
