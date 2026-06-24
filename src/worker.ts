import { Job, Worker } from "bullmq";
import { QUEUE_NAME } from "./queue.js";
import { redisConection } from "./config/redis.js";

async function processPayment(order: any): Promise<void> {
  console.log(`[Worker] Processando pagamento do pedido ${order.orderId} — R$ ${order.totalAmount.toFixed(2)}`);
  await new Promise((resolve) => setTimeout(resolve, 800));
  console.log(`[Worker] Pagamento do pedido ${order.orderId} aprovado`);
}

export const orderWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    await processPayment(job.data);

    return {
      success: true,
      message: `Job ${job.name} processado com sucesso`,
      processedAt: new Date().toISOString(),
    };
  },
  { connection: redisConection },
);

orderWorker.on("completed", (job, result) => {
  console.log(`[WORKER] job ${job.id} finalizado: ${result.message}`);
});

orderWorker.on("failed", (job, error) => {
  console.error(`[Worker] Job ${job?.id} falhou: ${error.message}`);
});

console.log("[Worker] Order worker iniciado e aguardando jobs...");
