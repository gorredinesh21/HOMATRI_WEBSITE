"use client";

import { useCallback, useEffect, useState } from "react";
import ChatAuditStream from "../_components/ChatAuditStream";
import { adminApi, chatsStreamUrl, getAdminToken } from "@/lib/adminApi";
import { normalizeChats } from "@/lib/adminNormalize";

function parseSse(buffer, onEvent) {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() || "";
  for (const block of parts) {
    const dataLines = [];
    for (const line of block.split("\n")) {
      if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) continue;
    try {
      onEvent(JSON.parse(dataLines.join("\n")));
    } catch {
      /* ignore malformed */
    }
  }
  return rest;
}

export default function AdminChatsPage() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await adminApi.chats({ limit: 80 });
      setMessages(normalizeChats(data));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const poll = setInterval(load, 8000);
    const controller = new AbortController();
    const token = getAdminToken();
    (async () => {
      try {
        const response = await fetch(chatsStreamUrl(), {
          headers: {
            Accept: "text/event-stream",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
          signal: controller.signal,
        });
        if (!response.ok || !response.body) return;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          buffer = parseSse(buffer, (payload) => {
            const row = payload?.data || payload;
            setMessages((prev) => [
              ...prev,
              ...normalizeChats([row]),
            ]);
          });
        }
      } catch {
        /* polling remains the source of truth */
      }
    })();
    return () => {
      clearInterval(poll);
      controller.abort();
    };
  }, [load]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl font-medium">Live chat audit</h1>
        <p className="text-sm text-homatri-muted">GET /api/admin/chats · stream /api/admin/chats/stream</p>
      </header>
      {error ? <p className="text-xs text-homatri-muted">{error}</p> : null}
      <ChatAuditStream
        messages={messages}
        selectedCustomerId={selected}
        onSelectCustomer={setSelected}
        isLoading={loading}
        onSendMessage={async () => {
          throw new Error("WhatsApp replies are sent from Escalation HITL via POST /api/admin/escalations/resolve.");
        }}
      />
    </div>
  );
}
