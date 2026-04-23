import { useCallback, useRef } from "react";
import { useParams } from "react-router";
import { useStore } from "../stores";
import { readSSEStream } from "../api/readSSE";
import { sendMessageRequest, generateMessageId } from "../api/chat";
import { MessageList } from "../components/MessageList";
import { ChatInput } from "../components/ChatInput";
import { CitationPanel } from "../components/CitationPanel";
import type { Message } from "../types";

export function Chat() {
  const { convId } = useParams();
  const messages = useStore((s) => s.messages);
  const streamStatus = useStore((s) => s.streamStatus);
  const addMessage = useStore((s) => s.addMessage);
  const appendStreamContent = useStore((s) => s.appendStreamContent);
  const appendStreamCitation = useStore((s) => s.appendStreamCitation);
  const finalizeMessage = useStore((s) => s.finalizeMessage);
  const setMessageError = useStore((s) => s.setMessageError);
  const removeMessage = useStore((s) => s.removeMessage);
  const closeCitationPanel = useStore((s) => s.closeCitationPanel);

  const sendingRef = useRef(false);

  const handleSend = useCallback(
    async (content: string) => {
      if (!convId || sendingRef.current) return;
      sendingRef.current = true;
      closeCitationPanel();

      const userMsg: Message = {
        id: generateMessageId(),
        role: "user",
        content,
        citations: [],
        tool_calls: [],
      };
      const assistantMsg: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: "",
        citations: [],
        tool_calls: [],
        status: "pending",
      };

      addMessage(userMsg);
      addMessage(assistantMsg);

      let doneOrError = false;

      try {
        const response = await sendMessageRequest(convId, content);
        const result = await readSSEStream(response, {
          text_delta: ({ content }) =>
            appendStreamContent(assistantMsg.id, content),
          citation: ({ citation }) =>
            appendStreamCitation(assistantMsg.id, citation),
          done: () => {
            doneOrError = true;
            finalizeMessage(assistantMsg.id);
          },
          error: ({ message }) => {
            doneOrError = true;
            setMessageError(assistantMsg.id, message);
          },
        });

        if (!doneOrError) {
          if (result === "implicit_done") {
            finalizeMessage(assistantMsg.id);
          } else {
            setMessageError(
              assistantMsg.id,
              "Connection lost. Please try again.",
            );
          }
        }
      } catch {
        if (!doneOrError) {
          setMessageError(
            assistantMsg.id,
            "Connection lost. Please try again.",
          );
        }
      } finally {
        sendingRef.current = false;
      }
    },
    [
      convId,
      addMessage,
      appendStreamContent,
      appendStreamCitation,
      finalizeMessage,
      setMessageError,
      closeCitationPanel,
    ],
  );

  const handleRetry = useCallback(
    (messageId: string) => {
      const msgs = useStore.getState().messages;
      const idx = msgs.findIndex((m) => m.id === messageId);
      if (idx < 1) return;
      const userMsg = msgs[idx - 1];
      if (userMsg.role !== "user") return;

      removeMessage(messageId);
      removeMessage(userMsg.id);
      handleSend(userMsg.content);
    },
    [removeMessage, handleSend],
  );

  const isStreaming = streamStatus === "streaming";

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} onRetry={handleRetry} />
      </div>
      <ChatInput onSend={handleSend} disabled={isStreaming} />
      <CitationPanel />
    </div>
  );
}
