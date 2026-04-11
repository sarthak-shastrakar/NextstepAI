"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Sparkles,
  Save,
  Brain,
  CheckCircle2,
  XCircle,
  TrendingUp,
  LayoutDashboard,
  User,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  ChevronRight,
  Lightbulb,
  CloudCheck,
  Zap,
  FileText,
  Eye,
  EyeOff,
  LayoutTemplate,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { saveResume, getATSScore, generateSummary } from "@/actions/resume";
import { useUser } from "@clerk/nextjs";
import { EntryForm } from "./entry-form";
import { SummaryForm } from "./summaryform";
import useFetch from "@/hooks/use-fetch";
import { entriesToMarkdown } from "@/app/form-lib/helper";
import { resumeSchema } from "@/app/form-lib/schema";
import { cn } from "@/lib/utils";
import ResumePreview from "./ResumePreview";
import { RESUME_TEMPLATES } from "./templates";
import { motion, AnimatePresence } from "framer-motion";

export default function ResumeBuilder({ initialContent, userIndustry }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("minimal");
  const [showTemplateDrawer, setShowTemplateDrawer] = useState(false);

  // For mobile preview toggle
  const [mobileShowPreview, setMobileShowPreview] = useState(false);

  // Section refs for scrolling
  const sectionRefs = {
    contact: useRef(null),
    summary: useRef(null),
    skills: useRef(null),
    experience: useRef(null),
    education: useRef(null),
    projects: useRef(null),
  };

  const scrollToSection = (sectionName) => {
    setActiveTab("edit");
    setMobileShowPreview(false);
    setTimeout(() => {
      sectionRefs[sectionName]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const formValues = watch();

  useEffect(() => {
    if (initialContent) setActiveTab("preview");
  }, [initialContent]);

  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValues, activeTab]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo.linkedin) parts.push(`💼 LinkedIn`);
    if (contactInfo.github) parts.push(`💻 GitHub`);
    return parts.length > 0 ? `## Contact\n${parts.join(" | ")}` : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n${summary}`,
      skills && `## Skills\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const getCompletion = () => {
    const { contactInfo, summary, skills, experience, education, projects } = formValues;
    const checks = [
      contactInfo?.email,
      contactInfo?.mobile,
      contactInfo?.linkedin,
      summary?.length > 50,
      skills?.length > 20,
      experience?.length > 0,
      education?.length > 0,
      projects?.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const completion = getCompletion();

  const getStrengthColor = (pct) => {
    if (pct < 40) return "bg-red-500 shadow-red-500/40";
    if (pct < 70) return "bg-amber-500 shadow-amber-500/40";
    return "bg-emerald-500 shadow-emerald-500/40";
  };

  const improvementTips = [
    !formValues.contactInfo?.linkedin && { text: "Add LinkedIn profile", section: "contact", pts: "+15" },
    !formValues.summary?.length && { text: "Write a professional summary", section: "summary", pts: "+20" },
    !formValues.skills?.length && { text: "List your core skills", section: "skills", pts: "+15" },
    !formValues.experience?.length && { text: "Add work experience", section: "experience", pts: "+25" },
    !formValues.projects?.length && { text: "Showcase your projects", section: "projects", pts: "+15" },
  ].filter(Boolean);

  const sectionTips = {
    contact: "Include your LinkedIn, GitHub, and professional email. Recruiters verify these first.",
    summary: "Start with your role + years of experience, then highlight 2 top achievements.",
    skills: "List 8–15 skills separated by commas. Mirror keywords from the job description.",
    experience: "Use action verbs (Led, Built, Optimized). Quantify results (e.g., 'improved load time by 40%').",
    education: "Include GPA if above 3.5. List relevant coursework or certifications.",
    projects: "Describe the tech stack used, your specific contribution, and measurable impact.",
  };

  const onSubmit = async (data) => {
    const hasMinimalDetails =
      data.contactInfo?.email ||
      data.summary?.length > 20 ||
      data.experience?.length > 0;

    if (!hasMinimalDetails) {
      toast.error("Please add at least basic contact info or a summary before saving.");
      return;
    }
    try {
      const content = getCombinedContent();
      await saveResumeFn(content || "");
      toast.success("Resume saved successfully!");
    } catch {
      toast.error("Failed to save resume. Please try again.");
    }
  };

  const handleCheckATS = async () => {
    if (completion < 60) {
      toast.error("Resume Incomplete", {
        description: `Your resume is only ${completion}% complete. Please fill at least 60% before running ATS analysis.`,
        icon: <AlertTriangle className="h-4 w-4" />,
      });
      return;
    }
    if (!previewContent || previewContent.trim().length < 50) {
      toast.error("Please add more content before analyzing.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const analysis = await getATSScore(previewContent);
      setAtsAnalysis(analysis);
    } catch {
      toast.error("ATS analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const { skills, experience } = formValues;
      const result = await generateSummary({ skills, experience });
      setValue("summary", result);
      toast.success("Summary generated!");
    } catch {
      toast.error("Failed to generate summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const generatePDF = async () => {
    if (!previewContent || previewContent.trim().length < 50) {
      toast.error("Cannot Export Empty Resume", {
        description: "A professional resume needs at least a professional summary or work history.",
        icon: <FileText className="h-4 w-4" />,
      });
      return;
    }

    setIsGenerating(true);
    try {
      const element = document.getElementById("resume-pdf");
      if (!element) throw new Error("Resume element not found");

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow.document;
      const head = document.head.cloneNode(true);
      iframeDoc.head.appendChild(head);

      const style = iframeDoc.createElement("style");
      style.innerHTML = `
        @page { size: A4; margin: 0; }
        @media print {
          body { margin: 0; padding: 0; width: 210mm; min-height: 297mm; }
          #resume-print-root { width: 210mm !important; margin: 0 !important; transform: none !important; }
        }
      `;
      iframeDoc.head.appendChild(style);

      const content = element.cloneNode(true);
      content.id = "resume-print-root";
      iframeDoc.body.appendChild(content);

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          setIsGenerating(false);
          toast.success("Resume generation ready!");
        }, 1000);
      }, 500);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-12 pb-32 pb-mobile-bar">
      {/* ── Sticky Header & Controls ───────────────────────── */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 py-4 mb-8 -mx-4 px-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="font-bold gradient-title text-3xl md:text-4xl tracking-tight">
            Resume Builder
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest flex items-center gap-2">
            Industry Standard • NextStep AI
            {!isSaving && saveResult && (
              <span className="flex items-center gap-1 text-emerald-500 lowercase normal-case brightness-110">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Saved
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Template picker */}
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl font-bold text-xs gap-1.5 border-primary/20"
            onClick={() => setShowTemplateDrawer(!showTemplateDrawer)}
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{RESUME_TEMPLATES[activeTemplate]?.name}</span>
            <span className="sm:hidden">Template</span>
          </Button>

          {/* ATS Check — all sizes */}
          <Button
            variant="outline"
            className="rounded-xl border-primary/20 bg-accent/50 text-primary hover:bg-primary hover:text-white transition-all font-semibold"
            onClick={handleCheckATS}
            disabled={isAnalyzing || !previewContent}
          >
            {isAnalyzing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" />ATS Check</>
            )}
          </Button>

          {/* Save + PDF — hidden on mobile (replaced by bottom bar) */}
          <Button
            variant="destructive"
            className="hidden lg:flex rounded-xl shadow-lg shadow-destructive/10"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Save Resume</>
            )}
          </Button>

          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="hidden lg:flex rounded-xl bg-slate-800 hover:bg-slate-900 transition-all"
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /></>
            ) : (
              <><Download className="h-4 w-4 mr-2" />PDF Export</>
            )}
          </Button>
        </div>
      </div>

      {/* ── Template Drawer ─────────────────────────────────── */}
      <AnimatePresence>
        {showTemplateDrawer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden -mt-8 print:hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-accent/10 rounded-2xl border border-border/40 mb-4">
              {Object.values(RESUME_TEMPLATES).map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => { setActiveTemplate(tmpl.id); setShowTemplateDrawer(false); }}
                  className={cn(
                    "cursor-pointer p-3 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98]",
                    activeTemplate === tmpl.id
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                      : "border-border/40 bg-white hover:border-primary/20"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("h-2.5 w-2.5 rounded-full border-2", activeTemplate === tmpl.id ? "bg-primary border-primary" : "border-slate-300")} />
                    <h4 className="text-sm font-bold text-slate-800">{tmpl.name}</h4>
                  </div>
                  <p className="text-[10px] text-muted-foreground pl-4">{tmpl.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main 4-col Grid (same as original) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Nav Sidebar — desktop only */}
        <div className="lg:col-span-1 space-y-6 hidden lg:block print:hidden">
          <Card className="card-premium sticky top-28">
            <CardContent className="p-4 space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Market Ready</span>
                  <span className={`text-sm font-bold ${completion < 75 ? "text-amber-600" : "text-emerald-600"}`}>{completion}%</span>
                </div>
                <div className="h-1.5 w-full bg-accent/30 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completion}%` }}
                    transition={{ type: "spring", stiffness: 50 }}
                    className={`h-full rounded-full shadow-[0_0_15px] transition-colors duration-500 ${getStrengthColor(completion)}`}
                  />
                </div>
              </div>

              {improvementTips.length > 0 && completion < 100 && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                    Next Steps to 100%
                  </p>
                  <div className="space-y-1.5">
                    {improvementTips.map((tip, i) => (
                      <div
                        key={i}
                        onClick={() => scrollToSection(tip.section)}
                        className="flex items-center justify-between group cursor-pointer bg-accent/20 hover:bg-primary/5 p-2 rounded-lg transition-all border border-transparent hover:border-primary/20"
                      >
                        <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors font-medium">{tip.text}</span>
                        <Badge variant="ghost" className="text-[9px] h-3.5 bg-primary/10 text-primary font-bold px-1 group-hover:bg-primary group-hover:text-white transition-all">{tip.pts}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-3">Sections</p>
                {[
                  { name: "Contact", icon: <User className="h-3.5 w-3.5" />, id: "contact" },
                  { name: "Summary", icon: <Brain className="h-3.5 w-3.5" />, id: "summary" },
                  { name: "Skills", icon: <Code2 className="h-3.5 w-3.5" />, id: "skills" },
                  { name: "Experience", icon: <Briefcase className="h-3.5 w-3.5" />, id: "experience" },
                  { name: "Education", icon: <GraduationCap className="h-3.5 w-3.5" />, id: "education" },
                  { name: "Projects", icon: <LayoutDashboard className="h-3.5 w-3.5" />, id: "projects" },
                ].map((s) => (
                  <div
                    key={s.name}
                    onClick={() => scrollToSection(s.id)}
                    className="flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary cursor-pointer transition-all active:scale-95 group"
                  >
                    <span className="group-hover:scale-110 transition-transform">{s.icon}</span>
                    {s.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content — Tabs on desktop, mobile toggle overlay */}
        <div className="lg:col-span-3">

          {/* Mobile: Preview Toggle Button */}
          <div className="flex lg:hidden mb-4 print:hidden">
            <Button
              variant="outline"
              className="w-full rounded-xl font-bold gap-2"
              onClick={() => setMobileShowPreview(!mobileShowPreview)}
            >
              {mobileShowPreview ? <><Eye className="h-4 w-4" />Back to Editor</> : <><Monitor className="h-4 w-4" />Preview Resume</>}
            </Button>
          </div>

          {/* Mobile Preview Panel */}
          <AnimatePresence>
            {mobileShowPreview && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="lg:hidden mb-6 border border-border/60 rounded-2xl overflow-x-auto shadow-2xl bg-white"
              >
                {/* Template selector inside mobile view */}
                <div className="p-3 border-b border-border/40 flex items-center justify-between bg-accent/10">
                  <Badge variant="outline" className="font-bold text-primary text-xs px-3">A4 Preview</Badge>
                  <div className="flex gap-2">
                    {Object.values(RESUME_TEMPLATES).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTemplate(t.id)}
                        className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-lg border transition-all",
                          activeTemplate === t.id ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"
                        )}
                      >
                        {t.id.charAt(0).toUpperCase() + t.id.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <div style={{ minWidth: "320px" }}>
                    <ResumePreview values={formValues} user={{ ...user, industry: userIndustry }} templateId={activeTemplate} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop: Tabs — original layout */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden lg:block">
            <TabsList className="bg-accent/30 p-1 rounded-xl mb-6">
              <TabsTrigger value="edit" className="rounded-lg px-8">Build Form</TabsTrigger>
              <TabsTrigger value="preview" className="rounded-lg px-8">Live Preview</TabsTrigger>
            </TabsList>

            {/* ── Edit Tab ── */}
            <TabsContent value="edit" className="space-y-12">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                {/* Contact */}
                <div ref={sectionRefs.contact} className="space-y-6 scroll-mt-32">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Contact Information
                    </h3>
                    <Badge variant="ghost" className="bg-blue-50 text-blue-600 border-none font-bold">Standard</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-2xl bg-slate-50/50 backdrop-blur-sm shadow-inner">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground/70 tracking-wide">Email Address</label>
                      <Input {...register("contactInfo.email")} type="email" placeholder="you@example.com" className="rounded-xl border-primary/10 focus-visible:ring-primary/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground/70 tracking-wide">Mobile Number</label>
                      <Input {...register("contactInfo.mobile")} type="tel" placeholder="+91 98765 43210" className="rounded-xl border-primary/10 focus-visible:ring-primary/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground/70 tracking-wide">LinkedIn Profile</label>
                      <Input {...register("contactInfo.linkedin")} type="url" placeholder="https://linkedin.com/in/profile" className="rounded-xl border-primary/10 focus-visible:ring-primary/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground/70 tracking-wide">Github Profile</label>
                      <Input {...register("contactInfo.github")} type="url" placeholder="https://github.com/handle" className="rounded-xl border-primary/10 focus-visible:ring-primary/20" />
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-100 italic text-sm text-amber-700 font-medium">
                    <Lightbulb className="h-5 w-5 shrink-0 text-amber-500" />
                    {sectionTips.contact}
                  </div>
                </div>

                {/* Summary */}
                <div ref={sectionRefs.summary} className="space-y-6 scroll-mt-32">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Professional Summary
                    </h3>
                  </div>
                  <Controller
                    name="summary"
                    control={control}
                    render={({ field }) => <SummaryForm value={field.value} onChange={field.onChange} />}
                  />
                  <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 italic text-sm text-indigo-700 font-medium">
                    <Lightbulb className="h-5 w-5 shrink-0 text-indigo-500" />
                    {sectionTips.summary}
                  </div>
                </div>

                {/* Skills */}
                <div ref={sectionRefs.skills} className="space-y-6 scroll-mt-32">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-primary" />
                      Technical & Core Skills
                    </h3>
                  </div>
                  <Controller
                    name="skills"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        className="h-32 rounded-2xl border-primary/10 focus-visible:ring-primary/20 resize-none shadow-inner bg-slate-50/50"
                        placeholder="e.g. Next.js, React, Python, Project Management..."
                      />
                    )}
                  />
                  <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 italic text-sm text-blue-700 font-medium">
                    <Lightbulb className="h-5 w-5 shrink-0 text-blue-500" />
                    {sectionTips.skills}
                  </div>
                </div>

                {/* Experience */}
                <div ref={sectionRefs.experience} className="space-y-6 scroll-mt-32">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Work Experience
                    </h3>
                  </div>
                  <Controller
                    name="experience"
                    control={control}
                    render={({ field }) => <EntryForm type="Experience" entries={field.value} onChange={field.onChange} />}
                  />
                  <div className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 italic text-sm text-emerald-700 font-medium">
                    <Lightbulb className="h-5 w-5 shrink-0 text-emerald-500" />
                    {sectionTips.experience}
                  </div>
                </div>

                {/* Education */}
                <div ref={sectionRefs.education} className="space-y-6 scroll-mt-32">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Education
                    </h3>
                  </div>
                  <Controller
                    name="education"
                    control={control}
                    render={({ field }) => <EntryForm type="Education" entries={field.value} onChange={field.onChange} />}
                  />
                  <div className="flex items-start gap-3 p-4 bg-sky-50/50 rounded-2xl border border-sky-100 italic text-sm text-sky-700 font-medium">
                    <Lightbulb className="h-5 w-5 shrink-0 text-sky-500" />
                    {sectionTips.education}
                  </div>
                </div>

                {/* Projects */}
                <div ref={sectionRefs.projects} className="space-y-6 scroll-mt-32">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5 text-primary" />
                      Notable Projects
                    </h3>
                  </div>
                  <Controller
                    name="projects"
                    control={control}
                    render={({ field }) => <EntryForm type="Project" entries={field.value} onChange={field.onChange} />}
                  />
                  <div className="flex items-start gap-3 p-4 bg-violet-50/50 rounded-2xl border border-violet-100 italic text-sm text-violet-700 font-medium">
                    <Lightbulb className="h-5 w-5 shrink-0 text-violet-500" />
                    {sectionTips.projects}
                  </div>
                </div>
              </form>
            </TabsContent>

            {/* ── Preview Tab ── */}
            <TabsContent value="preview" className="space-y-6">
              <div className="flex items-center justify-between bg-accent/20 p-4 rounded-2xl border border-border/50">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-background font-bold text-primary px-3 py-1">A4 Format</Badge>
                  <p className="text-sm text-muted-foreground hidden md:block">Real-time rendering of your professional profile</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-bold bg-background shadow-sm hover:translate-y-[-1px] transition-all"
                  onClick={() => setResumeMode(resumeMode === "preview" ? "edit" : "preview")}
                >
                  {resumeMode === "preview" ? <><Edit className="h-4 w-4 mr-2" />Source Code</> : <><Monitor className="h-4 w-4 mr-2" />Graphical View</>}
                </Button>
              </div>

              {activeTab === "preview" && resumeMode !== "preview" && (
                <div className="flex p-4 gap-3 items-center border border-amber-200 bg-amber-50 text-amber-700 rounded-2xl shadow-sm">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">Warning: Manual edits to the markdown source code will be lost if you update the build form data.</p>
                </div>
              )}

              <div className="border border-border/60 rounded-2xl overflow-hidden shadow-2xl bg-white">
                {resumeMode === "preview" ? (
                  <ResumePreview values={formValues} user={{ ...user, industry: userIndustry }} templateId={activeTemplate} forPDF={false} />
                ) : (
                  <MDEditor
                    value={previewContent}
                    onChange={setPreviewContent}
                    height={800}
                    preview={resumeMode}
                    className="!border-none"
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Mobile: Inline Form (always visible when mobileShowPreview is false) */}
          <div className="lg:hidden space-y-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
              {/* Contact */}
              <div ref={sectionRefs.contact} className="space-y-4 scroll-mt-24">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 p-4 border rounded-2xl bg-slate-50/50 shadow-inner">
                  <Input {...register("contactInfo.email")} type="email" placeholder="Email Address" className="rounded-xl border-primary/10" />
                  <Input {...register("contactInfo.mobile")} type="tel" placeholder="Mobile Number" className="rounded-xl border-primary/10" />
                  <Input {...register("contactInfo.linkedin")} type="url" placeholder="LinkedIn URL" className="rounded-xl border-primary/10" />
                  <Input {...register("contactInfo.github")} type="url" placeholder="GitHub URL" className="rounded-xl border-primary/10" />
                </div>
              </div>

              {/* Summary */}
              <div ref={sectionRefs.summary} className="space-y-4 scroll-mt-24">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <Brain className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Professional Summary</h3>
                </div>
                <Controller name="summary" control={control} render={({ field }) => <SummaryForm value={field.value} onChange={field.onChange} />} />
              </div>

              {/* Skills */}
              <div ref={sectionRefs.skills} className="space-y-4 scroll-mt-24">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <Code2 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Skills</h3>
                </div>
                <Controller name="skills" control={control} render={({ field }) => (
                  <Textarea {...field} className="h-28 rounded-2xl border-primary/10 resize-none bg-slate-50/50" placeholder="Next.js, React, Python..." />
                )} />
              </div>

              {/* Experience */}
              <div ref={sectionRefs.experience} className="space-y-4 scroll-mt-24">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Work Experience</h3>
                </div>
                <Controller name="experience" control={control} render={({ field }) => <EntryForm type="Experience" entries={field.value} onChange={field.onChange} />} />
              </div>

              {/* Education */}
              <div ref={sectionRefs.education} className="space-y-4 scroll-mt-24">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Education</h3>
                </div>
                <Controller name="education" control={control} render={({ field }) => <EntryForm type="Education" entries={field.value} onChange={field.onChange} />} />
              </div>

              {/* Projects */}
              <div ref={sectionRefs.projects} className="space-y-4 scroll-mt-24">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Projects</h3>
                </div>
                <Controller name="projects" control={control} render={({ field }) => <EntryForm type="Project" entries={field.value} onChange={field.onChange} />} />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── ATS Analysis ────────────────────────────────────── */}
      <AnimatePresence>
        {atsAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-12 space-y-8 print:hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="card-premium flex flex-col items-center justify-center p-8 space-y-4">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/20" />
                    <motion.circle
                      cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                      strokeDasharray={440} initial={{ strokeDashoffset: 440 }}
                      animate={{ strokeDashoffset: 440 - (440 * atsAnalysis.score) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="text-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-foreground">{atsAnalysis.score}%</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ATS Score</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground leading-relaxed italic">"{atsAnalysis.summary}"</p>
                </div>
              </Card>

              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="card-premium p-6">
                    <h4 className="flex items-center gap-2 font-bold mb-4 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />Key Strengths
                    </h4>
                    <ul className="space-y-3">
                      {atsAnalysis.strengths?.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />{s}
                        </li>
                      ))}
                    </ul>
                  </Card>
                  <Card className="card-premium p-6">
                    <h4 className="flex items-center gap-2 font-bold mb-4 text-amber-600">
                      <TrendingUp className="h-5 w-5" />Areas for Improvement
                    </h4>
                    <ul className="space-y-3">
                      {atsAnalysis.weaknesses?.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />{w}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>

                <Card className="card-premium p-6">
                  <h4 className="flex items-center gap-2 font-bold mb-4 text-primary">
                    <Brain className="h-5 w-5" />Strategic Suggestions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {atsAnalysis.suggestions?.map((s, i) => (
                      <Badge key={i} variant="outline" className="bg-accent/30 border-primary/10 text-primary/80 py-1 px-3">{s}</Badge>
                    ))}
                  </div>
                </Card>

                {atsAnalysis.missingKeywords?.length > 0 && (
                  <Card className="card-premium p-6 border-destructive/20 bg-destructive/5">
                    <h4 className="flex items-center gap-2 font-bold mb-4 text-destructive">
                      <XCircle className="h-5 w-5" />Critical Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {atsAnalysis.missingKeywords?.map((k, i) => (
                        <Badge key={i} className="bg-destructive/10 text-destructive border-none py-1 px-3">{k}</Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden PDF Export Element — always full A4, never scaled */}
      <div className="absolute left-[-9999px] top-0 pointer-events-none -z-50">
        <div id="resume-pdf">
          <ResumePreview values={formValues} user={{ ...user, industry: userIndustry }} templateId={activeTemplate} forPDF={true} />
        </div>
      </div>

      {/* ── Mobile Bottom Action Bar (hidden on desktop) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-lg border-t border-border/50 px-4 py-3 flex items-center gap-2 print:hidden">
        <Button
          variant="destructive"
          className="flex-1 rounded-xl shadow-lg shadow-destructive/10 text-sm font-bold"
          onClick={handleSubmit(onSubmit)}
          disabled={isSaving}
        >
          {isSaving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
          ) : (
            <><Save className="h-4 w-4 mr-1" />Save</>
          )}
        </Button>

        <Button
          onClick={generatePDF}
          disabled={isGenerating}
          className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-900 transition-all text-sm font-bold"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <><Download className="h-4 w-4 mr-1" />PDF</>
          )}
        </Button>

        <Button
          variant="outline"
          className="flex-1 rounded-xl border-primary/20 text-primary text-sm font-bold"
          onClick={() => setMobileShowPreview(!mobileShowPreview)}
        >
          {mobileShowPreview ? (
            <><Eye className="h-4 w-4 mr-1" />Edit</>
          ) : (
            <><Monitor className="h-4 w-4 mr-1" />Preview</>
          )}
        </Button>
      </div>
    </div>
  );
}
