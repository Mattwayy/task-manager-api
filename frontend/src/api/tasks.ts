import client from './client';

type ApiError = { message?: string };
type TaskStatus = 'pending' | 'in_progress' | 'completed';

export const getTasks = async () => {
  const { data, error } = await client.GET('/api/tasks');
  if (error) throw new Error((error as ApiError)?.message || 'Failed to fetch tasks');
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
  if (error) throw new Error((error as ApiError)?.message || 'Failed to create task');
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
  if (error) throw new Error((error as ApiError)?.message || 'Failed to update task');
  return response;
};

export const deleteTask = async (id: number) => {
  const { error } = await client.DELETE('/api/tasks/{id}', {
    params: { path: { id } },
  });
  if (error) throw new Error((error as ApiError)?.message || 'Failed to delete task');
};
