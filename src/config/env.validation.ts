import { z } from "zod";

export const envSchema = z.object({
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().max(65535).min(0),
  NODE_ENV: z.enum(["development", "production"]),
  FLUIG_CONSUMER_KEY: z.string(),
  FLUIG_CONSUMER_SECRET: z.string(),
  FLUIG_ACCESS_TOKEN: z.string(),
  FLUIG_TOKEN_SECRET: z.string(),
});

export type Env = z.infer<typeof envSchema>;

declare global {
  namespace NodeJs {
    export interface ProcessEnv {
      [key: string]: any | undefined;
    }

    interface ProcessEnv extends Env {}
  }
}

envSchema.parse(process.env);
