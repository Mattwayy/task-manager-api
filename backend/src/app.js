import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import authMiddleware from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Task Manager API is running!' });
});

app.use('/api/auth', authRoutes);
app.get('/profile', authMiddleware, (req, res) => {
    res.json({ message: 'You have accessed protected data!', user: req.user });
});
app.use('/api/tasks', taskRoutes);

export default app;

if (import.meta.url === `file://${process.argv[1]}`) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}
