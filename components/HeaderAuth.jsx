"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function HeaderAuth() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const navLinks = [
    { href: "/resume", label: "Build Resume", icon: FileText },
    { href: "/cover-letter", label: "Cover Letter", icon: NotebookPen },
    { href: "/interviewprep", label: "Interview Prep", icon: GraduationCap },
    { href: "/job-finding", label: "Explore Jobs", icon: Briefcase },
  ];

  return (
    <div className="flex items-center">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-3">
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
      <div className="md:hidden flex items-center space-x-3">
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
            className="text-foreground"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </SignedOut>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-white/95 backdrop-blur-xl transition-all duration-300 md:hidden",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col h-full p-6 pt-20 space-y-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-foreground"
          >
            <X className="h-6 w-6" />
          </Button>

          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl font-extrabold gradient-title mb-8 tracking-tight"
          >
            NextStep AI
          </Link>

          <SignedIn>
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 p-4 rounded-xl bg-accent text-primary font-semibold border border-primary/10 shadow-sm"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard (Insights)</span>
            </Link>

            <div className="pt-6 pb-2 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-2">
              Career Tools
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-accent transition-all duration-200 border border-transparent hover:border-border/50 text-foreground/80 hover:text-foreground"
              >
                <link.icon className="h-5 w-5 text-primary/70" />
                <span className="text-lg font-medium">{link.label}</span>
              </Link>
            ))}
          </SignedIn>

          <SignedOut>
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-accent transition-colors"
            >
              <StarIcon className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-medium">Home</span>
            </Link>
            <SignInButton mode="modal">
              <Button
                className="w-full h-12 text-lg mt-4 rounded-xl font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In to Start
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </div>
  );
}
