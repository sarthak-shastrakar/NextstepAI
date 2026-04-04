"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useAnimation, useMotionValue, useTransform, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Star } from "lucide-react";
import Herosection from "@/components/Herosection";
import { features } from "@/data/features";
import { howItWorks } from "@/data/howItWorks";
import { testimonial } from "@/data/testimonial";
import { faqs } from "@/data/faqs";

const CountUp = ({ to, suffix = "", duration = 2 }) => {
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest) + suffix);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, to, { duration });
      return controls.stop;
    }
  }, [isInView, count, to, duration]);

  return <motion.span ref={nodeRef}>{rounded}</motion.span>;
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Herosection />

      {/* ═══ Stats Section ═══════════════════════════════ */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="w-full py-16 bg-white border-y border-border/40"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 max-w-5xl mx-auto">
            {[
              { value: 25, suffix: "+", label: "Industries" },
              { value: 1000, suffix: "+", label: "Questions" },
              { value: 95, suffix: "%", label: "Success Rate" },
              { value: 24, suffix: "/7", label: "AI Support" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center space-y-2 text-center">
                <h3 className="text-4xl md:text-5xl font-extrabold gradient-title tracking-tighter">
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ Features Section ═══════════════════════════════ */}
      <section className="w-full py-24 md:py-32 section-primary relative">
        {/* Decorative blob */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] blob-primary rounded-full -z-10" />
        
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16 space-y-5"
          >
            <Badge variant="outline" className="px-5 py-1.5 border-primary/20 text-primary bg-accent font-bold tracking-[0.15em] uppercase text-[10px] rounded-full">
              Capabilities
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-foreground leading-tight">
              Smarter tools for the <br className="hidden md:block" /> modern career.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              A comprehensive suite of AI agents designed to navigate every stage of your professional journey.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeIn} whileHover={{ y: -6 }} className="transition-all duration-300">
                <Card className="card-premium group h-full p-1">
                  <CardContent className="p-7 flex flex-col items-start text-left h-full">
                    <div className="feature-icon-box mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Steps / How It Works Section ═══════════════ */}
      <section className="w-full py-24 md:py-32 section-alt">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16 space-y-5"
          >
            <Badge variant="outline" className="px-5 py-1.5 border-primary/20 text-primary bg-accent font-bold tracking-[0.15em] uppercase text-[10px] rounded-full">
              Methodology
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-foreground">How it works.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              A streamlined four-step process to accelerate your professional growth.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto relative"
          >
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-[60px] left-[10%] w-[80%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent z-0" />
            
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center text-center space-y-6 relative z-10"
              >
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.08, rotate: 3 }}
                    className="w-[88px] h-[88px] rounded-3xl bg-white border border-border/60 flex items-center justify-center text-primary shadow-sm transition-all duration-400"
                  >
                    {item.icon}
                  </motion.div>
                  <div className="step-number absolute -top-2 -right-2">
                    {index + 1}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-xl text-foreground tracking-tight">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-[260px] mx-auto text-sm">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Testimonials Section ═══════════════════════ */}
      <section className="w-full py-24 md:py-32 section-primary">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16 space-y-5"
          >
            <Badge variant="outline" className="px-5 py-1.5 border-primary/20 text-primary bg-accent font-bold tracking-[0.15em] uppercase text-[10px] rounded-full">
              Proof of Impact
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-foreground">Success Stories.</h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {testimonial.map((testimonial, index) => (
              <motion.div key={index} variants={fadeIn} whileHover={{ y: -6 }} className="transition-all duration-300">
                <Card className="card-premium group h-full">
                  <CardContent className="p-8 space-y-6 flex flex-col justify-between h-full">
                    <div className="space-y-5">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <blockquote className="text-foreground/90 italic text-lg leading-relaxed">
                        &quot;{testimonial.quote}&quot;
                      </blockquote>
                    </div>
                    <div className="flex items-center space-x-4 pt-5 border-t border-border/50">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.author}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-primary/10 object-cover"
                      />
                      <div>
                        <p className="font-bold text-foreground text-base tracking-tight">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role} at {testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ FAQ Section ═══════════════════════════════ */}
      <section className="w-full py-24 md:py-32 section-alt">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16 space-y-5"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-foreground">Common Questions.</h2>
            <p className="text-muted-foreground text-lg">Everything you need to know about the NextStep ecosystem.</p>
          </motion.div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="border border-border/60 rounded-2xl px-6 bg-white hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline py-6 text-foreground tracking-tight">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══ CTA Section ═══════════════════════════════ */}
      <section className="relative w-full py-24 md:py-32 overflow-hidden section-accent flex items-center">
        {/* Animated Decorative Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full blob-primary animate-mesh opacity-60" />
          <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full blob-secondary animate-mesh opacity-40 [animation-delay:-5s]" />
        </div>

        <div className="relative z-20 w-full px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Badge variant="outline" className="px-5 py-1.5 border-primary/20 text-primary bg-white/70 font-bold tracking-[0.2em] uppercase text-[10px] rounded-full backdrop-blur-sm">
                  Evolutionary Leap
                </Badge>
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-foreground leading-[1.1]">
                Scale Your <br />
                <span className="gradient-text-hero italic">Professional Future.</span>
              </h2>
              
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
              >
                Join a global network of elite professionals leveraging <br className="hidden md:block" />
                advanced AI to architect their professional legacy.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex justify-center items-center pt-2"
            >
              <Link href="/dashboard" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="btn-premium-glow relative h-14 px-10 text-lg font-bold rounded-2xl border-none w-full sm:w-auto"
                  >
                    Enter NextStep
                    <ArrowRight className="ml-2.5 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Shimmer Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-shimmer-slow" />
        </div>
      </section>
    </main>
  );
}
