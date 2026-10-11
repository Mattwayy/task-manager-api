import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import authMiddleware from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Task Manager API is running!' });
});

app.use('/api/auth', (req, res, next) => {
  console.log('🔥 AUTH REQUEST:', req.method, req.originalUrl);
  next();
});

app.use('/api/auth', authRoutes);
app.get('/profile', authMiddleware, (req, res) => {
  res.json({ message: 'You have accessed protected data!', user: req.user });
});
app.use('/api/tasks', taskRoutes);

export default app;
