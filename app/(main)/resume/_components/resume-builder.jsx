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
import { EntryForm } from "./entry-form";
import { SummaryForm } from "./summaryform";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/form-lib/helper";
import { resumeSchema } from "@/app/form-lib/schema";
import { motion, AnimatePresence } from "framer-motion";

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
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
    if (contactInfo.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

    return parts.length > 0
      ? `## <div align="center">${user.fullName}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const calculateCompletion = () => {
    let score = 0;
    const points = {
      email: 5,
      mobile: 5,
      linkedin: 10,
      github: 5,
      summary: 15,
      skills: 10,
      experience: 20,
      education: 15,
      projects: 15,
    };

    if (formValues.contactInfo?.email?.trim()) score += points.email;
    if (formValues.contactInfo?.mobile?.trim()) score += points.mobile;
    if (formValues.contactInfo?.linkedin?.trim()) score += points.linkedin;
    if (formValues.contactInfo?.github?.trim()) score += points.github;
    if (formValues.summary?.trim()?.length >= 10) score += points.summary;
    if (formValues.skills?.trim()?.length >= 3) score += points.skills;
    if (formValues.experience?.length > 0) score += points.experience;
    if (formValues.education?.length > 0) score += points.education;
    if (formValues.projects?.length > 0) score += points.projects;

    return score;
  };

  const completion = calculateCompletion();

  const getImprovementTips = () => {
    const tips = [];
    if (!formValues.contactInfo?.email?.trim()) tips.push({ text: "Add Email", pts: "+5%", section: "contact" });
    if (!formValues.contactInfo?.mobile?.trim()) tips.push({ text: "Add Mobile", pts: "+5%", section: "contact" });
    if (!formValues.contactInfo?.linkedin?.trim()) tips.push({ text: "Add LinkedIn", pts: "+10%", section: "contact" });
    if (!formValues.contactInfo?.github?.trim()) tips.push({ text: "Add GitHub", pts: "+5%", section: "contact" });
    if ((formValues.summary?.trim()?.length || 0) < 10) tips.push({ text: "Write Summary", pts: "+15%", section: "summary" });
    if ((formValues.skills?.trim()?.length || 0) < 3) tips.push({ text: "Listing Skills", pts: "+10%", section: "skills" });
    if (formValues.experience?.length === 0) tips.push({ text: "Work History", pts: "+20%", section: "experience" });
    if (formValues.education?.length === 0) tips.push({ text: "Education", pts: "+15%", section: "education" });
    if (formValues.projects?.length === 0) tips.push({ text: "Add Projects", pts: "+15%", section: "projects" });
    return tips.slice(0, 4); // Show up to 4 tips for more clarity
  };

  const improvementTips = getImprovementTips();

  const getStrengthColor = (score) => {
    if (score < 40) return "bg-red-500 shadow-red-500/50";
    if (score < 75) return "bg-amber-500 shadow-amber-500/50";
    return "bg-emerald-500 shadow-emerald-500/50";
  };

  const handleGenerateSummary = async () => {
    const skills = watch("skills");
    const experience = watch("experience");

    if (!skills || experience.length === 0) {
      toast.error("Please add skills and at least one experience to generate a summary");
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const summary = await generateSummary({ skills, experience });
      setValue("summary", summary);
      toast.success("AI Summary generated!");
    } catch (error) {
      toast.error(error.message || "Failed to generate summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const sectionTips = {
    contact: "Keep your contact info professional. Include a LinkedIn URL and a clean email address.",
    summary: "Write 3-4 impactful sentences focusing on your unique value and key achievements.",
    skills: "List 10-15 key skills. Mix technical 'hard' skills with important 'soft' skills.",
    experience: "Use action verbs and quantify results (e.g., 'Increased efficiency by 20%').",
    education: "Include recent degrees, certifications, or major academic achievements.",
    projects: "Showcase your best work. Highlight tech stacks and clear project goals.",
  };

  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  const handleCheckATS = async () => {
    if (!previewContent) {
      toast.error("Please add some content to your resume first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await getATSScore(previewContent);
      setAtsAnalysis(result);
      toast.success("ATS Analysis completed!");
    } catch (error) {
      toast.error(error.message || "Failed to analyze resume");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await saveResumeFn(previewContent);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("resume-pdf");
      if (!element) throw new Error("Resume element not found");

      await new Promise((resolve) => setTimeout(resolve, 500));
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const opt = {
        margin: [15, 15],
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          windowWidth: 1200,
          onclone: (clonedDoc) => {
            const stylesheets = clonedDoc.querySelectorAll("style");
            stylesheets.forEach((sheet) => {
              if (sheet.innerHTML.includes("lab(") || sheet.innerHTML.includes("oklch(")) {
                sheet.innerHTML = sheet.innerHTML
                  .replace(/lab\([^)]+\)/g, "#000000")
                  .replace(/oklch\([^)]+\)/g, "#000000");
              }
            });

            const pdfElement = clonedDoc.getElementById("resume-pdf");
            if (pdfElement) {
              pdfElement.style.background = "#ffffff";
              pdfElement.style.color = "#000000";
              const style = clonedDoc.createElement("style");
              style.innerHTML = `
                #resume-pdf * { color: #000000 !important; background-color: transparent !important; }
                #resume-pdf { background-color: #ffffff !important; color: #000000 !important; }
              `;
              clonedDoc.head.appendChild(style);
            }
          },
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
      toast.success("Resume downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-12 pb-32">
      {/* Header & Main Controls */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 py-4 mb-8 -mx-4 px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
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
        </div>
        <div className="flex flex-wrap justify-center gap-2">
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

          <Button
            variant="destructive"
            className="rounded-xl shadow-lg shadow-destructive/10 btn-premium-glow"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Save Resume</>
            )}
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating} className="rounded-xl bg-slate-800 hover:bg-slate-900 transition-all">
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
            ) : (
              <><Download className="h-4 w-4 mr-2" />PDF Export</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-6">
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

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-accent/30 p-1 rounded-xl mb-6">
              <TabsTrigger value="edit" className="rounded-lg px-8">Build Form</TabsTrigger>
              <TabsTrigger value="preview" className="rounded-lg px-8">Live Preview</TabsTrigger>
            </TabsList>

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
                    {/* ... (keep contact inputs as they are, just updated classes in next step) ... */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground/70 tracking-wide">Primary Email</label>
                      <Input
                        {...register("contactInfo.email")}
                        type="email"
                        placeholder="your@email.com"
                        className="rounded-xl border-primary/10 focus-visible:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground/70 tracking-wide">Personal Mobile</label>
                      <Input
                        {...register("contactInfo.mobile")}
                        type="tel"
                        placeholder="+1 234 567 8900"
                        className="rounded-xl border-primary/10 focus-visible:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground/70 tracking-wide">LinkedIn URL</label>
                      <Input
                        {...register("contactInfo.linkedin")}
                        type="url"
                        placeholder="https://linkedin.com/in/profile"
                        className="rounded-xl border-primary/10 focus-visible:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground/70 tracking-wide">Github Profile</label>
                      <Input
                        {...register("contactInfo.github")}
                        type="url"
                        placeholder="https://github.com/handle"
                        className="rounded-xl border-primary/10 focus-visible:ring-primary/20"
                      />
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
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateSummary}
                      disabled={isGeneratingSummary}
                      className="rounded-xl bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 transition-all font-semibold h-8 text-xs"
                    >
                      {isGeneratingSummary ? (
                        <><Loader2 className="h-3 w-3 mr-2 animate-spin" />Building...</>
                      ) : (
                        <><Sparkles className="h-3 w-3 mr-2" />Generate with AI</>
                      )}
                    </Button>
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

                {/* Work Experience */}
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
                  <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 italic text-sm text-indigo-700 font-medium">
                    <Lightbulb className="h-5 w-5 shrink-0 text-indigo-500" />
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
                <MDEditor
                  value={previewContent}
                  onChange={setPreviewContent}
                  height={800}
                  preview={resumeMode}
                  className="!border-none"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="absolute left-[-9999px] top-0 pointer-events-none -z-50">
        <div id="resume-pdf" className="bg-white p-8 w-[210mm] min-h-[297mm]">
          <MDEditor.Markdown 
            source={previewContent} 
            skipHtml={true}
            style={{ background: "white", color: "black" }} 
          />
        </div>
      </div>

      <AnimatePresence>
        {atsAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-12 space-y-8"
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
                      {atsAnalysis.strengths.map((s, i) => (
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
                      {atsAnalysis.weaknesses.map((w, i) => (
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
                    {atsAnalysis.suggestions.map((s, i) => (
                      <Badge key={i} variant="outline" className="bg-accent/30 border-primary/10 text-primary/80 py-1 px-3">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {atsAnalysis.missingKeywords?.length > 0 && (
                  <Card className="card-premium p-6 border-destructive/20 bg-destructive/5">
                    <h4 className="flex items-center gap-2 font-bold mb-4 text-destructive">
                      <XCircle className="h-5 w-5" />Critical Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {atsAnalysis.missingKeywords.map((k, i) => (
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
    </div>
  );
}
