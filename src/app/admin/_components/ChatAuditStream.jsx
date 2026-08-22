"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatAuditStream({
  messages = [],
  selectedCustomerId,
  onSelectCustomer,
  onSendMessage,
  isLoading,
}) {
  const [draftMessage, setDraftMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const scroller = useRef(null);

  useEffect(() => {
    if (autoScrollEnabled && scroller.current) {
      scroller.current.scrollTop = scroller.current.scrollHeight;
    }
  }, [messages, autoScrollEnabled]);

  const send = async (event) => {
    event.preventDefault();
    if (!selectedCustomerId || !draftMessage.trim()) return;
    setIsSending(true);
    try {
      await onSendMessage?.(selectedCustomerId, draftMessage.trim());
      setDraftMessage("");
    } catch (error) {
      setDraftMessage(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-4 h-[70vh]">
      <aside className="lg:col-span-2 bg-white border border-homatri-border rounded-3xl overflow-y-auto">
        {isLoading ? <p className="p-4 text-sm text-homatri-muted">Loading audit feed…</p> : null}
        {(messages || []).length === 0 && !isLoading ? (
          <p className="p-4 text-sm text-homatri-muted">No chat events yet from GET /api/admin/chats.</p>
        ) : null}
        <ul>
          {messages.map((message) => (
            <li key={message.messageId}>
              <button
                type="button"
                onClick={() => onSelectCustomer(message.customerId)}
                className={`w-full text-left px-4 py-3 border-b border-homatri-border ${
                  selectedCustomerId === message.customerId ? "bg-homatri-orange-light" : ""
                }`}
              >
                <p className="text-xs font-semibold">
                  {message.channel} · {message.direction}
                </p>
                <p className="text-sm truncate">{message.messageText}</p>
                <p className="text-[11px] text-homatri-muted">{message.customerId}</p>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="lg:col-span-3 bg-white border border-homatri-border rounded-3xl flex flex-col">
        <div className="px-4 py-3 border-b text-sm font-medium">
          {selectedCustomerId || "Select a conversation"}
          <label className="ml-3 text-xs font-normal">
            <input
              type="checkbox"
              checked={autoScrollEnabled}
              onChange={(event) => setAutoScrollEnabled(event.target.checked)}
              className="mr-1"
            />
            Auto-scroll
          </label>
        </div>
        <div ref={scroller} className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages
            .filter((message) => !selectedCustomerId || message.customerId === selectedCustomerId)
            .map((message) => (
              <div
                key={message.messageId}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  message.direction === "OUTBOUND"
                    ? "ml-auto bg-homatri-orange text-white"
                    : "bg-homatri-cream"
                }`}
              >
                <p className="text-[10px] opacity-70">{message.senderRole}</p>
                <p>{message.messageText}</p>
                <p className="text-[10px] opacity-70 mt-1">{message.createdAt}</p>
              </div>
            ))}
        </div>
        <form onSubmit={send} className="p-3 border-t flex gap-2">
          <input
            value={draftMessage}
            onChange={(event) => setDraftMessage(event.target.value)}
            placeholder="WhatsApp reply to this phone"
            className="flex-1 border rounded-xl px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isSending || !selectedCustomerId}
            className="bg-homatri-orange text-white text-sm font-semibold px-4 rounded-xl disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
