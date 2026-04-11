"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Trash2, Loader2, Quote, Star } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

const ReviewCard = ({ review, currentUserId, onDelete }) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const isOwner = currentUserId && review.clerkUserId === currentUserId;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this success story?")) {
      setIsDeleting(true);
      try {
        await onDelete(review.id);
        toast.success("Review deleted successfully");
      } catch (error) {
        toast.error("Failed to delete review");
        setIsDeleting(false);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ y: -10, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full relative"
    >
      <Card className="w-full h-full min-h-[260px] relative group overflow-hidden border border-slate-100 bg-white transition-all duration-500 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_100px_-20px_rgba(79,70,229,0.18)] rounded-[2.5rem]">
        
        {/* Subliminal Shine - Moves across the card on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

        {/* Soft Background Auras */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/10 transition-colors duration-1000" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-400/5 rounded-full blur-[100px] group-hover:bg-blue-400/10 transition-colors duration-1000" />

        {/* Thin Premium Shimmer at top */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <CardContent className="p-10 h-full flex flex-col justify-between relative z-20">
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.3, rotate: 15 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        i < (review.rating || 5)
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                          : "text-slate-200"
                      }`}
                    />
                  </motion.div>
                ))}
              </div>

              {isOwner ? (
                <motion.button
                  whileHover={{ scale: 1.15, rotate: 90, backgroundColor: "#fef2f2" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-10 w-10 rounded-full bg-slate-50/80 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-red-500 transition-all border border-slate-100 shadow-sm"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </motion.button>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-500/5 px-4 py-1.5 rounded-full border border-emerald-500/10 shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Verified Journey</span>
                </div>
              )}
            </div>
            
            <div className="relative">
              <Quote className="absolute -top-6 -left-8 h-12 w-12 text-primary/5 -z-0" />
              <p className="text-slate-800 text-lg font-bold leading-relaxed relative z-10 tracking-tight italic">
                &quot;{review.quote}&quot;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 pt-8 border-t border-slate-100 mt-auto">
            <motion.div 
              whileHover={{ scale: 1.15, rotate: 5 }}
              className="relative rounded-full"
            >
              <div className="absolute -inset-2 bg-primary/15 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image
                src={review.image}
                alt={review.author}
                width={56}
                height={56}
                className="rounded-full border-2 border-white shadow-lg object-cover aspect-square relative z-10"
              />
            </motion.div>
            <div className="min-w-0">
              <p className="font-extrabold text-slate-900 text-[17px] truncate tracking-tight mb-0.5">
                {review.author}
              </p>
              <div className="flex items-center gap-2.5">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] truncate">
                  {review.role}
                </p>
                <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                <p className="text-[10px] font-black text-slate-400 truncate tracking-widest uppercase">
                  {review.company}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ReviewGrid = ({ reviews, currentUserId, onDelete }) => {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <AnimatePresence mode="popLayout">
          {reviews.map((review) => (
            <ReviewCard 
              key={review.id}
              review={review} 
              currentUserId={currentUserId} 
              onDelete={onDelete} 
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReviewGrid;
