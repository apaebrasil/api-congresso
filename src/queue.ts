import { redisConection } from "@/config/redis.js";
import { Queue, QueueEvents } from "bullmq";

export const QUEUE_NAME = "orders";

export const orderQueue = new Queue(QUEUE_NAME, {
  connection: redisConection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 60 * 60 * 24,
      count: 500,
    },
    removeOnFail: {
      age: 60 * 60 * 24 * 7,
    },
  },
});

export const orderQueueEvents = new QueueEvents(QUEUE_NAME, {
  connection: redisConection,
});

orderQueueEvents.on("completed", ({ jobId }) => {
  console.log(`[QUEUE] Job ${jobId} concluído com sucesso`);
});

orderQueueEvents.on("failed", ({ jobId, failedReason }) => {
  console.log(`[QUEUE] Job ${jobId} falhou: ${failedReason}`);
});

orderQueueEvents.on("stalled", ({ jobId }) => {
  console.log(`[QUEUE] Job ${jobId} travado - será reprocessado`);
});
