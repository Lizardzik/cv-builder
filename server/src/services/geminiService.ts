import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { log, withTimeout } from "../utils/logger.js";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const FREE_MODELS = ["gemini-3.5-flash-lite"];
const PAID_FALLBACK_MODELS = ["gemini-3.7-flash", "gemini-3.8-flash"];

export const AVAILABLE_MODELS =
  process.env.ALLOW_PAID_FALLBACK === "true"
    ? [...FREE_MODELS, ...PAID_FALLBACK_MODELS]
    : FREE_MODELS;

const GEMINI_CALL_TIMEOUT_MS = 25000;

export function hasApiKey(): boolean {
  return Boolean(apiKey && apiKey.trim().length > 0);
}

export async function generateWithModelFallback(
  payloadCreator: (model: string) => any,
  reqId: string
): Promise<any> {
  let lastError: any = null;

  for (const model of AVAILABLE_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      GEMINI_CALL_TIMEOUT_MS
    );

    const attemptStart = Date.now();
    try {
      log(reqId, `-> wywołuję model "${model}"...`);
      const payload = payloadCreator(model);
      payload.config = {
        ...(payload.config || {}),
        abortSignal: controller.signal,
      };

      const response = await withTimeout(
        ai.models.generateContent(payload),
        GEMINI_CALL_TIMEOUT_MS,
        `Model ${model} nie odpowiedział w ciągu ${GEMINI_CALL_TIMEOUT_MS / 1000}s.`
      );

      log(
        reqId,
        `<- sukces z modelem "${model}" (${Date.now() - attemptStart}ms)`
      );
      return response;
    } catch (err: any) {
      const isTimeout =
        err.name === "TimeoutError" || err.name === "AbortError";
      lastError = err;

      const isRetryable =
        isTimeout || err.status === 503 || err.status === 429;

      log(
        reqId,
        `<- model "${model}" nieudany po ${Date.now() - attemptStart}ms (${
          isTimeout ? "TIMEOUT" : err.status || err.message
        }). ${isRetryable ? "Próbuję kolejny model..." : "Przerywam."}`
      );

      if (isRetryable) continue;
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError;
}