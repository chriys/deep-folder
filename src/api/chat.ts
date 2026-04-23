export function sendMessageRequest(convId: string): Promise<Response> {
  return fetch(`/conversations/${convId}/messages`, { method: "POST" });
}

let counter = 0;
export function generateMessageId(): string {
  counter += 1;
  return `msg_${Date.now()}_${counter}`;
}
