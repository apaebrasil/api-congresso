import { Worker } from "bullmq";
import { QUEUE_NAME, WebHookJobData } from "../queue/queue.js";
import { redisConection } from "../../config/redis.js";
import { fetchWithOAuth } from "@/config/auth.js";
import { AxiosResponse } from "axios";

async function processPayment<Teste>({ data, url }: { data: Teste; url: string }): Promise<AxiosResponse<Teste>> {
  console.log(`[Worker] Processando pagamento do pedido ${JSON.stringify(data)}`);
  try {
    const response = await fetchWithOAuth<any>({ method: "POST", url, data });
    console.log(`[Worker] Pagamento do pedido aprovado com status: ${response.status}`);
    return response;
  } catch (error: any) {
    console.error("=================== [AXIOS ERROR DETALHADO] ===================");

    if (error.response) {
      console.error(`Status do Erro: ${error.response.status}`);
      console.error(`Cabecalhos da Resposta:`, JSON.stringify(error.response.headers, null, 2));
      console.error(`Corpo do Erro (Mensagem do Fluig):`, JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error("Nenhuma resposta foi recebida do servidor.");
      console.error("Detalhes da requisicao feita:", error.request);
    } else {
      console.error("Erro ao configurar a requisicao HTTP:", error.message);
    }

    console.error("Configuracao completa do Axios utilizada:", {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      headers: error.config?.headers,
      data: error.config?.data,
    });
    console.error("===============================================================");

    throw error;
  }
}

export const orderWorker = new Worker<WebHookJobData, any>(
  QUEUE_NAME,
  async (job) => {
    const { payload, urlDestino } = job.data;
    const response = await processPayment({ data: payload, url: urlDestino });

    console.log("response teste: ", response);

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
