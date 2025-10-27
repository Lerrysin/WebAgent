"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import ChatFloating from "../components/ChatFloating";
import Live2D from "../components/Live2D";
import MusicPlayer from "../components/MusicPlayer";


export default function Page() {
  const [avatarState, setAvatarState] = useState<"idle" | "talk" | "think">("idle");

  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <MusicPlayer/>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          height: "100%",
          width: "100%",
        }}
      >
        <section
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2vw",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "clamp(260px, 120vw, 560px)",
              aspectRatio: "1 / 1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "auto",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Live2D />
          </div>
        </section>

        <section
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2vw",
          }}
        >
          <div
            style={{
              width: "clamp(420px, 50vw, 800px)",
              height: "80vh",
            }}
          >
            <ChatFloating
              onTalking={(talking) => setAvatarState(talking ? "talk" : "idle")}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}