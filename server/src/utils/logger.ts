import crypto from "node:crypto";

export function newRequestId(): string {
  return crypto.randomBytes(4).toString("hex");
}

export function log(reqId: string, message: string): void {
  const timestamp = new Date().toISOString().slice(11, 23);
  console.log(`[${timestamp}] [${reqId}] ${message}`);
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutMessage: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error(timeoutMessage) as Error & { status?: number };
      error.status = 504;
      error.name = "TimeoutError";
      reject(error);
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}