"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { Layers, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AgencyAuthGate() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Track field focus states
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // Force route navigation immediately on success
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Auth Exception:", err);
      setErrorMsg(err?.message || "Connection timed out.");
      setLoading(false); // <--- Kills spinner on catch block
    }
  };
  
  const handleGoogleSSO = async () => {
    setSsoLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Force a hard network reload so the Server Middleware sees your new cookie instantly
      window.location.href = "/dashboard";
      
    } catch (err: any) {
      setErrorMsg(err?.message || "SSO initialization failed.");
      setSsoLoading(false);
    }
  };

  // --- TYPE-SAFE FRAMER-MOTION VARIANTS ---
  const formVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <main className="fixed inset-0 w-screen h-screen bg-zinc-950 flex items-center justify-center m-0 p-0 overflow-hidden select-none font-sans antialiased">
      
      {/* CRITICAL STYLES:
        1. Fixes the default browser white/blue autofill hijack cleanly.
        2. Configures premium hardware-accelerated ambient drifting keyframes.
      */}
      <style jsx global>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-background-clip: text;
          -webkit-text-fill-color: #e4e4e7 !important;
          transition: background-color 5000s ease-in-out 0s;
          box-shadow: inset 0 0 20px 20px rgba(9, 9, 11, 0.8) !important;
        }
        @keyframes drift {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(60px, -40px) scale(1.1); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes subtleGridMove {
          0% { transform: translateY(0px); }
          100% { transform: translateY(64px); }
        }
        @keyframes shimmerGlow {
          0%, 100% { opacity: 0.5; filter: drop-shadow(0 0 15px rgba(147, 51, 234, 0.4)); }
          50% { opacity: 0.8; filter: drop-shadow(0 0 25px rgba(147, 51, 234, 0.7)); }
        }
        .animate-orb-slow-one { animation: drift 35s infinite ease-in-out; }
        .animate-orb-slow-two { animation: drift 45s infinite ease-in-out reverse; }
        .animate-grid-drift { animation: subtleGridMove 40s linear infinite; }
        .animate-btn-glow { animation: shimmerGlow 4s infinite ease-in-out; }
      `}</style>

      {/* --- PREMIUM AMBIENT CANVAS BACKGROUND LAYER --- */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        {/* Soft, Slowly Drifting Blurred Orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full bg-purple-950/10 blur-[140px] animate-orb-slow-one" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[750px] h-[750px] rounded-full bg-teal-950/10 blur-[150px] animate-orb-slow-two" />
        
        {/* Slow Moving Linear Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141416_1px,transparent_1px),linear-gradient(to_bottom,#141416_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 animate-grid-drift" />
      </div>

      {/* --- RE-PROPORTIONED EXPANDED GRAPHIC CARD --- */}
      <motion.div 
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.002 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-zinc-900/15 border border-zinc-900/80 backdrop-blur-3xl rounded-3xl p-10 md:p-12 z-10 mx-4 relative transition-all duration-500 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
        style={{
          boxShadow: emailFocused || passwordFocused 
            ? "0 0 60px -20px rgba(147, 51, 234, 0.15), inset 0 0 20px rgba(147, 51, 234, 0.02)" 
            : "0 40px_120px_-30px_rgba(0,0,0,0.9)",
          borderColor: emailFocused || passwordFocused ? "rgba(147, 51, 234, 0.35)" : "rgba(24, 24, 27, 0.8)"
        }}
      >
        {/* Upper Micro-Glow Accent Line */}
        <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

        {/* Header Branding Row */}
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="h-14 w-14 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-center shadow-inner cursor-pointer"
          >
            <Layers className="w-5 h-5 text-zinc-200" />
          </motion.div>
          <div className="space-y-0.5">
            <h1 className="text-3xl font-black tracking-tight text-white font-sans sm:text-4xl">ClientSprint</h1>
            <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Agency workspace</p>
          </div>
        </div>

        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-950/10 border border-red-900/20 text-red-400 text-xs font-semibold text-center tracking-wide"
          >
            {errorMsg}
          </motion.div>
        )}

        {/* --- FORM INFRASTRUCTURE WITH PROTECTED DARK FIELDS --- */}
        <motion.form 
          variants={formVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleEmailLogin} 
          className="space-y-6"
        >
          {/* Email Form Entry Group */}
          <motion.div variants={itemVariants} className="space-y-2 relative">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 pl-1 transition-colors" style={{ color: emailFocused ? "#c084fc" : "#52525b" }}>Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-4 h-4 text-zinc-600 transition-colors" style={{ color: emailFocused ? "#c084fc" : "#52525b" }} />
              <input 
                type="email"
                required
                disabled={loading || ssoLoading}
                placeholder="name@agency.com"
                value={email}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-zinc-950 border border-zinc-900 focus:border-zinc-800/80 text-zinc-200 placeholder-zinc-700 focus:outline-none text-sm font-medium transition-all disabled:opacity-50"
                style={{ paddingLeft: emailFocused ? "3.25rem" : "3rem" }}
              />
              {/* Dynamic Focus Underline Accent */}
              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-zinc-900 pointer-events-none overflow-hidden rounded-full">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: emailFocused ? "0%" : "-100%" }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Password Form Entry Group */}
          <motion.div variants={itemVariants} className="space-y-2 relative">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 pl-1 transition-colors" style={{ color: passwordFocused ? "#c084fc" : "#52525b" }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-4 h-4 text-zinc-600 transition-colors" style={{ color: passwordFocused ? "#c084fc" : "#52525b" }} />
              <input 
                type="password"
                required
                disabled={loading || ssoLoading}
                placeholder="••••••••"
                value={password}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-zinc-950 border border-zinc-900 focus:border-zinc-800/80 text-zinc-200 placeholder-zinc-700 focus:outline-none text-sm font-medium transition-all disabled:opacity-50"
                style={{ paddingLeft: passwordFocused ? "3.25rem" : "3rem" }}
              />
              {/* Dynamic Focus Underline Accent */}
              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-zinc-900 pointer-events-none overflow-hidden rounded-full">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: passwordFocused ? "0%" : "-100%" }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-500"
                />
              </div>
            </div>
          </motion.div>

          {/* --- REDESIGNED ELEVATED "ENTER WORKSPACE" SUBMIT BUTTON --- */}
          <motion.div variants={itemVariants} className="pt-2 animate-btn-glow">
            <motion.button 
              type="submit" 
              disabled={loading || ssoLoading}
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-zinc-100 font-bold rounded-xl flex items-center justify-center gap-2 border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.25)] hover:shadow-[0_0_40px_rgba(147,51,234,0.45)] transition-all cursor-pointer text-xs uppercase tracking-widest relative overflow-hidden disabled:opacity-50 pt-0.5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Enter Workspace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.form>

        {/* Minimalist Visual Divider Section */}
        <motion.div variants={itemVariants} className="relative flex py-6 items-center opacity-30">
          <div className="flex-grow border-t border-zinc-800" />
          <span className="flex-shrink mx-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Single Sign On</span>
          <div className="flex-grow border-t border-zinc-800" />
        </motion.div>

        {/* Minimal Google Single Sign On Button */}
        <motion.div variants={itemVariants}>
          <motion.button 
            type="button"
            disabled={loading || ssoLoading}
            onClick={handleGoogleSSO}
            whileHover={{ scale: 1.012, backgroundColor: "rgba(12,12,14,0.6)", borderColor: "rgba(147,51,234,0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-12 bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer text-xs disabled:opacity-50"
          >
            {ssoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </main>
  );
}