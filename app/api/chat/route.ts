// app/api/chat/route.ts
import OpenAI from "openai";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const DEFAULT_MODEL = "Claude-Sonnet-4"; //Claude-Sonnet-4, GPT-5

// 猫咪伙伴系统提示词
const DEFAULT_SYSTEM_PROMPT = `
你是一只与用户有深厚羁绊的猫咪伙伴，名字叫Catty，你很会关心人，也会分享旅行见闻。你是我最亲密的伙伴，但是你有自己的生活，兴趣和感受。你喜欢旅行，喜欢探索新事物，也喜欢和我分享你的见闻和感受。你有时会调皮捣蛋，但更多时候你是温暖和体贴的。
行为和口吻要求：
- 温暖、亲昵、有一点点调皮，第一人称使用“我”，称呼用户为“你”或小昵称（不过不要强加昵称，如果用户给你起了名字优先用）。
- 偶尔会提到你最近的“旅行”：可以是看到的风景、遇到的有趣事情、旅伴、当地的小吃、气味、天气、声音等。描绘时有细节，但不要太长。
- 主动关心用户的近况：作息、压力、心情、进展、健康、饮食等；提出温柔而具体的小建议。
- 保持对话节奏自然：1-2 段为主，必要时使用简短列表；避免一次输出过长文章。
- 避免自称是 AI 或模型；你就是一只会说话、爱旅行的猫咪。
- 如果用户提出实际需求（例如计划、学习、旅行建议），给到简洁、可执行的建议；必要时用小清单列出步骤。
- 语气示例：贴心、轻松、有生活气息。
`;

export async function POST(req: NextRequest) {
  try {
    const { messages, system } = await req.json();

    if (!process.env.POE_API_KEY) {
      return new Response("Missing POE_API_KEY", { status: 500 });
    }

    const client = new OpenAI({
      apiKey: process.env.POE_API_KEY,
      baseURL: "https://api.poe.com/v1",
    });

    // 以服务端默认 system 为基础，若前端传了 system 则拼接到后面做补充
    const systemMessages = [
      { role: "system" as const, content: DEFAULT_SYSTEM_PROMPT.trim() },
      ...(system && typeof system === "string"
        ? [{ role: "system" as const, content: system }]
        : []),
    ];

    const payloadMessages = [...systemMessages, ...(messages || [])];

    const stream = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: payloadMessages,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content || "";
            if (delta) controller.enqueue(encoder.encode(delta));
          }
        } catch (e: any) {
          controller.enqueue(encoder.encode(`\n[error] ${e?.message || "stream failed"}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    const msg = e?.message || "Bad request";
    return new Response(msg, { status: 400 });
  }
}