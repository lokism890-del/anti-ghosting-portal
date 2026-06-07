"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Clock, Sparkles } from "lucide-react";

export default function SaaSClientLandingPage() {
  
  const fadeUpVariant: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8, 
        delay: custom * 0.12, 
        ease: [0.16, 1, 0.3, 1] as const 
      }
    })
  };

  return (
    <main className="relative min-h-screen w-full text-zinc-100 flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden font-sans selection:bg-zinc-800 selection:text-zinc-200">
      
      {/* Animated Multi-Gradient Mesh Background (Lighter & Shifting) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800/40 opacity-90 animate-mesh" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(63,63,70,0.15)_0%,rgba(9,9,11,0.95)_80%)]" />
      
      {/* Luminous Ambient Glows */}
      <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-zinc-700/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[10%] w-[600px] h-[600px] rounded-full bg-zinc-800/15 blur-[140px] pointer-events-none" />

      {/* Hero Content Wrapper */}
      <div className="relative max-w-5xl text-center space-y-12 z-10 py-12">
        
        {/* Animated Pill Badge */}
        <motion.div 
          variants={fadeUpVariant}
          initial="hidden"
          animate="visible"
          custom={0}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-zinc-900/90 border border-zinc-800 text-zinc-300 backdrop-blur-md shadow-2xl"
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" /> Stop losing revenue to stalled projects
        </motion.div>

        {/* Hyper-Bold Title focused purely on ClientSprint */}
        <motion.h1 
          variants={fadeUpVariant}
          initial="hidden"
          animate="visible"
          custom={1}
          className="text-6xl sm:text-8xl font-black tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent leading-[1.02] max-w-4xl mx-auto"
        >
          ClientSprint
        </motion.h1>
        
        {/* Maximum Readability Description */}
        <motion.p 
          variants={fadeUpVariant}
          initial="hidden"
          animate="visible"
          custom={2}
          className="text-zinc-300 text-lg sm:text-2xl max-w-3xl mx-auto leading-relaxed font-medium antialiased drop-shadow-sm"
        >
          The automated onboarding portal for modern agencies. Collect logos, copy, and structural project logins in 48 hours or less with frictionless, gamified checklist paths.
        </motion.p>

        {/* Premium Call To Action Trigger */}
        <motion.div 
          variants={fadeUpVariant}
          initial="hidden"
          animate="visible"
          custom={3}
          className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/welcome/vertex-creative-agency">
            <Button 
              size="lg" 
              className="group h-14 px-10 text-base font-bold bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl transition-all duration-300 flex items-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.05)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.15)] cursor-pointer"
            >
              <span>Launch Client Demo</span> 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Button>
          </Link>
        </motion.div>

        {/* High-Accessibility Feature Matrix */}
        <motion.div 
          variants={fadeUpVariant}
          initial="hidden"
          animate="visible"
          custom={4}
          className="pt-24 grid grid-cols-1 sm:grid-cols-3 gap-12 border-t border-zinc-900 max-w-4xl mx-auto text-left"
        >
          {/* Feature 1 */}
          <div className="space-y-3 group">
            <div className="flex items-center gap-3 text-zinc-100 font-bold text-lg">
              <Clock className="w-5.5 h-5.5 text-zinc-300 group-hover:text-white transition-colors duration-200" /> 
              <span>48-Hour Turnaround</span>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
              Contextual notifications gently urge clients across the line without agency tracking overhead or manual email chasing.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="space-y-3 group">
            <div className="flex items-center gap-3 text-zinc-100 font-bold text-lg">
              <ShieldCheck className="w-5.5 h-5.5 text-zinc-300 group-hover:text-white transition-colors duration-200" /> 
              <span>The Credential Vault</span>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
              Secure environment forms safely isolate and encrypt critical development project passwords far away from messy group chats.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="space-y-3 group">
            <div className="flex items-center gap-3 text-zinc-100 font-bold text-lg">
              <Zap className="w-5.5 h-5.5 text-zinc-300 group-hover:text-white transition-colors duration-200" /> 
              <span>One-Click Workspaces</span>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
              Instantly spin up premium, structured asset requirements customized directly to match your specific high-ticket agency services.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}