import axios, { AxiosError, AxiosResponse } from "axios";
import crypto from "node:crypto";
import OAtuh from "oauth-1.0a";
import dotEnv from "dotenv";

dotEnv.config();

interface FetchWithOAuthProps<T> {
  method: string;
  url: string;
  data: T;
}

const api = axios.create({
  baseURL: "https://federacaonacional201538.fluig.cloudtotvs.com.br",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const oauth = new OAtuh({
  consumer: {
    key: String(process.env.FLUIG_CONSUMER_KEY),
    secret: String(process.env.FLUIG_CONSUMER_SECRET),
  },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});

const token = {
  key: String(process.env.FLUIG_ACCESS_TOKEN),
  secret: String(process.env.FLUIG_TOKEN_SECRET),
};

export async function fetchWithOAuth<T>({ method, data, url }: FetchWithOAuthProps<T>): Promise<AxiosResponse<T> | any> {
  const absoluteUrl = `https://federacaonacional201538.fluig.cloudtotvs.com.br${url}`;

  try {
    const requestData = {
      url: absoluteUrl,
      method: method.toLocaleUpperCase(),
    };
    const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

    const response = await api({
      method: requestData.method,
      url: url,
      data: data,
      headers: {
        ...authHeader,
      },
    });

    return response;
  } catch (error: any) {
    if (error.response) {
      throw error;
    }
    throw new Error(`Erro ao fazer requisicao: ${error.message}`);
  }
}
