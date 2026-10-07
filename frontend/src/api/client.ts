import createClient from 'openapi-fetch';
import type { paths } from '../api.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const client = createClient<paths>({
  baseUrl: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.use({
  onRequest({ request }) {
    const token = localStorage.getItem('token');
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  },
});

export default client;
