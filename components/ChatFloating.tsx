"use client";
import React, { useRef, useState } from "react";

type Message = { id: string; role: "user" | "assistant"; content: string };
type Props = { onTalking?: (talking: boolean) => void; style?: React.CSSProperties };

export default function ChatFloating({ onTalking, style }: Props) {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Message[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "user", content: text }]);
    const replyId = crypto.randomUUID();
    setMsgs((m) => [...m, { id: replyId, role: "assistant", content: "" }]);
    onTalking?.(true);
    try {
      const fake = "示例回复。这里以后接入 /api/chat 的流式结果。";
      for (const ch of fake) {
        await new Promise((r) => setTimeout(r, 18));
        setMsgs((m) => m.map((x) => (x.id === replyId ? { ...x, content: x.content + ch } : x)));
        listRef.current && (listRef.current.scrollTop = listRef.current.scrollHeight);
      }
    } finally {
      onTalking?.(false);
    }
  }

  return (
    <div
      style={{
        ...style,               // 由父级传入 width/maxHeight/height
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
      <div
        ref={listRef}
        style={{
          padding: 12,
          overflowY: "auto",
          flex: 1,              // 让消息区占满除了输入区之外的所有高度
          minHeight: 200,       // 可选：避免极小高度
        }}
      >
        {msgs.map((m) => (
          <div key={m.id} style={{ margin: "10px 0" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{m.role}</div>
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

      <div style={{ padding: 8, display: "flex", gap: 8, borderTop: "1px solid #e5e7eb" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="输入消息..."
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
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          发送
        </button>
      </div>
    </div>
  );
}