"use client";
import React, { useRef, useState } from "react";

type Message = { id: string; role: "user" | "assistant"; content: string };
type Props = {
  onTalking?: (talking: boolean) => void;
  style?: React.CSSProperties;
  model?: string; // 可保留从外部固定传入，例如 "Claude-Sonnet-4"
  systemPrompt?: string;
};

export default function ChatFloating({
  onTalking,
  style,
  model = "GPT-5",
  systemPrompt = "You are a travel agent. Be descriptive and helpful.",
}: Props) {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Message[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);

  function scrollToBottom() {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }

  async function send() {
    const text = input.trim();
    if (!text || sendingRef.current) return;

    const userId = crypto.randomUUID();
    const replyId = crypto.randomUUID();

    setInput("");
    setMsgs((m) => [
      ...m,
      { id: userId, role: "user", content: text },
      { id: replyId, role: "assistant", content: "" },
    ]);

    onTalking?.(true);
    sendingRef.current = true;

    try {
      // 组织要发给服务端的消息上下文
      const history = msgs.map((m) => ({ role: m.role, content: m.content }));
      const body = {
        model, // 如果你的服务端已经固定模型，可以删掉这一行
        system: systemPrompt,
        messages: [...history, { role: "user", content: text }],
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok || !res.body) {
        const errTxt = await res.text().catch(() => "");
        throw new Error(errTxt || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunkText = decoder.decode(value, { stream: true });
        if (!chunkText) continue;

        setMsgs((m) =>
          m.map((x) => (x.id === replyId ? { ...x, content: x.content + chunkText } : x))
        );
        scrollToBottom();
      }
    } catch (err: any) {
      const msg = err?.message || "请求失败，请稍后重试。";
      setMsgs((m) =>
        m.map((x) =>
          x.id === replyId ? { ...x, content: `出错：${msg}` } : x
        )
      );
    } finally {
      sendingRef.current = false;
      onTalking?.(false);
      requestAnimationFrame(scrollToBottom);
    }
  }

  return (
    <div
      style={{
        ...style,
        display: "flex",
        flexDirection: "column",
        background: "rgba(255,255,255,0.9)",
        borderRadius: 12,
        boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
        overflow: "hidden",
        backdropFilter: "saturate(1.3) blur(8px)",
        border: "1px solid rgba(255,255,255,0.6)",
        pointerEvents: "auto",
      }}
    >
      {/* 消息列表 */}
      <div
        ref={listRef}
        style={{
          padding: 12,
          overflowY: "auto",
          flex: 1,
          minHeight: 200,
        }}
      >
        {msgs.map((m) => (
          <div key={m.id} style={{ margin: "10px 0" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
              {m.role === "user" ? "你" : "Catty"}
            </div>
            <div
              style={{
                background: m.role === "user" ? "#e5f0ff" : "#f5f7fb",
                border: "1px solid #e5e7eb",
                padding: "8px 10px",
                borderRadius: 8,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* 输入区 */}
      <div style={{ padding: 8, display: "flex", gap: 8, borderTop: "1px solid #e5e7eb" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="对 Catty 说点什么吧…"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            outline: "none",
            background: "rgba(255,255,255,0.9)",
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sendingRef.current}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: sendingRef.current ? "#94a3b8" : "#2563eb",
            color: "#fff",
            border: "none",
            cursor: sendingRef.current ? "not-allowed" : "pointer",
          }}
        >
          发送
        </button>
      </div>
    </div>
  );
}