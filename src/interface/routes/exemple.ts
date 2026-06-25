import { FastifyTypedInstance } from "@/config/fastify-instance.js";
import { orderQueue } from "@/infrastructure/queue/queue.js";
import z from "zod";

const exempleSchema = z.object({
  txt_nome_participante: z.string(),
  txt_cpf: z.string(),
  txt_email: z.string().email(),
  slc_tipo_ingresso: z.string(),
  num_valor_pago: z.string(),
});

export async function exemplePost(app: FastifyTypedInstance) {
  app.post(
    "/test",
    {
      schema: {
        tags: ["test"],
        description: "Create teste data",
        body: exempleSchema,
      },
    },
    async (request, reply) => {
      const { txt_cpf, num_valor_pago, slc_tipo_ingresso, txt_email, txt_nome_participante } = request.body;

      const job = await orderQueue.add("orders", {
        payload: {
          values: [
            {
              fieldId: "txt_cpf",
              value: txt_cpf,
            },
            {
              fieldId: "num_valor_pago",
              value: num_valor_pago,
            },
            {
              fieldId: "slc_tipo_ingresso",
              value: slc_tipo_ingresso,
            },
            {
              fieldId: "txt_email",
              value: txt_email,
            },
            {
              fieldId: "txt_nome_participante",
              value: txt_nome_participante,
            },
          ],
        },
        urlDestino: "/ecm-forms/api/v2/cardindex/214427/cards",
      });

      return { teste: job };
    },
  );
}
