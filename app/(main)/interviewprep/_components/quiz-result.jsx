"use client";

import { Trophy, CheckCircle2, XCircle, ArrowRight, Zap, Target, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  if (!result) return null;

  const isBehavioral = result.category === "Behavioral";

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 space-y-4"
      >
        <div className="inline-flex p-4 bg-yellow-500/10 rounded-3xl border border-yellow-500/20 mb-4 shadow-[0_0_30px_rgba(234,179,8,0.2)] animate-floating">
          <Trophy className="h-10 w-10 text-yellow-500" />
        </div>


        <h1 className="text-4xl font-black gradient-title tracking-tight">
          {isBehavioral ? "STAR Protocol Verified" : "Performance Verified"}
        </h1>
        <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.3em]">
          {isBehavioral ? "Behavioral Analysis Complete" : "Evaluation Complete"}
        </p>
      </motion.div>

      <CardContent className="space-y-12">
        {/* Score Overview - Premium Gauge Style */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center p-12 glass-sapphire-strong rounded-[3rem] border border-white/20 shadow-2xl relative overflow-hidden gradient-border"
        >

          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80" cy="80" r="70"
                stroke="currentColor" strokeWidth="12"
                fill="transparent"
                className="text-muted/10"
              />
              <motion.circle
                cx="80" cy="80" r="70"
                stroke={result.quizScore >= 70 ? "#10B981" : result.quizScore >= 40 ? "#F59E0B" : "#EF4444"}
                strokeWidth={12}
                fill="transparent"
                strokeDasharray="439.8"
                initial={{ strokeDashoffset: 439.8 }}
                animate={{ strokeDashoffset: 439.8 - (439.8 * result.quizScore) / 100 }}
                transition={{ duration: 2, ease: "circOut" }}
                strokeLinecap="round"
                className="drop-shadow-[0_0_12px_rgba(79,70,229,0.4)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black tracking-tighter text-foreground">{result.quizScore.toFixed(0)}%</span>
              <span className="text-[10px] font-black uppercase text-muted-foreground/40">Mastery</span>
            </div>
          </div>
          <p className="text-sm font-black text-muted-foreground uppercase tracking-widest text-center">
            {isBehavioral ? "STAR Alignment Score" : "Aggregate Technical Score"}
          </p>
        </motion.div>

        {/* Improvement Tip - 3D Sapphire Glass */}
        {result.improvementTip && (
          <motion.div 
            whileHover={{ y: -5, perspective: 1000, rotateX: 2 }}
            className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 flex gap-6 items-start shadow-xl relative overflow-hidden group"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
                <Zap className="h-6 w-6 text-primary fill-primary/20" />
             </div>
             <div className="space-y-2 relative z-10">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Strategic Pivot</p>
                <p className="text-base font-bold text-slate-800 leading-relaxed italic">"{result.improvementTip}"</p>
             </div>
          </motion.div>
        )}

        {/* Questions Review */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4 pb-4 border-b border-border/40">
             <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-muted-foreground/40" />
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                    {isBehavioral ? "STAR Breakdown archive" : "Question review archive"}
                </h3>
             </div>
             <Badge variant="outline" className="text-[9px] font-black">{isBehavioral ? "STAR PROTOCOL" : "TECHNICAL v2"}</Badge>
          </div>
          
          <div className="grid gap-8">
            {result.questions.map((q, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-[2.5rem] p-10 space-y-8 transition-all shadow-sm hover:shadow-xl glass-sapphire ${
                    !isBehavioral && q.isCorrect ? "bg-emerald-500/5 border-emerald-500/20" : !isBehavioral ? "bg-red-500/5 border-red-500/20" : "border-primary/20"
                }`}
              >

                <div className="flex flex-col gap-6">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Question {index + 1}</p>
                     <p className="text-xl font-black text-foreground leading-tight tracking-tight">{q.question}</p>
                  </div>
                  
                  {!isBehavioral ? (
                     <div className="flex items-center gap-4">
                        {q.isCorrect ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                <CheckCircle2 className="h-3 w-3" /> Correct
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black text-red-600 uppercase tracking-widest">
                                <XCircle className="h-3 w-3" /> Incorrect
                            </div>
                        )}
                     </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                         {Object.entries(q.evaluation.scores).map(([key, score]) => (
                             <div key={key} className="p-4 bg-white/60 rounded-2xl border border-border/40 flex flex-col items-center gap-1 shadow-sm">
                                 <span className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-tighter">{key}</span>
                                 <div className="flex gap-0.5">
                                     {[1, 2, 3, 4, 5].map(s => (
                                         <div key={s} className={`h-1.5 w-1.5 rounded-full ${s <= score ? "bg-primary" : "bg-muted/30"}`} />
                                     ))}
                                 </div>
                             </div>
                         ))}
                    </div>
                  )}
                </div>

                {isBehavioral ? (
                    <div className="space-y-6">
                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Star className="h-3 w-3 fill-primary" /> Overall Assessment
                            </p>
                            <p className="text-sm font-bold text-slate-800 leading-relaxed italic">{q.evaluation.feedback}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(q.evaluation.analysis).map(([key, feedback]) => (
                                <div key={key} className="p-5 bg-white/60 rounded-2xl border border-border/40 space-y-2">
                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em]">{key} Analysis</p>
                                    <p className="text-xs font-semibold text-slate-600 leading-relaxed">{feedback}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/60 rounded-2xl border border-border/40">
                        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Your Submission</p>
                        <p className={`text-sm font-bold ${q.isCorrect ? "text-emerald-600" : "text-red-500"}`}>{q.userAnswer}</p>
                      </div>
                      {!q.isCorrect && (
                        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                          <p className="text-[9px] font-black text-emerald-600/40 uppercase tracking-widest mb-1">Market Standard</p>
                          <p className="text-sm font-bold text-emerald-600">{q.answer}</p>
                        </div>
                      )}
                    </div>
                )}

                {!isBehavioral && (
                    <div className="p-6 bg-white/40 rounded-2xl border border-dashed border-border/60">
                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-2">Technical Insight</p>
                        <p className="text-xs font-bold text-slate-600 leading-relaxed italic">{q.explanation}</p>
                    </div>
                )}
                
                {isBehavioral && (
                   <div className="p-6 bg-white/60 rounded-2xl border border-border/40 shadow-inner">
                        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <MessageSquare className="h-3 w-3" /> Transcribed Protocol Answer
                        </p>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                            {q.userAnswer}
                        </p>
                   </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>

      {!hideStartNew && (
        <CardFooter className="pt-8 pb-20">
          <Button 
            onClick={onStartNew} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-primary/30 transition-all active:scale-95 group"
          >
            Re-Initialize Mock Session
            <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardFooter>
      )}
    </div>
  );
}

// Internal Badge replacement if not globally available
function Badge({ children, variant, className }) {
  return (
    <span className={`px-2 py-1 rounded-lg border border-border/40 bg-white/40 backdrop-blur-sm shadow-sm ${className}`}>
      {children}
    </span>
  );
}