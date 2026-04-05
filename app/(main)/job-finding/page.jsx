"use client";

import React, { useState, useEffect, useMemo } from "react";
import { jobsData } from "@/data/jobs";
import { industries } from "@/data/industries";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Briefcase, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  XCircle,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserProfile } from "@/actions/user";
import { getNicheRoles, getRecommendedJobs } from "@/actions/jobs";
import { toast } from "sonner";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const JobFindingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [recommendedIds, setRecommendedIds] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);
  const [discoveryStatus, setDiscoveryStatus] = useState("idle"); // idle | loading | success | error
  const [discoveredRoles, setDiscoveredRoles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
        
        if (profile?.industry) {
          const industryMatch = industries.find(
            idx => idx.name.toLowerCase().includes(profile.industry.toLowerCase()) || 
                   profile.industry.toLowerCase().includes(idx.name.toLowerCase())
          );
          if (industryMatch) setSelectedIndustry(industryMatch.id);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchData();
  }, []);

  // AI Discovery Engine - Trigger whenever niche changes
  useEffect(() => {
    const discover = async () => {
      if (!selectedIndustry) {
        setDiscoveredRoles([]);
        return;
      }

      setDiscoveryStatus("loading");
      try {
        const indName = industries.find(i => i.id === selectedIndustry)?.name;
        const res = await getNicheRoles(indName, selectedSubIndustry);
        
        if (res.success) {
          setDiscoveredRoles(res.roles);
          setDiscoveryStatus("success");
        } else {
          setDiscoveryStatus("error");
        }
      } catch (error) {
        setDiscoveryStatus("error");
      }
    };

    discover();
  }, [selectedIndustry, selectedSubIndustry]);

  const subIndustries = useMemo(() => {
    if (!selectedIndustry) return [];
    return industries.find((i) => i.id === selectedIndustry)?.subIndustries || [];
  }, [selectedIndustry]);

  const handleAiRecommendation = async () => {
    setIsAiLoading(true);
    try {
      const result = await getRecommendedJobs();
      if (result.recommendedIds?.length > 0) {
        setRecommendedIds(result.recommendedIds);
        setShowRecommendedOnly(true);
        toast.success("AI is revealing your perfect career paths!");
      } else {
        toast.error("AI couldn't find specific recommendations right now.");
      }
    } catch (error) {
      toast.error("Failed to get AI recommendations.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Merge static jobs with AI discovered roles
  const allAvailableJobs = useMemo(() => {
    return [...jobsData, ...discoveredRoles];
  }, [discoveredRoles]);

  const filteredJobs = useMemo(() => {
    return allAvailableJobs.filter((job) => {
      // 1. AI Recommendation Filter
      if (showRecommendedOnly && recommendedIds.length > 0) {
        if (!recommendedIds.includes(job.id)) return false;
      }

      // 2. Search Query Filter
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills?.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;

      // 3. Industry/Sub-industry Filter (Only apply if NOT in Recommendation Mode)
      if (!showRecommendedOnly) {
          if (selectedSubIndustry) {
            return job.category?.toLowerCase().includes(selectedSubIndustry.toLowerCase()) || 
                   selectedSubIndustry?.toLowerCase().includes(job.category?.toLowerCase());
          }
          
          if (selectedIndustry) {
              const ind = industries.find(i => i.id === selectedIndustry);
              return ind.subIndustries.some(sub => 
                job.category?.toLowerCase().includes(sub.toLowerCase()) || 
                sub.toLowerCase().includes(job.category?.toLowerCase())
              );
          }
      }

      return true;
    });
  }, [searchQuery, selectedIndustry, selectedSubIndustry, recommendedIds, showRecommendedOnly, allAvailableJobs]);

  const clearFilters = () => {
    setSelectedIndustry(null);
    setSelectedSubIndustry(null);
    setSearchQuery("");
    setShowRecommendedOnly(false);
    setDiscoveredRoles([]);
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
      {/* Header section with Hero and Filters overlay */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex flex-col gap-10 mb-16"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <motion.div variants={fadeIn} className="space-y-4 max-w-3xl">
            <Badge
              variant="outline"
              className="px-5 py-1.5 border-primary/20 text-primary bg-accent font-bold tracking-[0.15em] uppercase text-[10px] rounded-full"
            >
              Career Architecture
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] text-foreground leading-[0.95]">
              Find Your <br />
              <span className="gradient-text-hero">Perfect Role.</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
              Discover specialized paths across industries. Use AI to reveal roles that align with your unique DNA and skillsets.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="flex flex-wrap gap-3">
             <Button 
                onClick={handleAiRecommendation} 
                disabled={isAiLoading}
                className="rounded-xl h-12 px-6 bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90 transition-all font-semibold gap-2 border-0 shadow-lg shadow-primary/20"
             >
               {isAiLoading ? (
                 <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 <Sparkles className="h-4 w-4" />
               )}
               {showRecommendedOnly ? "Refresh Discovery" : "Analyze My Profile"}
             </Button>
             
             {showRecommendedOnly && (
                <Button 
                    variant="outline" 
                    onClick={() => setShowRecommendedOnly(false)}
                    className="rounded-xl h-12 border-border/60 hover:bg-muted"
                >
                    All Roles
                </Button>
             )}
          </motion.div>
        </div>

        {/* Filter Bar */}
        <motion.div 
            variants={fadeIn}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 rounded-3xl bg-card border border-border/40 shadow-sm backdrop-blur-sm"
        >
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                    placeholder="Search roles or skills..."
                    className="pl-12 h-12 h-12 rounded-xl bg-muted/30 border-border/40 focus-visible:ring-primary/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <Select value={selectedIndustry} onValueChange={(val) => { setSelectedIndustry(val); setSelectedSubIndustry(null); }}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border/40">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="All Industries" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={null}>All Industries</SelectItem>
                    {industries.map(ind => (
                        <SelectItem key={ind.id} value={ind.id}>{ind.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedSubIndustry} onValueChange={setSelectedSubIndustry} disabled={!selectedIndustry}>
                <SelectTrigger className={`h-12 rounded-xl bg-muted/30 border-border/40 ${discoveryStatus === 'loading' ? 'animate-pulse border-primary/40' : ''}`}>
                    <SelectValue placeholder="Select Niche" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={null}>Entire Domain</SelectItem>
                    {subIndustries.map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="flex items-center gap-2 md:col-start-1 lg:col-start-4">
                {(selectedIndustry || searchQuery || showRecommendedOnly) && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-destructive flex items-center gap-2 h-12 w-full justify-center md:justify-start"
                    >
                        <XCircle className="h-4 w-4" />
                        Clear Filters
                    </Button>
                )}
            </div>
        </motion.div>
      </motion.div>

      {/* Results Header with Status */}
      <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-3">
              <TrendingUp className="h-4 w-4" />
              {discoveryStatus === 'loading' ? (
                <span className="flex items-center gap-2 text-primary animate-pulse">
                    <div className="h-3 w-3 bg-primary rounded-full animate-bounce" />
                    AI Discovering Specialized Roles...
                </span>
              ) : (
                `Total Active Roles: ${filteredJobs.length}`
              )}
          </h2>
      </div>

      {/* Job Cards Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
            {discoveryStatus === 'loading' && filteredJobs.length === 0 ? (
                // Shimmer skeletons
                [1,2,3].map(i => (
                    <motion.div key={i} className="h-[300px] rounded-[1.25rem] bg-muted/10 border-2 border-dashed border-border/20 animate-pulse" />
                ))
            ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
                <JobDialog 
                    key={job.id} 
                    job={job} 
                    isRecommended={recommendedIds.includes(job.id)} 
                    isAiGenerated={discoveredRoles.some(dr => dr.id === job.id)}
                />
            ))
            ) : (
            <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-32 text-center rounded-3xl bg-muted/10 border-2 border-dashed border-border/40"
            >
                <div className="bg-accent h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                Discovery Complete
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                We couldn't find specific active roles for this combination yet. Try a broader industry.
                </p>
                <Button variant="default" onClick={clearFilters} className="rounded-xl">
                Refresh Engine
                </Button>
            </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Extracted for readability
const JobDialog = ({ job, isRecommended, isAiGenerated }) => (
    <Dialog key={job.id}>
        <DialogTrigger asChild>
        <motion.div 
            layout
            variants={fadeIn} 
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="h-full"
        >
            <Card className={`card-premium group cursor-pointer h-full flex flex-col border-border/40 relative shadow-sm hover:shadow-xl transition-all duration-300 ${isRecommended ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
             
             {isRecommended && (
                <div className="absolute -top-3 -right-3 bg-primary text-white p-2 rounded-full shadow-lg z-10 animate-bounce">
                    <Sparkles className="h-4 w-4" />
                </div>
             )}

             {isAiGenerated && !isRecommended && (
                 <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
             )}

            <CardHeader className="p-7 pb-3">
                <div className="flex justify-between items-start mb-4">
                <Badge
                    variant="secondary"
                    className={`${isAiGenerated ? 'bg-indigo-500/10 text-indigo-600' : 'bg-accent text-primary/80'} border-border/30 font-bold tracking-wider text-[10px] uppercase rounded-lg px-2.5 py-1`}
                >
                    {isAiGenerated ? 'Niche Insight' : job.category}
                </Badge>
                <div className={`p-2.5 rounded-xl ${isAiGenerated ? 'bg-indigo-50/50 text-indigo-500' : 'bg-accent text-primary/60'} group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-border/20`}>
                    <Briefcase className="h-5 w-5" />
                </div>
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight leading-tight">
                {job.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-7 pb-5 flex-grow">
                <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed mb-6">
                {job.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                {job.skills?.slice(0, 3).map((skill) => (
                    <Badge
                    key={skill}
                    variant="outline"
                    className="text-[10px] px-2.5 py-1 border-border/40 text-muted-foreground/80 bg-muted/10 rounded-md"
                    >
                    {skill}
                    </Badge>
                ))}
                {(job.skills?.length || 0) > 3 && (
                    <span className="text-[10px] text-muted-foreground/60 self-center font-medium pl-1">
                    +{(job.skills?.length || 0) - 3}
                    </span>
                )}
                </div>
            </CardContent>
            <div className="px-7 py-4 border-t border-border/40 bg-muted/5 group-hover:bg-accent/30 transition-colors flex justify-between items-center text-[10px] font-bold text-primary uppercase tracking-widest rounded-b-[1.25rem]">
                <span>Analysis & Action</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
            </Card>
        </motion.div>
        </DialogTrigger>

        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-border/40 glass shadow-2xl">
        <DialogHeader className="mb-8">
            <div className="flex items-center gap-2 mb-4">
            <Badge
                variant="outline"
                className={`px-4 py-1.5 border-primary/20 ${isAiGenerated ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-primary/5 text-primary'} text-xs rounded-xl font-bold uppercase tracking-widest`}
            >
                {isAiGenerated ? `Discovery: ${job.category}` : job.category}
            </Badge>
            {isRecommended && (
                 <Badge
                    variant="secondary"
                    className="px-4 py-1.5 bg-primary text-white border-none text-xs rounded-xl font-bold uppercase tracking-widest animate-pulse"
                >
                    Profile Match
                </Badge>
            )}
            </div>
            <DialogTitle className="text-4xl font-extrabold text-foreground tracking-tight leading-[1.1]">
            {job.title}
            </DialogTitle>
        </DialogHeader>

        <div className="space-y-10 pb-4">
            <section className="p-7 rounded-[2rem] bg-muted/10 border border-border/20 backdrop-blur-md">
            <h4 className="text-xl font-extrabold mb-4 text-foreground flex items-center gap-3">
                <span className="h-8 w-1.5 bg-primary rounded-full" />
                Strategic Overview
            </h4>
            <p className="text-muted-foreground text-base leading-relaxed">
                {job.description}
            </p>
            </section>

            <div className="grid md:grid-cols-2 gap-10">
            <section>
                <h4 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                    Mission & Impact
                </h4>
                <ul className="space-y-5">
                {job.responsibilities?.map((resp, idx) => (
                    <li
                    key={idx}
                    className="flex items-start gap-4 text-sm text-muted-foreground/90 leading-relaxed font-medium"
                    >
                    <div className="h-2 w-2 rounded-full bg-emerald-500/30 mt-1.5 shrink-0" />
                    {resp}
                    </li>
                ))}
                </ul>
            </section>

            <section className="space-y-12">
                <div>
                <h4 className="text-xl font-bold mb-6 text-foreground flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    Required DNA
                </h4>
                <div className="flex flex-wrap gap-2.5">
                    {job.skills?.map((skill) => (
                    <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-accent/60 text-primary border-primary/5 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider"
                    >
                        {skill}
                    </Badge>
                    ))}
                </div>
                </div>

                <div>
                <h4 className="text-xl font-bold mb-6 text-foreground flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600">
                        <Briefcase className="h-5 w-5" />
                    </div>
                    Modern Toolkit
                </h4>
                <div className="flex flex-wrap gap-2.5">
                    {job.tools?.map((tool) => (
                    <Badge
                        key={tool}
                        variant="outline"
                        className="border-border/60 text-muted-foreground/80 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-white"
                    >
                        {tool}
                    </Badge>
                    ))}
                </div>
                </div>
            </section>
            </div>

            <div className="pt-10 border-t border-border/40 flex flex-col sm:flex-row justify-end gap-3 px-2">
            <Button
                variant="outline"
                className="rounded-[1.25rem] h-14 px-10 border-border/40 hover:bg-muted font-bold text-base transition-all active:scale-95"
                onClick={() =>
                window.open(
                    `https://www.google.com/search?q=${encodeURIComponent(
                    job.title + " jobs"
                    )}`,
                    "_blank"
                )
                }
            >
                Direct Job Search
            </Button>
            <Button
                className="rounded-[1.25rem] h-14 px-10 bg-primary hover:opacity-95 font-bold text-base shadow-2xl shadow-primary/30 transition-all active:scale-95 active:shadow-none"
                onClick={() =>
                window.open(
                    `https://www.youtube.com/results?search_query=how+to+become+a+${encodeURIComponent(
                    job.title
                    )}`,
                    "_blank"
                )
                }
            >
                Launch Roadmap
            </Button>
            </div>
        </div>
        </DialogContent>
    </Dialog>
);

export default JobFindingPage;
