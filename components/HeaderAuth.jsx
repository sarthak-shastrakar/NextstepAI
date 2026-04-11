"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  LayoutDashboard,
  StarIcon,
  ChevronDown,
  FileText,
  NotebookPen,
  GraduationCap,
  Briefcase,
  Menu,
  X,
  ArrowLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function HeaderAuth() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const careerTools = [
    { href: "/resume", label: "Resume Builder", icon: FileText, desc: "Create ATS-ready resumes" },
    { href: "/cover-letter", label: "Cover Letter", icon: NotebookPen, desc: "AI-powered letter writing" },
  ];

  const prepTools = [
    { href: "/interviewprep", label: "Interview Prep", icon: GraduationCap, desc: "Mock interviews & feedback" },
    { href: "/job-finding", label: "Explore Jobs", icon: Briefcase, desc: "Find your next career move" },
  ];

  const landingLinks = [
    { href: "/#features", label: "Features", icon: StarIcon },
    { href: "/#howitworks", label: "How It Works", icon: GraduationCap },
    { href: "/#testimonial", label: "Testimonials", icon: LayoutDashboard },
    { href: "/#faq", label: "FAQ", icon: StarIcon },
  ];

  const navLinks = [...careerTools, ...prepTools];

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: 20 }
  };

  return (
    <div className="flex items-center">
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-3">
        <SignedIn>
          <Link href="/dashboard" passHref>
            <Button
              variant="ghost"
              className="cursor-pointer text-foreground/80 hover:text-foreground hover:bg-accent transition-all font-medium"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              <span>Industry Insight</span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-sm">
                <StarIcon className="h-4 w-4 mr-2" />
                <span>Career Boost</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 rounded-xl shadow-lg border-border/60 bg-white p-1.5"
            >
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 cursor-pointer w-full px-3 py-2.5 rounded-lg text-foreground/80 hover:text-foreground hover:bg-accent transition-all"
                  >
                    <link.icon className="h-4 w-4 text-primary" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 border-2 border-primary/20 rounded-full",
                userButtonPopoverCard: "shadow-xl border border-border rounded-xl",
              },
            }}
            afterSignOutUrl="/"
          />
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <Button className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-sm px-6">
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
      </div>

      {/* Mobile Navigation Toggle */}
      <div className="lg:hidden flex items-center space-x-3">
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
            afterSignOutUrl="/"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-foreground relative z-[100]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isMobileMenuOpen ? "close" : "open"}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.div>
            </AnimatePresence>
          </Button>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="outline" size="sm" className="rounded-lg font-medium">
              Sign In
            </Button>
          </SignInButton>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative z-[100]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isMobileMenuOpen ? "close" : "open"}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.div>
            </AnimatePresence>
          </Button>
        </SignedOut>
      </div>

      {/* Premium Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            />

            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed right-0 top-0 h-[100dvh] w-[340px] z-[999] bg-white lg:hidden shadow-[-40px_0_100px_rgba(0,0,0,0.1)] flex flex-col border-l border-border/50 text-slate-950 overflow-hidden"
            >
              {/* Ultra-Premium Animated Background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Shifting Gradient Overlay */}
                <motion.div 
                  animate={{
                    background: [
                      "radial-gradient(circle at 0% 0%, rgba(79, 70, 229, 0.03) 0%, transparent 50%)",
                      "radial-gradient(circle at 100% 100%, rgba(79, 70, 229, 0.03) 0%, transparent 50%)",
                      "radial-gradient(circle at 0% 100%, rgba(79, 70, 229, 0.03) 0%, transparent 50%)",
                      "radial-gradient(circle at 100% 0%, rgba(79, 70, 229, 0.03) 0%, transparent 50%)",
                    ]
                  }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                />

                <motion.div
                  animate={{
                    x: [0, 60, -20, 0],
                    y: [0, 80, 20, 0],
                    rotate: [0, 180, 0],
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"
                />
                <motion.div
                  animate={{
                    x: [0, -60, 20, 0],
                    y: [0, -80, -20, 0],
                    rotate: [0, -180, 0],
                  }}
                  transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-[120px]"
                />
              </div>

              <div className="flex flex-col h-full relative z-20">
                {/* Sidebar Header - Enhanced Back Action */}
                <div className="flex items-center justify-between p-6 pb-2 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                   <motion.button 
                    variants={itemVariants}
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-slate-900 font-black uppercase tracking-widest text-[10px] py-2 group cursor-pointer"
                  >
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                      <ArrowLeft className="h-4 w-4" />
                    </div>
                    <span>Close Menu</span>
                  </motion.button>
                  
                  <motion.div variants={itemVariants}>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5">
                      NextStep AI
                    </Badge>
                  </motion.div>
                </div>

                <div className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar px-8 pt-8 pb-12">
                  <div className="space-y-12">
                    <SignedIn>
                      {/* Dashboard / Control Center Card */}
                      <motion.div variants={itemVariants}>
                        <Link
                          href="/dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block group"
                        >
                          <div className="relative p-6 rounded-[2rem] bg-slate-900 text-white overflow-hidden shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-10 -mt-10 blur-3xl opacity-50" />
                            <div className="relative z-10 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                  <LayoutDashboard className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <p className="font-extrabold text-xl tracking-tight leading-tight">Dashboard</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Industry Pulse</p>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>

                      {/* Tool Categories */}
                      <div className="space-y-10 px-1">
                        {/* Section 1: Creation */}
                        <div className="space-y-5">
                          <motion.h4 variants={itemVariants} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 flex items-center gap-3">
                            <span>Creation Suite</span>
                            <div className="h-[1px] flex-grow bg-slate-100" />
                          </motion.h4>
                          <div className="grid gap-2">
                            {careerTools.map((tool) => (
                              <motion.div key={tool.href} variants={itemVariants}>
                                <Link
                                  href={tool.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group active:scale-[0.98]"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-900 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm border border-slate-200 group-hover:border-primary">
                                      <tool.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-slate-950 tracking-tight transition-colors group-hover:text-primary">{tool.label}</p>
                                      <p className="text-[10px] text-slate-600 font-bold leading-tight">{tool.desc}</p>
                                    </div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Section 2: Strategy */}
                        <div className="space-y-5">
                          <motion.h4 variants={itemVariants} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 flex items-center gap-3">
                            <span>Strategy & Flow</span>
                            <div className="h-[1px] flex-grow bg-slate-100" />
                          </motion.h4>
                          <div className="grid gap-2">
                            {prepTools.map((tool) => (
                              <motion.div key={tool.href} variants={itemVariants}>
                                <Link
                                  href={tool.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group active:scale-[0.98]"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-900 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm border border-slate-200 group-hover:border-primary">
                                      <tool.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-slate-950 tracking-tight transition-colors group-hover:text-primary">{tool.label}</p>
                                      <p className="text-[10px] text-slate-600 font-bold leading-tight">{tool.desc}</p>
                                    </div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </SignedIn>

                    <SignedOut>
                      <div className="space-y-10">
                        {/* Landing Content */}
                        <div className="space-y-5">
                          <motion.h4 variants={itemVariants} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 flex items-center gap-3">
                            <span>Platform Map</span>
                            <div className="h-[1px] flex-grow bg-slate-100" />
                          </motion.h4>
                          <div className="grid gap-1 px-1">
                            {landingLinks.map((link) => (
                              <motion.div key={link.href} variants={itemVariants}>
                                <Link
                                  href={link.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all text-slate-900 font-black group active:scale-[0.98] border border-transparent hover:border-slate-200"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-900 group-hover:bg-primary/10 group-hover:text-primary transition-colors border border-slate-200 group-hover:border-primary/20">
                                    <link.icon className="h-4 w-4" />
                                  </div>
                                  <span className="text-[16px] tracking-tight group-hover:text-primary transition-colors">{link.label}</span>
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Premium CTA */}
                        <motion.div variants={itemVariants} className="pt-8">
                          <SignInButton mode="modal">
                            <Button
                              className="w-full h-20 text-lg rounded-[2.5rem] font-black bg-primary text-white shadow-2xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.96] flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <span>Step Into Success</span>
                              <span className="text-[9px] font-bold opacity-70 uppercase tracking-[0.2em]">Start Your Trial</span>
                            </Button>
                          </SignInButton>
                        </motion.div>
                      </div>
                    </SignedOut>
                  </div>
                </div>

                {/* Sidebar Footer - User Session Details */}
                <div className="p-8 border-t border-slate-100 bg-slate-50/50 backdrop-blur-md">
                   <SignedIn>
                      <motion.div variants={itemVariants} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="p-0.5 rounded-full border border-primary/20">
                               <UserButton 
                                  appearance={{ elements: { avatarBox: "h-11 w-11" } }} 
                               />
                            </div>
                            <div>
                               <p className="text-xs font-black text-slate-900 leading-none mb-1.5 uppercase tracking-tighter">My Account</p>
                               <Badge variant="secondary" className="text-[8px] font-black py-0 h-4 bg-primary text-white border-none shadow-sm">PREMIUM</Badge>
                            </div>
                         </div>
                         <Button variant="ghost" size="icon" className="h-11 w-11 text-slate-300 hover:text-red-500 rounded-xl transition-colors cursor-pointer">
                            <LogOut className="h-5 w-5" />
                         </Button>
                      </motion.div>
                   </SignedIn>
                   
                   <SignedOut>
                      <motion.div variants={itemVariants} className="flex items-center gap-4 text-slate-400">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                          <StarIcon className="h-6 w-6 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">NextStep v1.2</p>
                          <p className="text-[10px] font-bold text-slate-400 leading-none">Powered by Intellect AI</p>
                        </div>
                      </motion.div>
                   </SignedOut>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
