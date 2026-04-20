import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-google-api-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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
- 用客户发消息时使用的语言回复（英语询盘用英语回复，葡萄牙语用葡萄牙语等）
- 语气专业、友好、商务化
- 如果客户询问报价，给出合理的FOB价格区间和MOQ
- 如果客户询问产品规格，提供详细参数
- 如果客户跟进订单/样品，给出明确时间线
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

    contents.push({
      role: "user",
      parts: [{ text: "请根据以上对话历史，生成一条专业的回复建议。" }],
    });

    const model = req.headers.get("x-google-model") || "gemini-2.5-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${googleApiKey}`,
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

      if (response.status === 400 || response.status === 403) {
        return new Response(JSON.stringify({ error: "API Key 无效或无权限，请检查设置" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
