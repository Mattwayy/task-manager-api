const required = ['JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
}

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const PORT = parseInt(process.env.PORT || '3000');
