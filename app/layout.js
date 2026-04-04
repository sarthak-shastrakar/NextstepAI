import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NextStep AI — Your Career Coach",
  description: "Advanced AI-powered career guidance, resume building, and interview preparation.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning={true}>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />

            {/* ── Premium Light Footer ──────────────────────── */}
            <footer className="w-full bg-white border-t border-border/60">
              <div className="container mx-auto px-4 max-w-7xl">

                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pt-16 pb-12">

                  {/* Brand Column */}
                  <div className="space-y-5 lg:col-span-1">
                    <Link
                      href="/"
                      className="text-2xl font-extrabold tracking-tight gradient-title"
                    >
                      NextStep AI
                    </Link>
                    <p className="text-muted-foreground leading-relaxed text-sm max-w-[280px]">
                      Empowering professionals to achieve their true potential
                      through advanced AI guidance, skill building, and interview
                      intelligence.
                    </p>
                  </div>

                  {/* Explore Column */}
                  <div>
                    <h4 className="font-bold text-foreground text-sm uppercase tracking-wider mb-5">
                      Explore
                    </h4>
                    <ul className="space-y-3.5 text-muted-foreground text-sm">
                      <li>
                        <Link
                          href="/dashboard"
                          className="hover:text-primary transition-colors duration-200"
                        >
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/resume"
                          className="hover:text-primary transition-colors duration-200"
                        >
                          Resume Builder
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/interviewprep"
                          className="hover:text-primary transition-colors duration-200"
                        >
                          Interview Prep
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/job-finding"
                          className="hover:text-primary transition-colors duration-200"
                        >
                          Job Search
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Company Column */}
                  <div>
                    <h4 className="font-bold text-foreground text-sm uppercase tracking-wider mb-5">
                      Company
                    </h4>
                    <ul className="space-y-3.5 text-muted-foreground text-sm">
                      <li>
                        <Link href="#" className="hover:text-primary transition-colors duration-200">
                          About Us
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="hover:text-primary transition-colors duration-200">
                          Privacy Policy
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="hover:text-primary transition-colors duration-200">
                          Terms of Service
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Support Column */}
                  <div className="space-y-5">
                    <h4 className="font-bold text-foreground text-sm uppercase tracking-wider mb-5">
                      Support
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Need help with our platform? Our team is here to guide you.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-border hover:bg-accent hover:text-accent-foreground transition-all"
                    >
                      Contact Support
                    </Button>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-6 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                  <p>© 2026 NextStep AI Assistant. All rights reserved.</p>
                  <div className="flex gap-6 items-center">
                    <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground/70">
                      Final Year Project 2026
                    </span>
                  </div>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
