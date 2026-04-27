import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Database,
  FileCheck2,
  LockKeyhole,
  MessageSquareText,
  Network,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import logoImg from "@/assets/official/centaur_logo_official.png";
import heroOfficialImg from "@/assets/official/centaur_hero_official.png";
import edgeOfficialImg from "@/assets/official/centaur_edge_official.png";
import proOfficialImg from "@/assets/official/centaur_pro_official.png";
import iconWebsiteImg from "@/assets/official/icon_website_official.png";
import iconSocialImg from "@/assets/official/icon_social_official.png";
import iconTargetImg from "@/assets/official/icon_target_official.png";
import iconRobotImg from "@/assets/official/icon_robot_official.png";
import workflowImg from "@/assets/workflow-visual.svg";
import financeOfficeImg from "@/assets/finance-office.svg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.58, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const hardware = [
  {
    name: "Centaur Edge",
    tag: "个人版 / 单点流程",
    image: edgeOfficialImg,
    desc: "适合个人创业者、小团队或单一业务流程，先把资料整理、客户跟进、日报提醒跑起来。",
    fit: ["单一部门", "轻量部署", "快速验证"],
  },
  {
    name: "Centaur Pro",
    tag: "团队版 / 多岗位协同",
    image: proOfficialImg,
    desc: "适合财税团队与服务型企业，承载多资料源、多 AI 岗位和多人确认机制。",
    fit: ["多岗位", "多人协同", "本地沉淀"],
  },
];

const roles = [
  { icon: Database, image: iconWebsiteImg, name: "资料整理员", desc: "识别资料来源，按客户与月份自动归档。" },
  { icon: MessageSquareText, image: iconSocialImg, name: "客户催收员", desc: "发现缺失资料，生成催收话术给人工确认。" },
  { icon: FileCheck2, image: iconTargetImg, name: "票据初审员", desc: "初步识别票据、合同、表格中的异常字段。" },
  { icon: ShieldCheck, image: iconRobotImg, name: "异常提醒员", desc: "持续监控逾期、缺失、错漏，主动提醒负责人。" },
  { icon: TrendingUp, image: heroOfficialImg, name: "老板日报员", desc: "每天汇总进度、风险、待确认事项。" },
];

const scrollSteps = [
  {
    k: "01",
    title: "资料进入本地",
    desc: "企微、飞书、本地文件夹、Excel、票据和客户资料先进入企业自己的 AI 主机。",
    chips: ["企微", "飞书", "本地文件", "Excel"],
  },
  {
    k: "02",
    title: "硅基员工开始处理",
    desc: "AI 自动识别、分类、匹配客户、判断缺失，并生成下一步任务建议。",
    chips: ["识别", "归档", "匹配", "判断"],
  },
  {
    k: "03",
    title: "碳基员工确认关键动作",
    desc: "客户催收、异常处理、资料确认等关键动作保留人工审核，安全可控。",
    chips: ["人工确认", "风险可控", "可追溯"],
  },
  {
    k: "04",
    title: "岗位持续上岗",
    desc: "资料整理员、催收员、票据初审员、异常提醒员、老板日报员持续运行。",
    chips: ["5 类岗位", "主动推送", "持续优化"],
  },
];

const financeScenarios = ["客户资料月度归档", "缺失资料自动判断", "客户催收话术生成", "票据与合同异常初审", "老板经营日报推送", "员工任务处理留痕"];

function GlowOrb({ className }: { className: string }) {
  return <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />;
}

function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <motion.div variants={fadeUp} className="mx-auto mb-10 max-w-3xl text-center">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-medium text-orange-200/80">
        <CircleDot className="h-3 w-3 text-orange-400" />
        {eyebrow}
      </div>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-white md:text-5xl">{title}</h2>
      {desc && <p className="mt-4 text-base leading-8 text-white/58 md:text-lg">{desc}</p>}
    </motion.div>
  );
}

function ScrollStepCard({
  step,
  index,
  total,
  scrollYProgress,
}: {
  step: (typeof scrollSteps)[number];
  index: number;
  total: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const opacity = useTransform(scrollYProgress, [Math.max(0, start - 0.08), start + 0.05, end, Math.min(1, end + 0.08)], [0.35, 1, 1, 0.35]);
  const x = useTransform(scrollYProgress, [Math.max(0, start - 0.08), start + 0.05], [-10, 0]);

  return (
    <motion.div style={{ opacity, x }} className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur">
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-xs text-orange-300">{step.k}</span>
        <span className="font-display text-xl font-semibold text-white">{step.title}</span>
      </div>
      <p className="text-sm leading-7 text-white/62">{step.desc}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {step.chips.map((chip) => (
          <span key={chip} className="rounded-full border border-white/10 bg-black/24 px-3 py-1 text-xs text-white/58">{chip}</span>
        ))}
      </div>
    </motion.div>
  );
}

function ScrollStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const orbitRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.12, 0.98]);
  const scanY = useTransform(scrollYProgress, [0, 1], ["8%", "78%"]);
  const flowX = useTransform(scrollYProgress, [0, 1], ["-24%", "24%"]);

  return (
    <section ref={ref} id="system" className="relative min-h-[125vh] border-y border-white/[0.06] bg-[#07090d]">
      <div className="sticky top-16 min-h-[calc(100vh-4rem)] overflow-hidden px-5 py-16 lg:px-8">
        <GlowOrb className="left-[-10rem] top-20 h-96 w-96 bg-orange-500/14" />
        <GlowOrb className="right-[-8rem] bottom-0 h-96 w-96 bg-cyan-500/12" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-300/18 bg-orange-300/[0.08] px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-orange-100/80">
              Scroll Interaction
            </div>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-6xl">
              下拉时，看到 AI 一体机怎样把工作流跑起来。
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/56">
              不再堆很多文字卡片，而是用滚动叙事解释半人马的核心逻辑：资料进入本地，硅基员工处理，碳基员工确认，最后形成可持续上岗的 AI 岗位。
            </p>
            <div className="mt-8 space-y-3">
              {scrollSteps.map((step, index) => (
                <ScrollStepCard key={step.k} step={step} index={index} total={scrollSteps.length} scrollYProgress={scrollYProgress} />
              ))}
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[620px]">
            <motion.div style={{ scale: glowScale }} className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgba(251,146,60,.22),transparent_56%)]" />
            <motion.div style={{ rotate: orbitRotate }} className="absolute inset-[8%] rounded-full border border-dashed border-orange-200/18" />
            <motion.div style={{ rotate: orbitRotate }} className="absolute inset-[20%] rounded-full border border-dashed border-cyan-200/18" />
            <div className="absolute inset-[18%] rounded-[3rem] border border-white/10 bg-black/36 shadow-[0_40px_120px_rgba(0,0,0,.55)] backdrop-blur-xl" />
            <motion.div style={{ y: scanY }} className="absolute left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent shadow-[0_0_26px_rgba(251,146,60,.9)]" />
            <motion.div style={{ x: flowX }} className="absolute left-[12%] right-[12%] top-[52%] h-16 rounded-full bg-gradient-to-r from-cyan-300/0 via-cyan-200/18 to-orange-300/0 blur-lg" />
            <img src={workflowImg} alt="半人马 AI 一体机滚动工作流" className="absolute inset-[14%] h-[72%] w-[72%] rounded-[2rem] object-contain opacity-90" />
            <div className="absolute left-0 top-[18%] rounded-2xl border border-orange-200/14 bg-black/48 px-4 py-3 text-sm text-orange-100 backdrop-blur-xl">
              碳基：判断 / 关系 / 责任
            </div>
            <div className="absolute bottom-[18%] right-0 rounded-2xl border border-cyan-200/14 bg-black/48 px-4 py-3 text-sm text-cyan-100 backdrop-blur-xl">
              硅基：计算 / 记忆 / 执行
            </div>
            <div className="absolute bottom-8 left-1/2 w-[78%] -translate-x-1/2 rounded-3xl border border-white/12 bg-[#050608]/78 p-4 backdrop-blur-2xl">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white"><Zap className="h-4 w-4 text-orange-300" />本地 AI 主机</div>
                <div className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-[11px] text-emerald-200">岗位运行中</div>
              </div>
              <div className="grid gap-2 text-xs text-white/55 sm:grid-cols-2">
                <div className="rounded-xl bg-white/[0.06] px-3 py-2">资料整理员：归档完成</div>
                <div className="rounded-xl bg-white/[0.06] px-3 py-2">老板日报员：待确认 3 项</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function WebsiteLanding() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#050608] text-white selection:bg-orange-400/30">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,153,51,0.13),transparent_35%),linear-gradient(180deg,#050608_0%,#080a0f_45%,#050608_100%)]" />
      <div className="fixed inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:56px_56px]" />

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050608]/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <img src={logoImg} alt="半人马 AI" className="h-9 w-9 object-contain" />
            <div>
              <div className="font-display text-sm font-semibold tracking-wide">半人马 AI</div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-white/38">Carbon × Silicon</div>
            </div>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-white/55 md:flex">
            <a href="#hardware" className="transition hover:text-white">硬件主机</a>
            <a href="#system" className="transition hover:text-white">协同逻辑</a>
            <a href="#roles" className="transition hover:text-white">AI 岗位</a>
            <a href="#finance" className="transition hover:text-white">财税方案</a>
          </nav>
          <a href="#contact" className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-black transition hover:bg-orange-200">
            预约演示 <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden px-5 pb-10 pt-14 lg:px-8 lg:pb-14 lg:pt-20">
          <GlowOrb className="right-[-12%] top-4 h-[34rem] w-[34rem] bg-orange-500/26" />
          <GlowOrb className="left-[-18%] bottom-[-8rem] h-[30rem] w-[30rem] bg-cyan-500/12" />
          <div className="absolute inset-x-0 top-24 -z-0 mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-orange-300/35 to-transparent" />

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div variants={stagger} initial="hidden" animate="show" className="relative z-20">
              <motion.div variants={fadeUp} className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-300/24 bg-orange-300/[0.09] px-3 py-1.5 text-sm text-orange-100/88 shadow-[0_0_32px_rgba(251,146,60,.12)]">
                <Sparkles className="h-4 w-4 text-orange-300" />
                碳基员工 × 硅基员工 · 本地 AI 一体机
              </motion.div>
              <motion.h1 variants={fadeUp} className="font-display text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-white md:text-7xl xl:text-8xl">
                半人马 AI，
                <span className="block bg-gradient-to-r from-orange-100 via-orange-400 to-cyan-200 bg-clip-text text-transparent">让碳基与硅基协同上岗。</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-7 max-w-2xl text-lg leading-9 text-white/64 md:text-xl">
                碳基，是人的经验、判断、客户关系和最终确认；硅基，是 AI 的计算、记忆、资料识别和主动执行。半人马 AI 用一台本地硬件主机，把硅基员工部署到企业真实工作流里。
              </motion.p>
              <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#contact" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-orange-400 px-6 text-sm font-bold text-black shadow-[0_0_40px_rgba(251,146,60,.30)] transition hover:bg-orange-300">
                  预约 30 分钟演示 <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#system" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-6 text-sm font-semibold text-white transition hover:bg-white/[0.08]">
                  下拉看协同逻辑 <ChevronRight className="h-4 w-4" />
                </a>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="relative min-h-[460px] lg:min-h-[580px]">
              <div className="absolute inset-0 rounded-[3rem] bg-[radial-gradient(circle_at_50%_42%,rgba(251,146,60,.34),transparent_34%),radial-gradient(circle_at_68%_28%,rgba(125,211,252,.18),transparent_30%)] blur-2xl" />
              <div className="absolute inset-x-6 top-8 h-[72%] rounded-full border border-orange-200/12 bg-orange-300/[0.035] blur-sm" />
              <img src={heroOfficialImg} alt="半人马 AI 碳基与硅基协同主视觉" className="relative z-10 mx-auto h-[440px] w-full object-contain drop-shadow-[0_38px_80px_rgba(0,0,0,.62)] lg:h-[570px]" />
              <div className="absolute left-0 top-12 z-20 max-w-[220px] rounded-3xl border border-orange-200/18 bg-black/42 p-4 shadow-2xl backdrop-blur-xl">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-orange-100"><Users className="h-4 w-4 text-orange-300" />碳基员工</div>
                <p className="text-xs leading-6 text-white/55">负责判断、关系、责任。</p>
              </div>
              <div className="absolute bottom-16 right-0 z-20 max-w-[240px] rounded-3xl border border-cyan-200/18 bg-black/44 p-4 shadow-2xl backdrop-blur-xl">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-cyan-100"><Bot className="h-4 w-4 text-cyan-200" />硅基员工</div>
                <p className="text-xs leading-6 text-white/55">负责计算、记忆、执行。</p>
              </div>
            </motion.div>
          </div>
        </section>

        <motion.section id="hardware" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.22 }} className="relative border-y border-white/[0.06] bg-white/[0.026] px-5 py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.22em] text-orange-200/75">Hardware First</div>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-white md:text-5xl">核心产品，是可部署的 AI 硬件主机。</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-white/55 md:text-base">
                硬件只在这里集中讲清楚：它不是装饰性的盒子，而是企业本地的 AI 员工承载层，负责连接资料、运行岗位、保留数据沉淀。
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {hardware.map((item) => (
                <motion.div variants={fadeUp} key={item.name} className="group overflow-hidden rounded-[2rem] border border-white/[0.09] bg-gradient-to-br from-white/[0.07] to-white/[0.025] shadow-2xl">
                  <div className="relative overflow-hidden bg-black/30">
                    <img src={item.image} alt={`${item.name} 半人马 AI 硬件主机`} className="aspect-[16/9] w-full object-cover transition duration-700 group-hover:scale-[1.035]" />
                    <div className="absolute left-5 top-5 rounded-full border border-white/12 bg-black/42 px-3 py-1.5 text-xs text-white/70 backdrop-blur-md">{item.tag}</div>
                  </div>
                  <div className="p-7">
                    <div className="font-display text-3xl font-semibold">{item.name}</div>
                    <p className="mt-3 text-sm leading-7 text-white/55">{item.desc}</p>
                    <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/50">
                      {item.fit.map((fit) => <span key={fit} className="rounded-full border border-white/10 bg-black/22 px-3 py-2">{fit}</span>)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <section className="border-b border-white/[0.06] bg-[#07090d]">
          <div className="mx-auto grid max-w-7xl gap-px px-5 py-12 lg:grid-cols-3 lg:px-8">
            {[
              ["不是聊天机器人", "AI 不停留在问答窗口，而是进入资料、客户、票据与日报流程。"],
              ["不是通用 Agent 平台", "不要求客户自己搭流程，而是按岗位打包交付，先能上岗。"],
              ["不是纯云端 SaaS", "企业敏感资料优先在本地沉淀，关键动作保留人工确认。"],
            ].map(([title, desc]) => (
              <div key={title} className="p-5">
                <div className="mb-3 text-sm font-semibold text-orange-200">{title}</div>
                <p className="text-sm leading-7 text-white/50">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <ScrollStory />

        <motion.section id="roles" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="bg-[#090b10] px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="AI Workforce" title="交付五类能上岗的 AI 员工" desc="页面减少重复说明，把核心信息收束为：这些岗位能接什么输入、做什么动作、输出什么结果。" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <motion.div variants={fadeUp} key={role.name} className="group overflow-hidden rounded-[1.4rem] border border-white/[0.08] bg-[#0f1218] transition hover:-translate-y-1 hover:border-orange-300/30">
                    <div className="relative h-32 overflow-hidden bg-black/30">
                      <img src={role.image} alt={`${role.name}视觉图`} className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1218] via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-300/[0.12] text-orange-200 ring-1 ring-orange-300/20 backdrop-blur"><Icon className="h-5 w-5" /></div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-semibold text-white">{role.name}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/48">{role.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        <motion.section id="finance" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.18 }} className="relative overflow-hidden bg-[#0b0d12] px-5 py-24 lg:px-8">
          <GlowOrb className="bottom-[-120px] left-[10%] h-72 w-72 bg-orange-500/16" />
          <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <SectionHeader eyebrow="First Scenario" title="财税行业，先把资料整理和催收跑起来" desc="财税公司最痛的不是没有系统，而是资料来源分散、月度归档重复、缺失催收消耗人力。" />
              <motion.div variants={fadeUp} className="mt-2 overflow-hidden rounded-[1.7rem] border border-white/[0.08] bg-white/[0.035] shadow-2xl">
                <img src={financeOfficeImg} alt="财税办公室资料、票据和 AI 一体机协同处理场景" className="h-auto w-full" />
              </motion.div>
            </div>
            <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-2">
              {financeScenarios.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-300" />
                  <span className="text-sm text-white/72">{item}</span>
                </div>
              ))}
              <div className="rounded-[1.4rem] border border-orange-300/15 bg-orange-300/[0.06] p-5 sm:col-span-2">
                <div className="font-display text-lg font-semibold text-orange-100">典型流程</div>
                <p className="mt-3 text-sm leading-7 text-white/55">企微 / 飞书 / 本地资料 → AI 识别分类 → 客户匹配 → 月度归档 → 缺失判断 → 催收话术 → 人工确认 → 任务归档 / 日报。</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <section id="contact" className="px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-orange-300/18 bg-gradient-to-br from-orange-300/[0.14] via-white/[0.045] to-cyan-300/[0.08] p-8 md:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-orange-100/80"><Bot className="h-3.5 w-3.5" />让第一批 AI 员工上岗</div>
                <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">预约一次演示，看看哪些岗位适合先交给 AI。</h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/60">我们会基于你的业务流程，判断哪些资料流、客户跟进和日报任务最适合由半人马 AI 一体机先接手。</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a href="tel:400-000-0000" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-black transition hover:bg-orange-200">预约演示 <ArrowRight className="h-4 w-4" /></a>
                <a href="mailto:contact@banrenmaai.cn" className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-black/20 px-6 text-sm font-semibold text-white transition hover:bg-black/35">获取财税行业方案</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-5 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-white/40 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3"><img src={logoImg} alt="半人马 AI" className="h-7 w-7" /> 半人马 AI · 本地 AI 数字员工一体机</div>
          <div>© 2026 半人马 AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
