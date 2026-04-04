import React from "react";
import Link from "next/link";
import Image from "next/image";
import HeaderAuth from "./HeaderAuth";

const Header = async () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <nav className="container mx-auto px-4 flex h-16 items-center justify-between max-w-7xl">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/NextStepAIDesign.png"
            alt="NextStep AI — Career Coach"
            width={160}
            height={160}
            className="h-12 w-auto py-0.5"
          />
        </Link>

        <HeaderAuth />
      </nav>
    </header>
  );
};

export default Header;
