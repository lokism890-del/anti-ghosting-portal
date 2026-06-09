"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AgencyAuthGate() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data?.session) {
        window.location.assign("/dashboard");
      } else {
        setErrorMsg("System glitch: No session token returned.");
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleGoogleSSO = async () => {
    setSsoLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err?.message || "SSO initialization failed.");
      setSsoLoading(false);
    }
  };

  return (
    <main className="fixed inset-0 w-screen h-screen bg-[#06060f] flex flex-col items-center justify-center m-0 p-0 overflow-hidden select-none font-sans antialiased text-zinc-50">
      
      {/* --- CRITICAL STYLES: Dark Mode Autofill Fix & Animations --- */}
      <style jsx global>{`
        /* Overrides the browser's default autofill background for dark mode */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-text-fill-color: #f4f4f5 !important;
          transition: background-color 5000s ease-in-out 0s;
          -webkit-box-shadow: 0 0 0px 1000px #09090f inset !important; 
        }
        @keyframes shimmerBtn { from{left:-80%} to{left:160%} }
        .btn-shimmer:hover::after {
          content:'';position:absolute;top:0;width:50%;height:100%;
          background:rgba(255,255,255,0.10);transform:skewX(-15deg);
          animation:shimmerBtn 0.55s ease-out forwards;pointer-events:none;
        }
        .btn-shimmer { position:relative; overflow:hidden; }
        @keyframes gridFloat { 0%,100%{opacity:0.04} 50%{opacity:0.07} }
        .grid-bg { animation: gridFloat 8s ease-in-out infinite; }
      `}</style>

      {/* --- PREMIUM AMBIENT LIGHT BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-purple-900/15 blur-[120px] animate-[pulse_10s_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[900px] h-[900px] rounded-full bg-indigo-900/10 blur-[130px] animate-[pulse_15s_infinite_reverse]" />
        <div className="grid-bg absolute inset-0 bg-[radial-gradient(rgba(139,92,246,0.15)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* --- WIDER, PREMIUM GLASSMORPHISM CARD --- */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[540px] bg-[#09090f]/60 backdrop-blur-2xl border border-zinc-800/80 shadow-[0_0_80px_-20px_rgba(139,92,246,0.15)] rounded-3xl p-10 md:p-14 z-10 mx-4 relative transition-all duration-500"
        style={{
          boxShadow: emailFocused || passwordFocused 
            ? "0 0 100px -20px rgba(139,92,246,0.25), inset 0 0 0 1px rgba(139,92,246,0.1)" 
            : "0 0 80px -20px rgba(139,92,246,0.15)"
        }}
      >
        <div className="flex flex-col items-center text-center space-y-5 mb-10">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-900/40 cursor-pointer"
          >
            <Layers className="w-7 h-7 text-white" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">ClientSprint</h1>
            <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Agency Workspace</p>
          </div>
        </div>

        <AnimatePresence>
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center tracking-wide overflow-hidden"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleEmailLogin} className="space-y-6">
          
          <div className="space-y-2 relative">
            <label className="text-[11px] font-bold uppercase tracking-widest pl-1 transition-colors" style={{ color: emailFocused ? "#a78bfa" : "#71717a" }}>Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-5 h-5 transition-colors" style={{ color: emailFocused ? "#a78bfa" : "#52525b" }} />
              <input 
                type="email" required disabled={loading || ssoLoading} placeholder="name@agency.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-[#09090f] border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:bg-[#0c0c14] text-sm font-medium shadow-inner transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-[11px] font-bold uppercase tracking-widest pl-1 transition-colors" style={{ color: passwordFocused ? "#a78bfa" : "#71717a" }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5 transition-colors" style={{ color: passwordFocused ? "#a78bfa" : "#52525b" }} />
              <input 
                type="password" required disabled={loading || ssoLoading} placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-[#09090f] border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:bg-[#0c0c14] text-sm font-medium shadow-inner transition-all duration-300"
              />
            </div>
          </div>

          <div className="pt-4">
            <motion.button 
              type="submit" disabled={loading || ssoLoading} aria-label="Securely log in to workspace"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn-shimmer group w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.5)] transition-all cursor-pointer text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Enter Workspace</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </motion.button>
          </div>
        </form>

        <div className="relative flex py-8 items-center opacity-60">
          <div className="flex-grow border-t border-zinc-800" />
          <span className="flex-shrink mx-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Or continue with</span>
          <div className="flex-grow border-t border-zinc-800" />
        </div>

        <div>
          <motion.button 
            type="button" disabled={loading || ssoLoading} onClick={handleGoogleSSO} aria-label="Sign in using Google Single Sign On"
            whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-14 bg-transparent border border-zinc-700/80 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer text-sm shadow-sm disabled:opacity-50"
          >
            {ssoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}