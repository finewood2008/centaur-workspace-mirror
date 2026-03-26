/**
 * InquiryDialog - 今日询盘详情弹窗
 * 各渠道询盘数量 + 最近询盘列表
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Mail, Linkedin, Phone, Globe } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface InquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalInquiries: number;
}

const channelData = [
  { channel: "WhatsApp", count: 9, icon: MessageSquare, color: "hsl(142, 70%, 45%)" },
  { channel: "Email", count: 7, icon: Mail, color: "hsl(220, 70%, 55%)" },
  { channel: "LinkedIn", count: 5, icon: Linkedin, color: "hsl(210, 80%, 45%)" },
  { channel: "官网表单", count: 3, icon: Globe, color: "hsl(35, 80%, 55%)" },
  { channel: "电话", count: 2, icon: Phone, color: "hsl(0, 70%, 55%)" },
];

const recentInquiries = [
  { id: 1, name: "David Lee", company: "GreenTech Solutions", channel: "WhatsApp", product: "LED智能灯A系列", time: "10分钟前", status: "ai_replied" },
  { id: 2, name: "Emma Brown", company: "Nordic Imports AB", channel: "Email", product: "工业照明方案", time: "25分钟前", status: "pending" },
  { id: 3, name: "Carlos Ruiz", company: "MexiLight SA", channel: "LinkedIn", product: "户外灯具B系列", time: "40分钟前", status: "ai_replied" },
  { id: 4, name: "Sarah Chen", company: "Asia Pacific Trading", channel: "官网表单", product: "定制化LED方案", time: "1小时前", status: "manual" },
  { id: 5, name: "Yuki Tanaka", company: "Tokyo Lighting Co.", channel: "WhatsApp", product: "LED灯带C系列", time: "1.5小时前", status: "ai_replied" },
  { id: 6, name: "Hans Mueller", company: "EuroLight GmbH", channel: "Email", product: "智能家居照明", time: "2小时前", status: "pending" },
  { id: 7, name: "Priya Sharma", company: "IndiaGlow Ltd", channel: "电话", product: "批量采购咨询", time: "2.5小时前", status: "manual" },
  { id: 8, name: "James Wilson", company: "BrightPath Inc.", channel: "WhatsApp", product: "商业照明方案", time: "3小时前", status: "ai_replied" },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  ai_replied: { label: "AI已回复", variant: "default" },
  pending: { label: "待处理", variant: "outline" },
  manual: { label: "人工跟进", variant: "secondary" },
};

const channelColors: Record<string, string> = {
  WhatsApp: "text-brand-green",
  Email: "text-primary",
  LinkedIn: "text-primary",
  "官网表单": "text-accent-foreground",
  "电话": "text-destructive",
};

export default function InquiryDialog({ open, onOpenChange, totalInquiries }: InquiryDialogProps) {
  const aiHandled = recentInquiries.filter((i) => i.status === "ai_replied").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">今日询盘详情</DialogTitle>
          <DialogDescription>各渠道询盘分布和最近询盘记录</DialogDescription>
        </DialogHeader>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary rounded-lg p-3 text-center">
            <div className="text-2xl font-display font-bold text-foreground">{totalInquiries}</div>
            <div className="text-[11px] text-muted-foreground">总询盘数</div>
          </div>
          <div className="bg-secondary rounded-lg p-3 text-center">
            <div className="text-2xl font-display font-bold text-primary">{aiHandled}</div>
            <div className="text-[11px] text-muted-foreground">AI已处理</div>
          </div>
          <div className="bg-secondary rounded-lg p-3 text-center">
            <div className="text-2xl font-display font-bold text-accent-foreground">{channelData.length}</div>
            <div className="text-[11px] text-muted-foreground">活跃渠道</div>
          </div>
        </div>

        {/* Channel Bar Chart */}
        <div className="bg-secondary/50 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">渠道分布</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={channelData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis type="category" dataKey="channel" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={60} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
                {channelData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Inquiries */}
        <div className="flex-1 min-h-0">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">最近询盘</h3>
          <ScrollArea className="h-[220px]">
            <div className="space-y-2 pr-3">
              {recentInquiries.map((inquiry) => {
                const st = statusMap[inquiry.status];
                return (
                  <div key={inquiry.id} className="bg-card border border-border rounded-lg p-3 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{inquiry.name}</span>
                        <span className="text-[11px] text-muted-foreground">{inquiry.company}</span>
                      </div>
                      <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className={channelColors[inquiry.channel] || "text-muted-foreground"}>{inquiry.channel}</span>
                        <span>·</span>
                        <span>{inquiry.product}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{inquiry.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
