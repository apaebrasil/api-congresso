import { fastify } from "fastify";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform, type ZodTypeProvider } from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import { fastifyCors } from "@fastify/cors";
import ScalarApiReference from "@scalar/fastify-api-reference";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATH", "DELETE", "OPTIONS"],
  // credentials: true, // permite que envie automaticamente os cookies que estão no cabeçalho do frontned para o backend caso esteja na mesma URL
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Webhook API congresso",
      description: "API para o congresso nacional das apaes",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

// Ao acessar docs vai ver a documentação da API
app.register(ScalarApiReference, {
  routePrefix: "/docs",
});

app.get("/", () => {
  console.log("Hello Docker api");
  return { message: "HEllo Docler api" };
});

app.listen({ port: 3000, host: "0.0.0.0" }).then(() => {
  console.log("Servidor HTTP rodando no http://localhost:3000");
  console.log("Documentação rodando no http://localhost:3000/docs");
});
