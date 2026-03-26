/**
 * InquiryTrendChart - 近7天询盘趋势折线图
 */
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const trendData = [
  { date: "03/19", total: 8, ai: 5 },
  { date: "03/20", total: 15, ai: 12 },
  { date: "03/21", total: 12, ai: 9 },
  { date: "03/22", total: 22, ai: 18 },
  { date: "03/23", total: 18, ai: 14 },
  { date: "03/24", total: 25, ai: 20 },
  { date: "03/25", total: 31, ai: 26 },
];

export default function InquiryTrendChart() {
  const totalInquiries = trendData.reduce((s, d) => s + d.total, 0);
  const totalAI = trendData.reduce((s, d) => s + d.ai, 0);
  const aiRate = ((totalAI / totalInquiries) * 100).toFixed(1);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-sm">询盘趋势</h3>
          <p className="text-[11px] text-muted-foreground">近7日询盘量与AI处理量</p>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-muted-foreground">
            总计 <span className="text-foreground font-medium">{totalInquiries}</span>
          </span>
          <span className="text-muted-foreground">
            AI处理率 <span className="text-brand-green font-medium">{aiRate}%</span>
          </span>
        </div>
      </div>
      <div className="flex gap-4 mb-3 text-[10px]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary" /> 总询盘
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-cyan" /> AI处理
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 10% 20%)" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(230 10% 55%)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(230 10% 55%)" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "hsl(230 12% 14%)",
              border: "1px solid hsl(230 10% 23%)",
              borderRadius: 8,
              fontSize: 11,
            }}
            formatter={(value: number, name: string) => [
              `${value}条`,
              name === "total" ? "总询盘" : "AI处理",
            ]}
          />
          <Area type="monotone" dataKey="total" stroke="hsl(30 90% 55%)" fill="hsl(30 90% 55% / 0.15)" strokeWidth={2} />
          <Area type="monotone" dataKey="ai" stroke="hsl(190 70% 50%)" fill="hsl(190 70% 50% / 0.1)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
