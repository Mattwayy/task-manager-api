import z from 'zod';

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      console.error('[validate] Zod error:', error);
      if (error instanceof z.ZodError) {
       const errors = error.issues.map((err) => ({
          field: err.path?.join('.') || 'unknown',
          message: err.message || 'Validation error',
        }));
        return res.status(400).json({ errors });
      }
      return res.status(400).json({ errors: [{ field: 'unknown', message: 'Invalid request data' }] });
    }
  };
};

export default validate;
