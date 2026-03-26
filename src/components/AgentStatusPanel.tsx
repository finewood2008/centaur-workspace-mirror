/**
 * AgentStatusPanel - 左下角 Agent 运营状态，点击展开详细侧边栏
 */
import { useState, useEffect } from "react";
import {
  Activity, Cpu, HardDrive, Bot, Play, Pause, RotateCcw,
  Settings, ChevronRight, X, AlertTriangle, CheckCircle2,
  Zap, Clock, BarChart3, ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface AgentInfo {
  id: string;
  name: string;
  icon: string;
  status: "running" | "idle" | "paused";
  cpu: number;
  memory: number;
  todayCount: number;
  todayLabel: string;
}

const initialAgents: AgentInfo[] = [
  { id: "a1", name: "客户服务 Agent", icon: "🤖", status: "running", cpu: 12, memory: 23, todayCount: 45, todayLabel: "次对话" },
  { id: "a2", name: "邮件处理 Agent", icon: "📧", status: "running", cpu: 8, memory: 15, todayCount: 23, todayLabel: "封邮件" },
  { id: "a3", name: "产品推荐 Agent", icon: "🎯", status: "running", cpu: 15, memory: 30, todayCount: 67, todayLabel: "次推荐" },
  { id: "a4", name: "订单跟进 Agent", icon: "📦", status: "idle", cpu: 2, memory: 5, todayCount: 12, todayLabel: "个订单" },
  { id: "a5", name: "数据分析 Agent", icon: "📊", status: "running", cpu: 20, memory: 40, todayCount: 8, todayLabel: "份报告" },
  { id: "a6", name: "社媒运营 Agent", icon: "📱", status: "running", cpu: 10, memory: 18, todayCount: 34, todayLabel: "条内容" },
  { id: "a7", name: "广告优化 Agent", icon: "📣", status: "idle", cpu: 1, memory: 3, todayCount: 5, todayLabel: "个计划" },
];

const logs = [
  { time: "01:26:45", type: "success" as const, text: "客户服务Agent 处理客户咨询", detail: "客户: ABC Corp" },
  { time: "01:25:12", type: "success" as const, text: "邮件处理Agent 发送跟进邮件", detail: "收件人: john@example.com" },
  { time: "01:23:08", type: "warning" as const, text: "产品推荐Agent 响应较慢", detail: "耗时: 3.2s" },
  { time: "01:20:34", type: "success" as const, text: "订单跟进Agent 更新订单状态", detail: "订单号: ORD-20260327-001" },
  { time: "01:18:55", type: "success" as const, text: "数据分析Agent 生成周报", detail: "报告: 客户转化分析" },
  { time: "01:15:20", type: "warning" as const, text: "邮件处理Agent 调用次数接近上限", detail: "已用: 890/1000" },
];

const statusColors = {
  running: "bg-brand-green",
  idle: "bg-muted-foreground",
  paused: "bg-brand-orange",
};

const statusLabels = {
  running: "运行中",
  idle: "空闲",
  paused: "已暂停",
};

export default function AgentStatusPanel({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState(initialAgents);
  const [uptime, setUptime] = useState({ days: 3, hours: 2, minutes: 1 });

  const runningCount = agents.filter((a) => a.status === "running").length;
  const idleCount = agents.filter((a) => a.status === "idle").length;
  const pausedCount = agents.filter((a) => a.status === "paused").length;
  const avgCpu = Math.round(agents.reduce((s, a) => s + a.cpu, 0) / agents.length);

  useEffect(() => {
    const t = setInterval(() => {
      setUptime((prev) => {
        let m = prev.minutes + 1;
        let h = prev.hours;
        let d = prev.days;
        if (m >= 60) { m = 0; h++; }
        if (h >= 24) { h = 0; d++; }
        return { days: d, hours: h, minutes: m };
      });
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const toggleAgent = (id: string, action: "pause" | "start" | "restart") => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        if (action === "pause") {
          toast.info(`${a.name} 已暂停`);
          return { ...a, status: "paused" as const, cpu: 0, memory: 0 };
        }
        if (action === "start") {
          toast.success(`${a.name} 已启动`);
          return { ...a, status: "running" as const, cpu: Math.floor(Math.random() * 20) + 5, memory: Math.floor(Math.random() * 30) + 10 };
        }
        toast.success(`${a.name} 已重启`);
        return { ...a, status: "running" as const, cpu: Math.floor(Math.random() * 15) + 5, memory: Math.floor(Math.random() * 25) + 10 };
      })
    );
  };

  return (
    <>
      {/* Compact status in sidebar */}
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left p-3 border-t border-sidebar-border hover:bg-sidebar-accent transition-colors group"
      >
        {collapsed ? (
          <div className="flex justify-center">
            <div className="relative">
              <Activity className="w-4 h-4 text-brand-green" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="bg-sidebar-accent rounded-md p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                <span className="text-[10px] font-medium text-foreground">系统运行中</span>
              </div>
              <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Bot className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">AI Agent</span>
                </div>
                <span className="text-[10px] font-medium text-brand-green">运行中 {runningCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">系统负载</span>
                </div>
                <span className="text-[10px] font-medium text-foreground">{avgCpu}%</span>
              </div>
            </div>
          </div>
        )}
      </button>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-[440px] max-w-[90vw] bg-background border-r border-border shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-12 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">AI Agent 运营中心</span>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-4 mt-3 mb-0 bg-secondary h-8">
                <TabsTrigger value="overview" className="text-xs h-6">概览</TabsTrigger>
                <TabsTrigger value="agents" className="text-xs h-6">Agent列表</TabsTrigger>
                <TabsTrigger value="perf" className="text-xs h-6">性能监控</TabsTrigger>
                <TabsTrigger value="logs" className="text-xs h-6">日志</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-4">
                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-0 space-y-4">
                  {/* Status banner */}
                  <div className="rounded-lg bg-brand-green/10 border border-brand-green/20 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
                      <span className="text-sm font-semibold text-foreground">系统运行正常</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      运行时长: {uptime.days}天{uptime.hours}小时{uptime.minutes.toString().padStart(2, "0")}分
                    </div>
                  </div>

                  {/* Today stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "处理任务", value: agents.reduce((s, a) => s + a.todayCount, 0).toString(), icon: Zap },
                      { label: "AI调用", value: "456", icon: Bot },
                      { label: "平均响应", value: "1.2s", icon: Clock },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border border-border bg-card p-2.5 text-center">
                        <s.icon className="w-4 h-4 mx-auto text-primary mb-1" />
                        <div className="text-lg font-bold text-foreground">{s.value}</div>
                        <div className="text-[10px] text-muted-foreground">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Agent status distribution */}
                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="text-xs font-semibold mb-2">Agent 状态分布</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex h-3 rounded-full overflow-hidden bg-secondary">
                          <div className="bg-brand-green transition-all" style={{ width: `${(runningCount / agents.length) * 100}%` }} />
                          <div className="bg-muted-foreground transition-all" style={{ width: `${(idleCount / agents.length) * 100}%` }} />
                          <div className="bg-brand-orange transition-all" style={{ width: `${(pausedCount / agents.length) * 100}%` }} />
                        </div>
                      </div>
                      <div className="flex gap-3 text-[10px]">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-green" />运行 {runningCount}</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground" />空闲 {idleCount}</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-orange" />暂停 {pausedCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Alerts */}
                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-brand-orange" />
                      异常告警
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2 p-2 rounded bg-brand-orange/5 border border-brand-orange/10">
                        <AlertTriangle className="w-3 h-3 text-brand-orange mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">产品推荐Agent 响应时间超过3s (1次)</span>
                      </div>
                      <div className="flex items-start gap-2 p-2 rounded bg-brand-orange/5 border border-brand-orange/10">
                        <AlertTriangle className="w-3 h-3 text-brand-orange mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">邮件处理Agent 今日调用次数接近上限</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex gap-2">
                    {[
                      { label: "全部重启", icon: RotateCcw, action: () => toast.success("所有 Agent 已重启") },
                      { label: "全部暂停", icon: Pause, action: () => toast.info("所有 Agent 已暂停") },
                      { label: "性能报告", icon: BarChart3, action: () => toast.info("报告生成中...") },
                    ].map((a) => (
                      <button
                        key={a.label}
                        onClick={a.action}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <a.icon className="w-3 h-3" />
                        {a.label}
                      </button>
                    ))}
                  </div>
                </TabsContent>

                {/* Agent List Tab */}
                <TabsContent value="agents" className="mt-0 space-y-2">
                  {agents.map((agent) => (
                    <div key={agent.id} className="rounded-lg border border-border bg-card p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{agent.icon}</span>
                          <span className="text-xs font-semibold">{agent.name}</span>
                        </div>
                        <Badge variant="secondary" className={cn("text-[9px] h-5", agent.status === "running" && "bg-brand-green/15 text-brand-green")}>
                          <span className={cn("w-1.5 h-1.5 rounded-full mr-1", statusColors[agent.status])} />
                          {statusLabels[agent.status]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="text-[10px] text-muted-foreground">
                          CPU: <span className="text-foreground font-medium">{agent.cpu}%</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          内存: <span className="text-foreground font-medium">{agent.memory}%</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          今日: <span className="text-foreground font-medium">{agent.todayCount} {agent.todayLabel}</span>
                        </div>
                      </div>
                      <Progress value={agent.cpu} className="h-1 mb-2" />
                      <div className="flex gap-1.5">
                        {agent.status === "running" && (
                          <>
                            <button onClick={() => toggleAgent(agent.id, "pause")} className="text-[10px] px-2 py-1 rounded border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">暂停</button>
                            <button onClick={() => toggleAgent(agent.id, "restart")} className="text-[10px] px-2 py-1 rounded border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">重启</button>
                          </>
                        )}
                        {(agent.status === "idle" || agent.status === "paused") && (
                          <button onClick={() => toggleAgent(agent.id, "start")} className="text-[10px] px-2 py-1 rounded border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">启动</button>
                        )}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="perf" className="mt-0 space-y-4">
                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-primary" />
                      系统资源占用
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "CPU", value: avgCpu, max: 100, unit: "%" },
                        { label: "内存", value: 26, max: 100, unit: "% (4.2GB / 16GB)" },
                        { label: "磁盘", value: 2, max: 100, unit: "% (5.8GB / 256GB)" },
                      ].map((r) => (
                        <div key={r.label}>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-muted-foreground">{r.label}</span>
                            <span className="font-medium text-foreground">{r.value}{r.unit}</span>
                          </div>
                          <Progress value={r.value} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      AI 调用统计
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "今日调用", value: "234 次" },
                        { label: "本月调用", value: "5,678 次" },
                        { label: "Token 消耗", value: "1.2M" },
                      ].map((s) => (
                        <div key={s.label} className="text-center p-2 rounded bg-secondary">
                          <div className="text-sm font-bold text-foreground">{s.value}</div>
                          <div className="text-[10px] text-muted-foreground">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      响应速度
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "平均响应", value: "1.2s" },
                        { label: "最快", value: "0.3s" },
                        { label: "最慢", value: "3.5s" },
                      ].map((s) => (
                        <div key={s.label} className="text-center p-2 rounded bg-secondary">
                          <div className="text-sm font-bold text-foreground">{s.value}</div>
                          <div className="text-[10px] text-muted-foreground">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Logs Tab */}
                <TabsContent value="logs" className="mt-0 space-y-0">
                  <div className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                    <ScrollText className="w-3.5 h-3.5 text-primary" />
                    实时日志
                  </div>
                  <div className="space-y-1">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-2 p-2 rounded hover:bg-secondary/50 transition-colors">
                        <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap mt-0.5">{log.time}</span>
                        {log.type === "success" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-brand-orange shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <div className="text-[11px] text-foreground">{log.text}</div>
                          <div className="text-[10px] text-muted-foreground">{log.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-3 text-xs text-primary hover:underline py-1">查看完整日志</button>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
}
