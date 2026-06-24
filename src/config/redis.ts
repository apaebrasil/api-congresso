import { ConnectionOptions } from "bullmq";

export const redisConection: ConnectionOptions = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  password: undefined,
  maxRetriesPerRequest: null,
};
