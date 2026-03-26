/**
 * Inbox - 全渠道询盘中心
 * 左侧消息列表 + 右侧对话详情 + AI回复功能（真实AI）
 */
import { useState, useRef, useCallback } from "react";
import {
  Search, Send, Bot, CheckCheck, Zap, RefreshCw, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: number; name: string; company: string; avatar: string;
  channel: string; channelIcon: string; lastMessage: string;
  time: string; unread: boolean; priority: "high" | "medium" | "low";
  starred: boolean; aiScore: number;
}

interface ChatMessage {
  id: number; sender: "customer" | "ai" | "user"; time: string; text: string; aiGenerated?: boolean;
}

const messages: Message[] = [
  { id: 1, name: "John Smith", company: "TechCorp Ltd.", avatar: "JS", channel: "WhatsApp", channelIcon: "📱", lastMessage: "Hi, I need a quote for 5000 units of LED bulbs. Can you send me the FOB price?", time: "10:32", unread: true, priority: "high", starred: true, aiScore: 85 },
  { id: 2, name: "Maria Garcia", company: "EuroTrade GmbH", avatar: "MG", channel: "LinkedIn", channelIcon: "💼", lastMessage: "We are interested in your solar panel products. Could you provide the specifications and MOQ?", time: "09:45", unread: true, priority: "high", starred: false, aiScore: 78 },
  { id: 3, name: "Ahmed Hassan", company: "MidEast Import Co.", avatar: "AH", channel: "Email", channelIcon: "✉️", lastMessage: "Following up on our previous conversation about steel pipes. When can we expect the samples?", time: "09:12", unread: false, priority: "medium", starred: false, aiScore: 62 },
  { id: 4, name: "Sarah Johnson", company: "Pacific Trading Inc.", avatar: "SJ", channel: "独立站", channelIcon: "🌐", lastMessage: "I submitted an inquiry on your website for phone cases. Looking forward to your reply.", time: "08:30", unread: true, priority: "medium", starred: false, aiScore: 55 },
  { id: 5, name: "Yuki Tanaka", company: "Japan Direct Co.", avatar: "YT", channel: "阿里巴巴", channelIcon: "🏪", lastMessage: "Can you offer tea sets with custom packaging? We need 500 sets for the Japanese market.", time: "昨天", unread: false, priority: "low", starred: false, aiScore: 42 },
  { id: 6, name: "Roberto Silva", company: "Brazil Imports", avatar: "RS", channel: "WhatsApp", channelIcon: "📱", lastMessage: "Olá! Estou interessado em seus produtos de iluminação LED.", time: "昨天", unread: false, priority: "medium", starred: true, aiScore: 58 },
];

const channels = ["全部", "WhatsApp", "LinkedIn", "Email", "独立站", "阿里巴巴"];

const mockConversations: Record<number, ChatMessage[]> = {
  1: [
    { id: 1, sender: "customer", time: "10:30", text: "Hi, I'm John from TechCorp. We are looking for LED bulb suppliers." },
    { id: 2, sender: "ai", time: "10:30", text: "Hello John! Thank you for reaching out to us. We are a leading LED lighting manufacturer with 10+ years of experience. How can I help you today?", aiGenerated: true },
    { id: 3, sender: "customer", time: "10:32", text: "Hi, I need a quote for 5000 units of LED bulbs. Can you send me the FOB price?" },
  ],
  2: [
    { id: 1, sender: "customer", time: "09:45", text: "We are interested in your solar panel products. Could you provide the specifications and MOQ?" },
  ],
  3: [
    { id: 1, sender: "customer", time: "09:00", text: "Hello, I'd like to follow up on our previous conversation about steel pipes." },
    { id: 2, sender: "ai", time: "09:01", text: "Hello Ahmed! Thank you for following up. I'll check the sample status for you right away.", aiGenerated: true },
    { id: 3, sender: "customer", time: "09:12", text: "Following up on our previous conversation about steel pipes. When can we expect the samples?" },
  ],
  4: [
    { id: 1, sender: "customer", time: "08:30", text: "I submitted an inquiry on your website for phone cases. Looking forward to your reply." },
  ],
  5: [
    { id: 1, sender: "customer", time: "14:00", text: "Can you offer tea sets with custom packaging? We need 500 sets for the Japanese market." },
  ],
  6: [
    { id: 1, sender: "customer", time: "16:20", text: "Olá! Estou interessado em seus produtos de iluminação LED." },
  ],
};

export default function Inbox() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeChannel, setActiveChannel] = useState("全部");
  const [messageInput, setMessageInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState(0);
  const [conversations, setConversations] = useState<Record<number, ChatMessage[]>>(mockConversations);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedInquiry = messages.find((m) => m.id === selectedId);
  const filteredMessages = activeChannel === "全部" ? messages : messages.filter((m) => m.channel === activeChannel);
  const currentChat = selectedId ? (conversations[selectedId] || []) : [];

  const generateAIReply = useCallback(async (inquiryId: number) => {
    const inquiry = messages.find((m) => m.id === inquiryId);
    if (!inquiry) return;

    setIsGenerating(true);
    setAiReply(null);

    try {
      const chatHistory = (conversations[inquiryId] || []).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const { data, error } = await supabase.functions.invoke("generate-reply", {
        body: {
          customerName: inquiry.name,
          company: inquiry.company,
          channel: inquiry.channel,
          messages: chatHistory,
          aiScore: inquiry.aiScore,
        },
      });

      if (error) throw error;

      setAiReply(data.reply);
      setAiConfidence(data.confidence || 90);
    } catch (err: any) {
      console.error("AI reply error:", err);
      const errorMsg = err?.message || "AI生成失败";
      toast({ title: "AI回复生成失败", description: errorMsg, variant: "destructive" });
      setAiReply(null);
    } finally {
      setIsGenerating(false);
    }
  }, [conversations]);

  const handleSelectInquiry = useCallback((id: number) => {
    setSelectedId(id);
    setMessageInput("");
    setAiReply(null);
    generateAIReply(id);
  }, [generateAIReply]);

  const handleAdoptReply = useCallback(() => {
    if (aiReply) {
      setMessageInput(aiReply);
      setAiReply(null);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [aiReply]);

  const handleSend = useCallback(() => {
    if (!messageInput.trim() || !selectedId) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: "user",
      time: timeStr,
      text: messageInput.trim(),
    };
    setConversations((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMsg],
    }));
    setMessageInput("");
    toast({ title: "发送成功", description: "消息已发送给客户" });
  }, [messageInput, selectedId]);

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-0 -m-4 lg:-m-6">
      {/* Left: Message list */}
      <div className="w-80 lg:w-96 border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-base">询盘中心</h2>
            <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">
              {messages.filter((m) => m.unread).length} 未读
            </span>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="搜索客户、公司..." className="w-full h-8 bg-secondary rounded-md pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {channels.map((ch) => (
              <button key={ch} onClick={() => setActiveChannel(ch)}
                className={cn("text-xs px-2.5 py-1 rounded-md whitespace-nowrap transition-colors",
                  activeChannel === ch ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >{ch}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.map((msg) => (
            <button key={msg.id} onClick={() => handleSelectInquiry(msg.id)}
              className={cn("w-full text-left px-4 py-3 border-b border-border transition-colors relative",
                selectedId === msg.id ? "bg-secondary" : "hover:bg-secondary/50",
                msg.unread && "bg-secondary/30"
              )}
            >
              {selectedId === msg.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
              <div className="flex gap-3">
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                  msg.priority === "high" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                )}>{msg.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium truncate">{msg.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">{msg.time}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-1">{msg.company}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{msg.lastMessage}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px]">{msg.channelIcon} {msg.channel}</span>
                    <span className="text-[10px] text-muted-foreground">AI评分: {msg.aiScore}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Conversation detail */}
      {selectedInquiry ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-semibold text-primary">{selectedInquiry.avatar}</div>
              <div>
                <div className="text-sm font-medium">{selectedInquiry.name} · <span className="text-muted-foreground">{selectedInquiry.company}</span></div>
                <div className="text-[10px] text-muted-foreground">{selectedInquiry.channelIcon} {selectedInquiry.channel} · 最后活跃: {selectedInquiry.time}</div>
              </div>
            </div>
            <button className="text-xs bg-secondary text-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-1.5">
              <Bot className="w-3 h-3" /> AI分析
            </button>
          </div>

          <div className="text-[10px] px-4 py-2 border-b border-border bg-secondary/30 flex items-center gap-4 text-muted-foreground">
            <span>🇺🇸 美国</span><span>3次对话</span><span>{selectedInquiry.name.toLowerCase().replace(' ', '@')}@company.com</span>
            <span className="ml-auto">AI评分: <span className="text-primary font-medium">{selectedInquiry.aiScore}/100</span></span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {currentChat.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.sender === "customer" ? "justify-start" : "justify-end")}>
                <div className="max-w-[70%]">
                  {msg.sender === "ai" && (
                    <div className="flex items-center gap-1 mb-1 justify-end">
                      <Bot className="w-3 h-3 text-brand-cyan" />
                      <span className="text-[10px] text-brand-cyan">AI自动回复</span>
                    </div>
                  )}
                  {msg.sender === "user" && (
                    <div className="flex items-center gap-1 mb-1 justify-end">
                      <span className="text-[10px] text-muted-foreground">你</span>
                    </div>
                  )}
                  <div className={cn("rounded-lg px-3 py-2 text-xs leading-relaxed",
                    msg.sender === "customer" ? "bg-secondary text-foreground" :
                    msg.sender === "ai" ? "bg-brand-cyan/10 text-foreground border border-brand-cyan/20" :
                    "bg-primary/10 text-foreground border border-primary/20"
                  )}>{msg.text}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    {msg.time}
                    {msg.sender !== "customer" && <CheckCheck className="w-3 h-3 text-brand-cyan" />}
                  </div>
                </div>
              </div>
            ))}

            {/* AI Generating State */}
            {isGenerating && (
              <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 animate-pulse">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-xs font-medium text-primary">AI正在分析对话并生成回复建议...</span>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="h-3 bg-primary/10 rounded w-full" />
                  <div className="h-3 bg-primary/10 rounded w-4/5" />
                  <div className="h-3 bg-primary/10 rounded w-3/5" />
                </div>
              </div>
            )}

            {/* AI Reply Suggestion */}
            {!isGenerating && aiReply && (
              <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-medium text-primary">AI建议回复</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => generateAIReply(selectedId!)}
                      className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> 重新生成
                    </button>
                    <button onClick={handleAdoptReply}
                      className="text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded hover:opacity-90 font-medium">采用此回复</button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-muted-foreground">置信度</span>
                  <Progress value={aiConfidence} className="h-1.5 flex-1" />
                  <span className="text-[10px] font-medium text-primary">{aiConfidence}%</span>
                </div>
                <div className="text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{aiReply}</div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="输入回复内容..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-xs outline-none placeholder:text-muted-foreground resize-none min-h-[60px]"
                rows={2}
              />
              <button onClick={handleSend}
                disabled={!messageInput.trim()}
                className="self-end w-9 h-9 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:opacity-90 shrink-0 disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">选择一条消息查看详情</div>
      )}
    </div>
  );
}
