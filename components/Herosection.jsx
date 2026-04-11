"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useAnimation, useMotionValue, useSpring, useTransform } from "framer-motion";

const Herosection = () => {
  const imageRef = useRef(null);
  const isInView = useInView(imageRef, { once: true, margin: "-100px" });
  const controls = useAnimation();

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 100, damping: 30 };
  const xSpring = useSpring(mouseX, springConfig);
  const ySpring = useSpring(mouseY, springConfig);

  const rotateX = useTransform(ySpring, [-300, 300], [5, -5]);
  const rotateY = useTransform(xSpring, [-300, 300], [-5, 5]);

  const statsX = useTransform(xSpring, [-300, 300], [15, -15]);
  const statsY = useTransform(ySpring, [-300, 300], [15, -15]);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set(clientX - innerWidth / 2);
      mouseY.set(clientY - innerHeight / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isInView, controls, mouseX, mouseY]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  return (
    <section className="relative w-full py-20 md:py-36 px-4 overflow-hidden bg-gradient-to-b from-[#FAFBFC] via-[#F1F5FF] to-[#FAFBFC]">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-[700px] h-[700px] rounded-full blob-primary -z-10 animate-mesh" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[500px] h-[500px] rounded-full blob-secondary -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blob-accent -z-10" />

      <div className="container mx-auto max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center space-y-8 md:space-y-10"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2.5 px-4 md:px-5 py-2 rounded-full bg-white border border-border/60 shadow-sm text-primary text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              The Future of Career Growth
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div variants={itemVariants} className="space-y-4 md:space-y-6 max-w-5xl mx-auto px-2">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-[-0.04em] leading-[1.1] md:leading-[0.95] text-foreground">
              Elevate Your Career with
              <span className="block mt-2 md:mt-3 gradient-text-hero">
                NextStep AI
              </span>
            </h1>

            <p className="mx-auto max-w-[720px] text-base md:text-xl text-muted-foreground leading-relaxed tracking-tight px-4">
              Master your industry with AI-driven insights, personalized resume
              building, and real-world interview preparation tailored for the
              modern professional.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex justify-center w-full pt-2">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="btn-premium-glow h-14 px-10 text-lg font-bold rounded-2xl cursor-pointer w-full sm:w-auto"
                >
                  Start Journey Free
                  <ArrowRight className="ml-2.5 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Hero Image Container */}
          <motion.div
            ref={imageRef}
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={controls}
            variants={{
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                  duration: 1,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.5,
                },
              },
            }}
            style={{ rotateX, rotateY, perspective: 1200 }}
            className="relative w-full max-w-5xl mx-auto mt-12 group"
          >
            {/* Gradient border glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10 rounded-[2rem] blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="hero-image-wrapper">
              <Image
                src="/light-hero.png"
                alt="NextStep AI Dashboard Preview"
                width={1400}
                height={800}
                priority
                className="w-full h-auto object-cover"
              />
              {/* Bottom fade */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FAFBFC] to-transparent" />
            </div>
            
            {/* Floating Stats — Left */}
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              style={{ x: statsX, y: statsY }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 hidden lg:flex items-center gap-3.5 p-5 stat-badge z-20"
            >
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="font-extrabold text-foreground text-lg leading-tight">98%</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Accuracy</p>
              </div>
            </motion.div>

            {/* Floating Stats — Right */}
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              style={{ x: statsX, y: statsY }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-32 -right-8 hidden lg:flex items-center gap-3.5 p-5 stat-badge z-20"
            >
              <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-extrabold text-foreground text-lg leading-tight">Adaptive</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Real-time learning</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Herosection;
