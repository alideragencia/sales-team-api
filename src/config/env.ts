import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`) });

import { z } from 'zod';

console.log(process.env)

const envSchema = z.object({
  FIREBASE_API_KEY: z.string().min(1),
  FIREBASE_AUTH_DOMAIN: z.string().min(1),
  FIREBASE_DATABASE_URL: z.string().min(1),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_STORAGE_BUCKET: z.string().min(1),
  FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  FIREBASE_APP_ID: z.string().min(1),
  FIREBASE_MEASUREMENT_ID: z.string().min(1),

  REDRIVE_OWNER_ID: z.string().min(1),
  REDRIVE_TOKEN: z.string().min(1),

  GROQ_API_KEY: z.string().optional(),

  APIFY_BASE_URL: z.string().min(1),
  APIFY_TOKEN: z.string().min(1),

  DATABASE_URL: z.string().min(1),


  PORT: z.coerce.number().default(8080)
});

const _env = envSchema.safeParse(process.env);


if (!_env.success) {
  console.error('❌ Invalid environment variables', _env.error.format());
  throw new Error('Invalid environment varibles.');
}

console.log(_env.data)
export const env = _env.data;
