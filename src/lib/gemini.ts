/**
 * Gemini API 调用工具
 * 封装 Google Gemini API 的流式和非流式调用
 */

export interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface GeminiConfig {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  systemInstruction?: string;
}

const DEFAULT_MODEL = "gemini-2.5-flash";

/**
 * 将简单的 { role, content } 格式转为 Gemini 格式
 */
export function toGeminiMessages(
  messages: { role: "user" | "assistant"; content: string }[]
): GeminiMessage[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

/**
 * 非流式调用 Gemini
 */
export async function callGemini(
  apiKey: string,
  messages: GeminiMessage[],
  config: GeminiConfig = {}
): Promise<string> {
  const model = config.model || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents: messages,
    generationConfig: {
      temperature: config.temperature ?? 0.7,
      maxOutputTokens: config.maxOutputTokens ?? 2048,
    },
  };

  if (config.systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: config.systemInstruction }],
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new GeminiError(res.status, err);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * 流式调用 Gemini，返回 AsyncGenerator
 */
export async function* streamGemini(
  apiKey: string,
  messages: GeminiMessage[],
  config: GeminiConfig = {}
): AsyncGenerator<string> {
  const model = config.model || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents: messages,
    generationConfig: {
      temperature: config.temperature ?? 0.7,
      maxOutputTokens: config.maxOutputTokens ?? 2048,
    },
  };

  if (config.systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: config.systemInstruction }],
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new GeminiError(res.status, err);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield text;
        } catch {
          // skip malformed JSON chunks
        }
      }
    }
  }
}

/**
 * 验证 API Key 是否有效
 */
export async function validateGeminiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 自定义错误类，携带状态码
 */
export class GeminiError extends Error {
  status: number;
  constructor(status: number, body: string) {
    let msg = `Gemini API error (${status})`;
    try {
      const parsed = JSON.parse(body);
      msg = parsed.error?.message || msg;
    } catch {
      // use raw body
      msg = body.slice(0, 200);
    }
    super(msg);
    this.name = "GeminiError";
    this.status = status;
  }
}
