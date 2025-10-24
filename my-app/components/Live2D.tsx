"use client";

import React, { useEffect } from "react";
import { LAppDelegate } from "../src/live2d/lappdelegate";
// 如果你的路径别名没有配置 @ 指向 src，请改为相对路径，例如：
// import { LAppDelegate } from "../live2d/src/lappdelegate";

export default function Live2D() {
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
    <canvas
      id="live2dCanvas"     // 和 LAppDelegate 内部查找的 id 必须一致
      className="w-full h-full"
    />
  );
}