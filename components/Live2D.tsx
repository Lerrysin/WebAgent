/*
 * @file: 
 * @author: black_xiaohui
 * @Date: 2025-10-24 21:06:15
 */
"use client";

import React, { useEffect, useRef } from "react";
import { LAppDelegate } from "../src/live2d/lappdelegate";

export default function Live2D() {

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const app = LAppDelegate.getInstance();

    // 初始化并启动渲染循环
    if (!app.initialize()) {
      console.error("LAppDelegate initialize failed");
      return;
    }
    app.run();

    // 处理窗口尺寸变化（如果 LAppDefine.CanvasSize === 'auto'）
    const onResize = () => app.onResize?.();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      LAppDelegate.releaseInstance(); // 释放 WebGL/模型资源
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="live2d-container"
      className="w-full h-full"
    />
  );
}