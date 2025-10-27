"use client";

import { useEffect } from "react";

export default function MusicPlayer() {
  useEffect(() => {
    // 尝试选择更可播的格式（m4a 不稳时用 mp3 兜底，可省略）
    const probe = new Audio();
    const canM4a =
      probe.canPlayType("audio/mp4; codecs='mp4a.40.2'") ||
      probe.canPlayType("audio/aac");
    const src = canM4a ? "/bgm.m4a" : "/bgm.mp3";

    const a = document.createElement("audio");
    a.src = src;
    a.loop = true;
    a.preload = "auto";
    a.setAttribute("playsinline", "true");
    // 关键：静音自动起播，然后立即尝试取消静音并设置目标音量
    a.muted = true;
    a.volume = 0.18; // 固定音量（可按需调整）

    // 将元素加入文档，提升某些环境的稳定性
    const holder = document.createElement("div");
    holder.style.position = "fixed";
    holder.style.inset = "0";
    holder.style.pointerEvents = "none";
    holder.style.opacity = "0";
    holder.appendChild(a);
    document.body.appendChild(holder);

    const unlock = () => {
      // 若仍被静音策略拦截，任一用户交互后立即解锁
      if (a.muted) a.muted = false;
      a.volume = 0.18;
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };

    const start = async () => {
      try {
        await a.play();          // 静音自动起播
        try {
          a.muted = false;       // 立即尝试取消静音（非淡入，一次完成）
        } catch {}
        a.volume = 0.18;
        // 兜底监听：若仍被系统保持静音，首次交互后立刻放声
        window.addEventListener("pointerdown", unlock, { once: true });
        window.addEventListener("keydown", unlock, { once: true });
        window.addEventListener("touchstart", unlock, { once: true, passive: true });
      } catch {
        // 极少数情况下静音起播也失败，这里无需报错，等待用户交互触发 unlock 即可
        window.addEventListener("pointerdown", async () => {
          try {
            await a.play();
            a.muted = false;
            a.volume = 0.18;
          } catch {}
        }, { once: true });
      }
    };

    start();

    return () => {
      a.pause();
      holder.remove();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  return null; // 无 UI
}