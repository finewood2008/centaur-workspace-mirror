/**
 * SatisfactionDialog - 客户满意度详情弹窗
 * 显示评分分布柱状图和客户反馈列表
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface SatisfactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ratingDistribution = [
  { rating: "1星", count: 3, fill: "hsl(var(--destructive))" },
  { rating: "2星", count: 8, fill: "hsl(30 90% 55%)" },
  { rating: "3星", count: 22, fill: "hsl(40 90% 55%)" },
  { rating: "4星", count: 56, fill: "hsl(150 60% 45%)" },
  { rating: "5星", count: 87, fill: "hsl(var(--primary))" },
];

const totalRatings = ratingDistribution.reduce((s, r) => s + r.count, 0);

const recentFeedback = [
  { id: 1, customer: "David Lee", avatar: "DL", rating: 5, comment: "AI回复非常专业，产品参数一次性给全了，效率很高！", time: "30分钟前", platform: "WhatsApp" },
  { id: 2, customer: "Emma Brown", avatar: "EB", rating: 4, comment: "响应很快，但希望能提供更多定制化方案建议。", time: "2小时前", platform: "Email" },
  { id: 3, customer: "Carlos Ruiz", avatar: "CR", rating: 5, comment: "从询价到报价只用了几分钟，比其他供应商快很多。", time: "3小时前", platform: "LinkedIn" },
  { id: 4, customer: "Yuki Tanaka", avatar: "YT", rating: 3, comment: "自动回复有时候不太理解复杂的技术问题，希望改进。", time: "5小时前", platform: "WhatsApp" },
  { id: 5, customer: "Sarah Miller", avatar: "SM", rating: 5, comment: "7×24在线回复太棒了，时差问题完全解决。", time: "昨天", platform: "Email" },
  { id: 6, customer: "Ahmed Hassan", avatar: "AH", rating: 2, comment: "报价单格式需要优化，有些信息显示不完整。", time: "昨天", platform: "WhatsApp" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("w-3 h-3", i <= rating ? "fill-brand-orange text-brand-orange" : "text-muted-foreground/30")} />
      ))}
    </div>
  );
}

export default function SatisfactionDialog({ open, onOpenChange }: SatisfactionDialogProps) {
  const avgRating = (ratingDistribution.reduce((s, r) => s + parseInt(r.rating) * r.count, 0) / totalRatings).toFixed(1);
  const positiveRate = Math.round(((ratingDistribution[3].count + ratingDistribution[4].count) / totalRatings) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Star className="w-4 h-4 text-brand-orange" /> 客户满意度详情
          </DialogTitle>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold font-display">{avgRating}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">平均评分</div>
            <StarRating rating={Math.round(Number(avgRating))} />
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold font-display text-brand-green">{positiveRate}%</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">好评率 (4-5星)</div>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              <ThumbsUp className="w-3 h-3 text-brand-green" />
              <span className="text-[10px] text-brand-green">↑ 3% vs上月</span>
            </div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold font-display">{totalRatings}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">总评价数</div>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-primary">本月</span>
            </div>
          </div>
        </div>

        {/* Rating Distribution Chart */}
        <div className="mt-4">
          <h3 className="text-xs font-semibold mb-3">评分分布</h3>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistribution} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="rating" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value} 条评价`, "数量"]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Inline bar breakdown */}
          <div className="space-y-1.5 mt-3">
            {[...ratingDistribution].reverse().map((item) => (
              <div key={item.rating} className="flex items-center gap-2 text-[11px]">
                <span className="w-8 text-muted-foreground">{item.rating}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(item.count / totalRatings) * 100}%`, backgroundColor: item.fill }} />
                </div>
                <span className="w-12 text-right text-muted-foreground">{item.count} ({Math.round((item.count / totalRatings) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="mt-4">
          <h3 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> 最近客户反馈
          </h3>
          <div className="space-y-2">
            {recentFeedback.map((fb) => (
              <div key={fb.id} className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold">
                      {fb.avatar}
                    </div>
                    <span className="text-xs font-medium">{fb.customer}</span>
                    <StarRating rating={fb.rating} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{fb.platform}</span>
                    <span className="text-[10px] text-muted-foreground">{fb.time}</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed pl-8">{fb.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
