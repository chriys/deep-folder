import { apiUrl } from "./client";

export function sendMessageRequest(
  convId: string,
  content?: string,
): Promise<Response> {
  const url = apiUrl(`/conversations/${convId}/messages`);
  const options: RequestInit = {
    method: "POST",
    credentials: "include",
  };
  if (content) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify({ content });
  }
  return fetch(url, options);
}

let counter = 0;
export function generateMessageId(): string {
  counter += 1;
  return `msg_${Date.now()}_${counter}`;
}
