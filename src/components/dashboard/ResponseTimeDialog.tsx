/**
 * ResponseTimeDialog - 响应时间趋势弹窗
 * 显示近7天AI vs 人工响应时间对比
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Clock, ArrowDownRight, Bot, User } from "lucide-react";

const trendData = [
  { date: "03/19", ai: 12, human: 180 },
  { date: "03/20", ai: 10, human: 165 },
  { date: "03/21", ai: 9, human: 200 },
  { date: "03/22", ai: 7, human: 150 },
  { date: "03/23", ai: 8, human: 170 },
  { date: "03/24", ai: 6, human: 190 },
  { date: "03/25", ai: 8, human: 155 },
];

interface ResponseTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResponseTimeDialog({ open, onOpenChange }: ResponseTimeDialogProps) {
  const avgAI = Math.round(trendData.reduce((s, d) => s + d.ai, 0) / trendData.length);
  const avgHuman = Math.round(trendData.reduce((s, d) => s + d.human, 0) / trendData.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            响应时间趋势
          </DialogTitle>
          <p className="text-[11px] text-muted-foreground">近7天AI自动回复 vs 人工回复平均响应时间</p>
        </DialogHeader>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 my-2">
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Bot className="w-3.5 h-3.5 text-brand-cyan" />
              <span className="text-[11px] text-muted-foreground">AI平均响应</span>
            </div>
            <div className="text-xl font-display font-bold">{avgAI}秒</div>
            <div className="flex items-center gap-1 mt-0.5">
              <ArrowDownRight className="w-3 h-3 text-brand-green" />
              <span className="text-[10px] text-brand-green font-medium">↓ 95% vs 人工</span>
            </div>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">人工平均响应</span>
            </div>
            <div className="text-xl font-display font-bold">{avgHuman}秒</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">约 {Math.round(avgHuman / 60)} 分钟</div>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-1">
          <div className="flex gap-4 mb-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[hsl(190,70%,50%)]" /> AI响应 (秒)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[hsl(30,90%,55%)]" /> 人工响应 (秒)</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 10% 20%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(230 10% 55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(230 10% 55%)" }} axisLine={false} tickLine={false} unit="s" />
              <Tooltip
                contentStyle={{
                  background: "hsl(230 12% 14%)",
                  border: "1px solid hsl(230 10% 23%)",
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(value: number, name: string) => [
                  `${value}秒`,
                  name === "ai" ? "AI响应" : "人工响应",
                ]}
              />
              <Area type="monotone" dataKey="human" stroke="hsl(30 90% 55%)" fill="hsl(30 90% 55% / 0.12)" strokeWidth={2} />
              <Area type="monotone" dataKey="ai" stroke="hsl(190 70% 50%)" fill="hsl(190 70% 50% / 0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
