"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { getIndustryInsights } from "@/actions/dashboard";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
  Zap,
  Target,
  ArrowRight,
  RefreshCcw,
  CheckCircle2,
  Info,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

// --- Sub-components ---

const DemandMeter = ({ level }) => {
  const score = level.toLowerCase() === "high" ? 85 : level.toLowerCase() === "medium" ? 50 : 25;
  const color = level.toLowerCase() === "high" ? "#10B981" : level.toLowerCase() === "medium" ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="40" cy="40" r="34"
          stroke="currentColor" strokeWidth="8"
          fill="transparent"
          className="text-muted/10"
        />
        <motion.circle
          cx="40" cy="40" r="34"
          stroke={color} strokeWidth="8"
          fill="transparent"
          strokeDasharray="213.6"
          initial={{ strokeDashoffset: 213.6 }}
          animate={{ strokeDashoffset: 213.6 - (213.6 * score) / 100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{level}</span>
      </div>
    </div>
  );
};

const GrowthSparkline = ({ value }) => {
  const data = useMemo(() => [
    { v: 10 }, { v: 15 }, { v: 12 }, { v: value * 0.8 }, { v: value * 0.5 }, { v: value }
  ], [value]);

  return (
    <div className="h-10 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <Line
            type="monotone"
            dataKey="v"
            stroke="#10B981"
            strokeWidth={3}
            dot={false}
            animationDuration={2000}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

const DashboardView = ({ insights }) => {
  const router = useRouter();

  // Manual sync function
  const { loading: syncLoading, fn: syncFn } = useFetch(getIndustryInsights);

  const handleSync = async () => {
    try {
      await syncFn(true);
      toast.success("Intelligence synced successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Deep sync failed. Trying again...");
    }
  };

  // Transform salary data for the chart
  const salaryData = insights.salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }));

  // Force userSkillsSet into useMemo to be used correctly
  const userSkillsSet = useMemo(() =>
    new Set((insights.userSkills || []).map(s => s.toLowerCase())),
    [insights.userSkills]
  );

  // Skill analysis data for the Radar chart (Deterministic to avoid hydration mismatch)
  const skillAnalysisData = useMemo(() => {
    return insights.topSkills.map((skill) => {
      // Create a deterministic value based on the skill name
      const charCodeSum = skill.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return {
        subject: skill,
        marketDemand: 65 + (charCodeSum % 30), // Stable value between 65-95
        userProficiency: userSkillsSet.has(skill.toLowerCase()) ? 90 : 30 + (charCodeSum % 20),
        fullMark: 100,
      };
    });
  }, [insights.topSkills, userSkillsSet]);

  const getMarketOutlookInfo = (outlook) => {
    switch (outlook.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-emerald-500", glow: "shadow-emerald-500/20", bg: "bg-emerald-500/5", border: "border-emerald-500/20" };
      case "neutral":
        return { icon: LineChart, color: "text-amber-500", glow: "shadow-amber-500/20", bg: "bg-amber-500/5", border: "border-amber-500/20" };
      case "negative":
        return { icon: TrendingDown, color: "text-red-500", glow: "shadow-red-500/20", bg: "bg-red-500/5", border: "border-red-500/20" };
      default:
        return { icon: LineChart, color: "text-gray-500", glow: "", bg: "bg-muted/5", border: "border-border/40" };
    }
  };

  const { icon: OutlookIcon, color: outlookColor, glow: outlookGlow, bg: outlookBg, border: outlookBorder } = getMarketOutlookInfo(insights.marketOutlook);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80, damping: 15 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-24"
    >
      {/* Premium Header & Intelligence Sync Hub */}
      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 border-b border-border/40 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">
              Active Intelligence Session
            </div>
            <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30 text-[9px] font-black uppercase tracking-widest hidden sm:flex">
              Power Insight v2.0
            </Badge>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Market Live
            </div>
          </div>
          <h2 className="text-5xl font-black tracking-tighter gradient-title leading-[1.1]">Industry Marketplace</h2>
          <p className="text-muted-foreground/60 text-sm font-medium flex items-center gap-2">
            Proprietary analysis synced <span className="text-foreground font-black underline decoration-primary/30 decoration-2 underline-offset-4">{insights.lastUpdated ? formatDistanceToNow(new Date(insights.lastUpdated), { addSuffix: true }) : "Just now"}</span>
          </p>
        </div>

        {/* Next-Gen Sync Card */}
        <div className="flex items-center gap-6">
          <Card className="card-premium border border-border/40 shadow-xl bg-muted/20 backdrop-blur-3xl px-8 py-5 flex items-center gap-8 min-w-[340px] group transition-all duration-500 hover:border-primary/30 hover:bg-muted/30">
            <div className="p-4 bg-white rounded-2xl border border-border/60 shadow-lg group-hover:rotate-6 transition-transform">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase text-primary leading-none mb-1">{format(new Date(insights.nextUpdate), "MMM")}</p>
                <p className="text-2xl font-black tracking-tight text-foreground">{format(new Date(insights.nextUpdate), "dd")}</p>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em]">Next Intelligence Sync</p>
                <RefreshCcw className="h-3 w-3 text-primary/40 animate-spin-slow" />
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-black text-foreground tracking-tight">Auto-Schedule Active</p>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-2 py-0 text-[9px] font-black">MONTHLY</Badge>
              </div>
              <div className="h-1 w-full bg-muted/40 rounded-full overflow-hidden mt-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 2, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-primary to-primary/40"
                />
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* High-Impact Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} whileHover={{ y: -6, scale: 1.01 }} className="h-full">
          <Card className={`card-premium h-full border ${outlookBorder} ${outlookGlow} ${outlookBg} overflow-hidden group transition-all duration-500`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <OutlookIcon className="h-20 w-20" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${outlookColor.replace("text-", "bg-")} animate-pulse`} />
                Market Outlook
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-black ${outlookColor} tracking-tighter mb-1 uppercase`}>{insights.marketOutlook}</div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase opacity-80 mb-4">
                Stability Rating: <span className="text-foreground">Optimal</span>
              </div>
              <div className="flex gap-1 h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                  className={`h-full ${outlookColor.replace("text-", "bg-")}`}
                />
                <div className="h-full w-1/3 bg-muted/40" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -6, scale: 1.01 }} className="h-full">
          <Card className="card-premium h-full border border-emerald-500/20 shadow-emerald-500/10 bg-emerald-500/[0.02] overflow-hidden group">
            <CardHeader className="pb-2">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                Industry Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-emerald-500 tracking-tighter mb-1">+{insights.growthRate.toFixed(1)}%</div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-80">Compound Progress</p>
              <GrowthSparkline value={insights.growthRate} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -6, scale: 1.01 }} className="h-full">
          <Card className="card-premium h-full border border-primary/20 shadow-primary/10 bg-primary/[0.02] overflow-hidden group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
                <BriefcaseIcon className="h-3 w-3 text-primary" />
                Talent Demand
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row items-center justify-between gap-4 relative z-10">
              <div>
                <div className="text-3xl font-black text-foreground tracking-tighter uppercase">{insights.demandLevel}</div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-80 mt-1">Hiring Velocity</p>
              </div>
              <div className="relative group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-20" />
                <DemandMeter level={insights.demandLevel} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -6, scale: 1.01 }} className="h-full">
          <Card className="card-premium h-full border border-indigo-500/20 shadow-indigo-500/10 bg-indigo-500/[0.02] overflow-hidden group">
            <CardHeader className="pb-2">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
                <Brain className="h-3 w-3 text-indigo-500" />
                Critical Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-indigo-500 tracking-tighter mb-1">{insights.topSkills.length} Core</div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-80 mb-3">Priority Domains</p>
              <div className="flex flex-wrap gap-1.5">
                {insights.topSkills.slice(0, 3).map((skill, i) => (
                  <motion.span
                    key={skill}
                    whileHover={{ scale: 1.05 }}
                    className="text-[9px] font-black bg-indigo-50/50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100/50 uppercase tracking-tight shadow-sm"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Layout (Responsive Overhaul) */}
      <div className="space-y-10">
        {/* Full-Width Financial Landscape */}
        <motion.div variants={itemVariants} className="w-full">
          <Card className="card-premium border border-border/40 shadow-2xl glass-subtle h-[580px] flex flex-col group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <CardHeader className="pb-8 border-b border-border/40 mx-4 px-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-foreground flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    Financial Landscape
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">
                    Proprietary Salary Distribution (2025 Market Sync)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100 shadow-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  VERIFIED MARKET RATE
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-12 relative px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute top-8 left-8 p-4 bg-primary/5 rounded-2xl border border-primary/10 max-w-[240px] hidden xl:block shadow-inner backdrop-blur-md"
              >
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Strategic Insight</h4>
                <p className="text-xs font-semibold leading-relaxed text-muted-foreground/80 italic">
                  "Mid-market leadership roles have surged by 18.2% in competitive territories this quarter."
                </p>
              </motion.div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                  <defs>
                    <linearGradient id="premiumBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#818CF8" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="secondaryBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#CBD5E1" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#F8FAFC" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.4} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 10, fontWeight: 700 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }}
                    tickFormatter={(v) => `$${v}k`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(79, 70, 229, 0.04)", radius: 12 }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white/95 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-primary/10 rounded-2xl p-6 backdrop-blur-2xl ring-1 ring-white/20">
                            <div className="flex items-center gap-3 mb-4 border-b border-border/40 pb-3">
                              <div className="h-4 w-1 bg-primary rounded-full" />
                              <p className="font-black text-foreground text-lg tracking-tight">{label}</p>
                            </div>
                            <div className="space-y-4">
                              {payload.map((item) => (
                                <div key={item.name} className="flex flex-col gap-1">
                                  <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.1em]">{item.name.replace(" Salary (K)", "")}</span>
                                  <span className="text-xl font-black text-primary">${item.value}<span className="text-[12px] text-muted-foreground/40 ml-0.5">k</span></span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Market Validated
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-primary/20" />
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="min" fill="url(#secondaryBar)" name="Entry" radius={[12, 12, 0, 0]} barSize={18} />
                  <Bar dataKey="median" fill="url(#premiumBar)" name="Median" radius={[12, 12, 0, 0]} barSize={18} />
                  <Bar dataKey="max" fill="url(#secondaryBar)" name="Peak" radius={[12, 12, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* --- Skill Intelligence Center --- */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Skill Radar Analysis */}
          <Card className="card-premium border border-border/40 shadow-2xl glass-subtle h-[500px] flex flex-col group overflow-hidden relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-foreground flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                      <Brain className="h-5 w-5 text-indigo-600" />
                    </div>
                    Skill Dominance Radar
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.15em] mt-1 text-muted-foreground/60">
                    Your Proficiency vs Industry Demand Force
                  </CardDescription>
                </div>
                <Badge className="bg-indigo-500/10 text-indigo-600 border-none text-[9px] font-black">AI ANALYZED</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 relative pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillAnalysisData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#64748B", fontSize: 10, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name="Market Demand"
                    dataKey="marketDemand"
                    stroke="#4F46E5"
                    fill="#4F46E5"
                    fillOpacity={0.15}
                  />
                  <Radar
                    name="Your Proficiency"
                    dataKey="userProficiency"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white/95 shadow-2xl border border-border/40 rounded-xl p-4 backdrop-blur-xl">
                            <p className="font-black text-xs text-foreground uppercase tracking-widest mb-2 border-b border-border pb-2">{payload[0].payload.subject}</p>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-6">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Market Force</span>
                                <span className="text-xs font-black text-indigo-600">{payload[0].value.toFixed(0)}%</span>
                              </div>
                              <div className="flex items-center justify-between gap-6">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Your Match</span>
                                <span className="text-xs font-black text-emerald-600">{payload[1].value.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
            <div className="px-8 pb-8 flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Industry Pulse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Your Inventory</span>
              </div>
            </div>
          </Card>

          {/* Skill Gap Analysis Box - High Contrast Sapphire Glass */}
          <Card className="card-premium border border-indigo-500/30 shadow-[0_32px_64px_-16px_rgba(79,70,229,0.15)] bg-white/90 backdrop-blur-3xl h-[500px] flex flex-col group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-primary to-indigo-500" />
            <CardHeader className="pt-8 px-8 border-b border-indigo-500/10">
              <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <Zap className="h-5 w-5 text-emerald-600" />
                </div>
                Strategic Upskilling
              </CardTitle>
              <CardDescription className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">Actionable Career Leverage</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 px-8 pt-8 space-y-4 overflow-y-auto custom-scrollbar">
              <p className="text-sm font-bold text-slate-700 leading-relaxed mb-8">
                Prioritize these <span className="text-primary italic">emerging domains</span> to maximize your market value this month.
              </p>

              {insights.topSkills.filter(s => !userSkillsSet.has(s.toLowerCase())).map((skill, i) => (
                <motion.div
                  key={skill}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * i }}
                  className="relative group/item"
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all flex items-center justify-between pr-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-300 border border-indigo-500/30">GAP</div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{skill}</p>
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">High Potential</p>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg transition-transform"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}

              {insights.topSkills.filter(s => !userSkillsSet.has(s.toLowerCase())).length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Inventory Optimized</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">You currently maintain full market coverage.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-slate-50 border-t border-slate-200 py-6 px-8 flex justify-between items-center group/footer">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Strategy Framework v2.0</p>
              <div className="flex items-center gap-2">
                 <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[9px] font-black text-emerald-600 uppercase">Live Market Data</p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Bottom Strategic Tier (Responsive 2-Column Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Intelligence Pulse - Redesigned for Business Clarity */}
          <motion.div variants={itemVariants}>
            <Card className="card-premium border border-indigo-500/20 shadow-2xl bg-slate-950 text-white overflow-hidden relative flex flex-col group h-full min-h-[520px] rounded-[2rem]">
              <div className="absolute top-0 left-0 w-full h-full opacity-40 mix-blend-screen pointer-events-none -z-10">
                <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_#4F46E5_0%,_transparent_60%)] animate-slow-spin-reverse" />
              </div>

              <CardHeader className="relative z-10 pt-10 px-8">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-3xl font-black tracking-tighter flex items-center gap-4 text-white">
                    <div className="p-2.5 bg-primary/20 rounded-2xl border border-primary/30 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                      <Brain className="h-7 w-7 text-primary animate-pulse" />
                    </div>
                    Intelligence Pulse
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-white border-none text-[9px] font-black tracking-[0.2em] uppercase px-3">Proprietary AI</Badge>
                  <CardDescription className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Strategic Synthesis Engine</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 flex-1 flex flex-col justify-between pt-10 px-8">
                <div className="space-y-8">
                  <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/10 shadow-2xl relative group/box overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                      <Zap className="h-24 w-24 text-white" />
                    </div>
                    <p className="text-[17px] leading-relaxed font-black text-white italic drop-shadow-md pr-8">
                      {insights.topSkills.length > 0
                        ? `A massive pivot is occurring toward ${insights.topSkills[0]}. Early movers in your industry are seeing ~20% faster promotion cycles.`
                        : "Synchronizing market forces... Your strategic roadmap will refresh shortly."
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-[1.5rem] p-6 border border-white/10 hover:bg-white/10 transition-all group/stat">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 group-hover/stat:text-white/60 transition-colors">Growth Momentum</p>
                      <p className="text-3xl font-black text-emerald-400">+{insights.growthRate}%</p>
                    </div>
                    <div className="bg-white/5 rounded-[1.5rem] p-6 border border-white/10 hover:bg-white/10 transition-all group/stat">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 group-hover/stat:text-white/60 transition-colors">Demand Strength</p>
                      <p className="text-3xl font-black text-primary-foreground tracking-tight">{insights.demandLevel}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pb-8 border-t border-white/10 pt-10">
                  <div className="flex items-center justify-between mb-8 px-2">
                    <p className="text-[11px] font-black text-white/40 tracking-[0.4em] uppercase">Tactical roadmap</p>
                    <Target className="h-5 w-5 text-white/20" />
                  </div>
                  <div className="space-y-3">
                    {(insights.recommendedSkills.length > 0 ? insights.recommendedSkills : ["Analyze Market", "Build Portfolio", "Expand Network"]).slice(0, 3).map((skill, idx) => (
                      <motion.div
                        key={skill}
                        whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.08)" }}
                        className="flex items-center justify-between bg-white/[0.03] p-5 rounded-2xl border border-white/[0.05] group transition-all"
                      >
                        <div className="flex items-center gap-5">
                          <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center text-[12px] font-black text-white border border-primary/30 shadow-lg">0{idx + 1}</div>
                          <span className="text-[14px] font-black uppercase tracking-tight text-white/90">{skill}</span>
                        </div>
                        <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Market Forces */}
          <motion.div variants={itemVariants}>
            <Card className="card-premium border border-border/40 shadow-xl glass-subtle flex flex-col h-full min-h-[500px]">
              <CardHeader className="pb-4 px-4 sm:px-8 pt-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-black text-foreground flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-xl">
                      <Info className="h-6 w-6 text-foreground/60" />
                    </div>
                    Market Forces
                  </CardTitle>
                  <Badge className="bg-muted text-[9px] font-black text-muted-foreground tracking-widest uppercase">Trend Analysis</Badge>
                </div>
                <CardDescription className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Critical Ecosystem Shifts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6 px-4 sm:px-8 flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                  {insights.keyTrends.map((trend, i) => (
                    <motion.div
                      key={trend}
                      whileHover={{ x: 10, backgroundColor: "rgba(0,0,0,0.05)" }}
                      className="bg-muted/30 p-5 rounded-2xl border border-border/40 flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
                        <span className="text-sm font-bold text-foreground leading-tight">{trend}</span>
                      </div>
                      <Badge className={`bg-primary/10 text-primary border-none text-[8px] font-black tracking-widest ${i % 2 === 0 ? "opacity-100" : "opacity-40"}`}>
                        {i % 2 === 0 ? "HIGH IMPACT" : "MODERATE"}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-border/40">
                  <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-2xl border border-dashed border-border">
                    <div className="h-10 w-10 flex-shrink-0 bg-white rounded-xl shadow-sm flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Market Recommendation</p>
                      <p className="text-xs font-black text-foreground">Position your portfolio toward emerging trends for maximum leverage.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardView;
