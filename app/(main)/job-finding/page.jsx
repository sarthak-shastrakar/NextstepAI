"use client";

import React, { useState } from "react";
import { jobsData } from "@/data/jobs";
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
import { Button } from "@/components/ui/button";
import { Search, Briefcase, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

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

  const filteredJobs = jobsData.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex flex-col gap-8 mb-16"
      >
        <motion.div variants={fadeIn} className="space-y-4 max-w-4xl">
          <Badge
            variant="outline"
            className="px-5 py-1.5 border-primary/20 text-primary bg-accent font-bold tracking-[0.15em] uppercase text-[10px] rounded-full"
          >
            Ecosystem Explorer
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] text-foreground leading-[0.95]">
            Modern IT <br />
            <span className="gradient-text-hero">Career Paths.</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl leading-relaxed">
            Explore 50+ specialized domains in the global technology sector and
            architect your next professional evolution.
          </p>
        </motion.div>

        <motion.div variants={fadeIn} className="relative max-w-2xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search roles, skillsets, or categories..."
            className="pl-12 h-14 text-base rounded-xl bg-white border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary/40 shadow-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>
      </motion.div>

      {/* Job Cards Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Dialog key={job.id}>
              <DialogTrigger asChild>
                <motion.div variants={fadeIn} whileHover={{ y: -4 }}>
                  <Card className="card-premium group cursor-pointer h-full flex flex-col">
                    <CardHeader className="p-7 pb-3">
                      <div className="flex justify-between items-start mb-4">
                        <Badge
                          variant="secondary"
                          className="bg-accent text-primary/80 border-border/30 font-semibold tracking-wider text-[10px] uppercase rounded-lg"
                        >
                          {job.category}
                        </Badge>
                        <div className="p-2 rounded-xl bg-accent text-primary/60 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                          <Briefcase className="h-4 w-4" />
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                        {job.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-7 pb-5 flex-grow">
                      <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed mb-5">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {job.skills.slice(0, 3).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-[10px] px-2 py-0.5 border-border/60 text-muted-foreground bg-muted/30 rounded-md"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="text-[10px] text-muted-foreground/60 self-center font-medium">
                            +{job.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <div className="px-7 py-4 border-t border-border/40 bg-muted/20 group-hover:bg-accent transition-colors flex justify-between items-center text-xs font-bold text-primary uppercase tracking-widest rounded-b-[1.25rem]">
                      Role Intelligence
                      <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </motion.div>
              </DialogTrigger>

              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="px-3 py-1 border-primary/20 bg-accent text-primary rounded-lg"
                    >
                      {job.category}
                    </Badge>
                  </div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    {job.title}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-8">
                  <section>
                    <h4 className="text-lg font-semibold mb-3 text-foreground">
                      About the Role
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {job.description}
                    </p>
                  </section>

                  <div className="grid md:grid-cols-2 gap-8">
                    <section>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        Key Responsibilities
                      </h4>
                      <ul className="space-y-3">
                        {job.responsibilities.map((resp, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-sm text-muted-foreground"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mt-2 shrink-0" />
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="space-y-8">
                      <div>
                        <h4 className="text-lg font-semibold mb-4 text-foreground">
                          Core Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="bg-accent text-primary border-primary/10"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold mb-4 text-foreground">
                          Common Tools
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {job.tools.map((tool) => (
                            <Badge
                              key={tool}
                              variant="outline"
                              className="border-border/60 text-muted-foreground"
                            >
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="pt-6 border-t border-border/40 flex justify-end gap-3">
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(
                            job.title + " jobs"
                          )}`,
                          "_blank"
                        )
                      }
                    >
                      Find Open Positions
                    </Button>
                    <Button
                      className="rounded-xl"
                      onClick={() =>
                        window.open(
                          `https://www.youtube.com/results?search_query=how+to+become+a+${encodeURIComponent(
                            job.title
                          )}`,
                          "_blank"
                        )
                      }
                    >
                      Learning Path
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              No roles found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria.
            </p>
            <Button
              variant="link"
              onClick={() => setSearchQuery("")}
              className="mt-4 text-primary"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default JobFindingPage;
