import z from 'zod';

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Безопасно обрабатываем ошибки — errors может быть undefined
        const errors = (error.errors || error.issues || []).map((err) => ({
          field: err.path?.join('.') || 'unknown',
          message: err.message || 'Validation error',
        }));
        return res.status(400).json({ errors });
      }
      next(error);
    }
  };
};

export default validate;
