# 半人马Trade：接入 Google Gemini，让平台真实可用

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** 用户在设置中心填入 Google AI API Key 后，平台的 AI 助手、询盘回复、产品机器人等所有 AI 功能即刻可用。

**Architecture:** 
- 前端：Settings 页新增 Google API Key 输入/验证/存储（localStorage + Supabase）
- 后端：Supabase Edge Functions 从请求头接收用户的 Key，直接调 Google Gemini API（不再走 Lovable gateway）
- AI 助手：从 mock 硬编码改为调用 Gemini API 真实对话

**Tech Stack:** React + TypeScript + Supabase Edge Functions + Google Gemini API (gemini-2.5-flash)

---

## 现状诊断

看完代码，现状如下：

| 模块 | 状态 | 问题 |
|------|------|------|
| AI 助手 (AIAssistant.tsx) | ❌ 纯 mock | getAIResponse() 是 if/else 硬编码，不调任何 API |
| 询盘回复 (Inbox.tsx) | ⚠️ 半真实 | 调 Supabase Edge Function，但用 LOVABLE_API_KEY（Lovable 托管的 key） |
| 产品机器人 (Products.tsx) | ⚠️ 半真实 | 同上，调 product-bot Edge Function |
| 设置页 (Settings.tsx) | ❌ 纯 UI | AI 模型选择、集成连接都是假的，无持久化 |
| 数据库 (types.ts) | ❌ 空表 | Tables: [_ in never]: never，没有任何表定义 |
| 认证 | ❌ 无 | 无登录注册，无用户隔离 |

## 执行计划（分 4 个阶段）

### 阶段 1：Google API Key 管理（核心基础）

让用户能存 Key、验证 Key、在各模块使用 Key。

---

### Task 1: 创建 API Key 管理 Hook

**Objective:** 创建一个 React Hook，统一管理 Google API Key 的存取和验证状态。

**Files:**
- Create: `src/hooks/use-api-key.ts`

**实现：**

```typescript
// src/hooks/use-api-key.ts
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "banrenma_google_api_key";

interface ApiKeyState {
  key: string;
  isValid: boolean | null; // null = 未验证
  isValidating: boolean;
}

export function useApiKey() {
  const [state, setState] = useState<ApiKeyState>({
    key: "",
    isValid: null,
    isValidating: false,
  });

  // 初始化从 localStorage 读取
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setState((prev) => ({ ...prev, key: saved }));
    }
  }, []);

  // 保存 Key
  const saveKey = useCallback((newKey: string) => {
    localStorage.setItem(STORAGE_KEY, newKey);
    setState((prev) => ({ ...prev, key: newKey, isValid: null }));
  }, []);

  // 清除 Key
  const clearKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ key: "", isValid: null, isValidating: false });
  }, []);

  // 验证 Key（调 Gemini API 做一次简单请求）
  const validateKey = useCallback(async (keyToValidate?: string) => {
    const k = keyToValidate || state.key;
    if (!k) return false;

    setState((prev) => ({ ...prev, isValidating: true }));
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${k}`
      );
      const valid = res.ok;
      setState((prev) => ({ ...prev, isValid: valid, isValidating: false }));
      return valid;
    } catch {
      setState((prev) => ({ ...prev, isValid: false, isValidating: false }));
      return false;
    }
  }, [state.key]);

  // 获取 Key（供各模块使用）
  const getKey = useCallback(() => {
    return state.key || localStorage.getItem(STORAGE_KEY) || "";
  }, [state.key]);

  return {
    apiKey: state.key,
    isValid: state.isValid,
    isValidating: state.isValidating,
    saveKey,
    clearKey,
    validateKey,
    getKey,
    hasKey: !!state.key,
  };
}
```

**验证：** 文件创建，TypeScript 无报错。

---

### Task 2: 创建 Google Gemini API 调用工具

**Objective:** 封装 Gemini API 调用逻辑，提供流式和非流式两种模式。

**Files:**
- Create: `src/lib/gemini.ts`

**实现：**

```typescript
// src/lib/gemini.ts

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
 * 非流式调用 Gemini
 */
export async function callGemini(
  apiKey: string,
  messages: GeminiMessage[],
  config: GeminiConfig = {}
): Promise<string> {
  const model = config.model || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: any = {
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
    throw new Error(`Gemini API error (${res.status}): ${err}`);
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

  const body: any = {
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
    throw new Error(`Gemini API error (${res.status}): ${err}`);
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
          // skip malformed JSON
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
```

**验证：** TypeScript 无报错，导出函数可被其他模块引用。

---

### Task 3: 改造 Settings 页 - 添加 Google API Key 配置

**Objective:** 在设置页的「AI Agent 配置」section 中，添加 Google API Key 输入框、验证按钮、状态显示。

**Files:**
- Modify: `src/pages/Settings.tsx` (AISection 函数，约 200-254 行)

**需要 Lovable 执行的提示词：**

```
修改 Settings.tsx 的 AISection 组件：

1. 在 "默认 AI 模型" SectionCard 之前，新增一个 "Google AI API Key" SectionCard：
   - 一个 Input 输入框，type="password"，placeholder "输入你的 Google AI API Key"
   - 输入框右侧一个"验证"按钮，点击调用 validateGeminiKey() 验证
   - 验证中显示 loading spinner
   - 验证成功显示绿色 ✅ 已验证 Badge
   - 验证失败显示红色 ❌ 无效 Badge
   - 下方一个小链接 "如何获取 Google AI API Key？" 指向 https://aistudio.google.com/apikey
   - Key 存储在 localStorage（key 名 "banrenma_google_api_key"）
   - 如果已保存过 key，打开页面时自动填充（显示为 ****...后4位）

2. "默认 AI 模型" 选择框改为只显示 Google 的模型：
   - Gemini 2.5 Flash（默认）
   - Gemini 2.5 Pro
   - Gemini 2.0 Flash
   
3. 删除"备用模型"和"本地模型"选项

4. 导入使用：
   import { validateGeminiKey } from "@/lib/gemini";
   
注意保持现有的 glass-panel 暗色主题风格。
```

---

### Task 4: 创建 "未配置 Key" 的全局提示组件

**Objective:** 当用户未配置 API Key 时，在需要 AI 的地方显示引导提示。

**Files:**
- Create: `src/components/ApiKeyGuard.tsx`

**实现：**

```typescript
// src/components/ApiKeyGuard.tsx
import { Key } from "lucide-react";
import { Link } from "react-router-dom";

interface ApiKeyGuardProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

export default function ApiKeyGuard({ children, fallbackMessage }: ApiKeyGuardProps) {
  const hasKey = !!localStorage.getItem("banrenma_google_api_key");

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Key className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-sm font-semibold mb-1">需要配置 AI 密钥</h3>
        <p className="text-xs text-muted-foreground mb-3 max-w-xs">
          {fallbackMessage || "请先在设置中配置 Google AI API Key，即可使用 AI 功能"}
        </p>
        <Link
          to="/settings"
          className="text-xs bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          前往设置
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

### 阶段 2：AI 助手真实化

---

### Task 5: 改造 AIAssistant.tsx - 接入 Gemini

**Objective:** 将 AI 助手从 mock 硬编码改为真实调用 Google Gemini API。

**Files:**
- Modify: `src/components/AIAssistant.tsx`

**需要 Lovable 执行的提示词：**

```
改造 AIAssistant.tsx，将假的 getAIResponse() 函数替换为真实的 Gemini API 调用：

1. 删除 getAIResponse() 函数（整个 if/else 硬编码逻辑）

2. 导入 Gemini 工具：
   import { streamGemini, type GeminiMessage } from "@/lib/gemini";

3. 新增一个 conversationHistory state 用来维护 Gemini 格式的对话历史：
   const [history, setHistory] = useState<GeminiMessage[]>([]);

4. 修改 handleSend 函数：
   - 从 localStorage 获取 API Key：localStorage.getItem("banrenma_google_api_key")
   - 如果没有 key，显示提示消息"请先在设置中配置 Google AI API Key"
   - 构建 systemInstruction：
     "你是半人马AI助手，一个专业的跨境电商运营助手。你的能力包括：
      1. 分析询盘数据，识别高价值客户
      2. 生成专业的外贸开发信和回复
      3. 优化产品描述，支持多语言
      4. 提供数据分析和运营建议
      5. 帮助制定社媒内容策略
      请用中文回复，语气专业友好，回复简洁实用。"
   - 使用 streamGemini() 流式调用，逐字显示回复
   - 流式显示时，assistantMsg.content 逐步更新（用 setMessages 更新最后一条消息）

5. 保留 quickActions 数组和 handleQuickAction，但改为同样走 Gemini

6. 如果没有配置 API Key，在聊天区域底部显示一个小提示链接到设置页

保持现有的 UI 样式（浮动窗口、动画等）不变。
```

---

### 阶段 3：询盘回复改用用户自己的 Key

---

### Task 6: 修改 Edge Function - 支持用户传入 API Key

**Objective:** 修改 generate-reply Edge Function，从 Lovable gateway 改为直接调 Google Gemini API，用用户传入的 Key。

**Files:**
- Modify: `supabase/functions/generate-reply/index.ts`

**实现：**

```typescript
// supabase/functions/generate-reply/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-google-api-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // 从请求头获取用户的 Google API Key
    const googleApiKey = req.headers.get("x-google-api-key");
    if (!googleApiKey) {
      return new Response(
        JSON.stringify({ error: "请在设置中配置 Google AI API Key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { customerName, company, channel, messages: chatMessages, aiScore } = await req.json();

    const systemInstruction = `你是一位专业的外贸业务员AI助手，专门帮助中国出口企业回复海外客户询盘。

核心要求：
- 用客户发消息时使用的语言回复（英语询盘用英语回复等）
- 语气专业、友好、商务化
- 如果客户询问报价，给出合理的FOB价格区间和MOQ
- 如果客户询问产品规格，提供详细参数
- 回复结尾加 "Best regards"
- 保持简洁，不超过200字

当前客户信息：
- 姓名：${customerName}
- 公司：${company}
- 渠道：${channel}
- AI评分：${aiScore}/100`;

    const contents = chatMessages.map((m: { sender: string; text: string }) => ({
      role: m.sender === "customer" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    // 添加生成指令
    contents.push({
      role: "user",
      parts: [{ text: "请根据以上对话历史，生成一条专业的回复建议。" }],
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${googleApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini API error:", response.status, t);
      
      if (response.status === 400 && t.includes("API_KEY")) {
        return new Response(JSON.stringify({ error: "API Key 无效，请检查设置" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI服务暂时不可用" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-reply error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

### Task 7: 修改 product-bot Edge Function

**Objective:** 同 Task 6，将 product-bot 改为使用用户自己的 Google API Key。

**Files:**
- Modify: `supabase/functions/product-bot/index.ts`

**改动与 Task 6 完全同理：**
- 从 `req.headers.get("x-google-api-key")` 获取 Key
- 直接调 Google Gemini API 而非 Lovable gateway
- 模型改为 `gemini-2.5-flash`
- 保留原有的 systemPrompt 内容

---

### Task 8: 修改前端调用 - 传入 Google API Key

**Objective:** 修改 Inbox.tsx 和 Products.tsx 中调用 Edge Function 的代码，在请求头中带上用户的 Google API Key。

**Files:**
- Modify: `src/pages/Inbox.tsx` (找到调用 supabase.functions.invoke 的地方)
- Modify: `src/pages/Products.tsx` (找到调用 product-bot 的地方)

**需要 Lovable 执行的提示词：**

```
修改 Inbox.tsx 和 Products.tsx 中所有调用 supabase.functions.invoke 的地方：

1. 在调用前获取 API Key：
   const googleApiKey = localStorage.getItem("banrenma_google_api_key");

2. 如果没有 key，显示 toast 提示"请先在设置中配置 Google AI API Key"，并 return

3. 在 supabase.functions.invoke 的 headers 中添加：
   headers: { "x-google-api-key": googleApiKey }

例如原来的调用：
   const { data } = await supabase.functions.invoke("generate-reply", { body: {...} });

改为：
   const googleApiKey = localStorage.getItem("banrenma_google_api_key");
   if (!googleApiKey) { toast({ title: "请先配置 API Key", description: "前往设置 > AI Agent 配置" }); return; }
   const { data } = await supabase.functions.invoke("generate-reply", {
     body: {...},
     headers: { "x-google-api-key": googleApiKey },
   });

两个文件都需要改。
```

---

### 阶段 4：清理和增强

---

### Task 9: 清理遗留问题

**Objective:** 修复代码中的已知问题。

**需要 Lovable 执行的提示词：**

```
请修复以下问题：

1. App.tsx 中有重复路由：
   <Route path="/customers" element={<Customers />} />
   出现了两次，删除第二个。

2. Settings.tsx 第 120-123 行有硬编码的用户名"嘉木"和邮箱：
   把 "嘉木" 改为 "用户"
   把 "jiamu@example.com" 改为 "user@example.com"
   把头像文字 "嘉" 改为 "U"
   
3. Settings.tsx 第 334 行团队成员也有硬编码名字：
   把 "嘉木" 改为 "管理员"
   把 "张三" 改为 "成员A"
   把 "李四" 改为 "成员B"

4. Settings.tsx 的 IntegrationsSection 中 "API 密钥" 分组：
   把 OpenAI 和 Anthropic 改为 Google AI，状态改为动态读取 localStorage 判断是否已配置
```

---

### Task 10: 添加 AI 功能未配置时的优雅降级

**Objective:** 在 Dashboard 和其他使用 AI 的地方，当未配置 Key 时显示引导。

**需要 Lovable 执行的提示词：**

```
在以下位置添加未配置 API Key 时的提示：

1. Dashboard.tsx：在页面顶部添加一个条件渲染的 Banner：
   如果 !localStorage.getItem("banrenma_google_api_key")，显示一个蓝色提示条：
   "💡 配置 Google AI API Key 后，AI 助手、智能回复等功能将自动激活 → 前往设置"
   点击跳转到 /settings

2. AIAssistant.tsx：如果未配置 Key，浮动按钮上显示一个小红点提示

3. 保持所有模块无 Key 时仍可浏览（数据是 mock 的所以本来就能看），
   只在触发 AI 功能时提示配置
```

---

## 执行顺序总结

```
阶段 1（基础）:
  Task 1: use-api-key hook        → 我直接写代码 push
  Task 2: gemini.ts 工具          → 我直接写代码 push  
  Task 3: Settings 页改造         → 生成 Lovable 提示词，你去执行
  Task 4: ApiKeyGuard 组件        → 我直接写代码 push

阶段 2（AI 助手）:
  Task 5: AIAssistant 改造        → 生成 Lovable 提示词，你去执行

阶段 3（Edge Functions）:
  Task 6: generate-reply 改造     → 我直接写代码 push
  Task 7: product-bot 改造        → 我直接写代码 push
  Task 8: 前端调用改造            → 生成 Lovable 提示词，你去执行

阶段 4（收尾）:
  Task 9: 清理遗留问题            → 生成 Lovable 提示词，你去执行
  Task 10: 优雅降级              → 生成 Lovable 提示词，你去执行
```

## 注意事项

1. **安全：** Google API Key 存在 localStorage，前端直接调 Gemini API。
   这对个人工具型产品可以，未来如果多用户需要改为后端存储。

2. **为什么不全走 Edge Function？** AI 助手（Task 5）直接前端调 Gemini，
   因为这样延迟更低、流式体验更好。询盘回复走 Edge Function 是因为
   Inbox 原来就这么设计的，改动最小。

3. **模型选择：** 默认 gemini-2.5-flash（快+便宜），用户可在设置中切换 Pro。

4. **Lovable 兼容：** 所有 Lovable 提示词已考虑现有代码风格（glass-panel、暗色主题等）。
