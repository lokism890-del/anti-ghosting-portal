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
  
  // NEW: On-Screen Diagnostic State
  const [debugTrace, setDebugTrace] = useState<string[]>([]);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const addLog = (msg: string) => {
    setDebugTrace((prev) => [...prev, msg]);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setDebugTrace([]); // Clear old logs
    addLog("🟢 1. Button clicked. Starting auth request...");
    setLoading(true);
    setErrorMsg("");

    try {
      addLog(`🔍 Environment URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "Found" : "MISSING!"}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });

      addLog(`🟢 2. Supabase responded. Error: ${error ? 'Yes' : 'No'}, Session: ${data?.session ? 'Yes' : 'No'}`);

      if (error) {
        setErrorMsg(error.message);
        addLog(`🔴 Error Details: ${error.message}`);
        setLoading(false);
        return;
      }

      if (data?.session) {
        addLog("🟢 3. Session validated! Attempting browser redirect...");
        window.location.assign("/dashboard");
      } else {
        setErrorMsg("System glitch: No session token returned.");
        addLog("🔴 Error: No session data returned.");
        setLoading(false);
      }
    } catch (err: any) {
      addLog(`🔴 4. Caught Exception: ${err?.message || "Unknown error"}`);
      setErrorMsg(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleGoogleSSO = async () => { /* Keeps your previous SSO code */ };

  // --- TYPE-SAFE FRAMER-MOTION VARIANTS ---
  const formVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <main className="fixed inset-0 w-screen h-screen bg-zinc-950 flex flex-col items-center justify-center m-0 p-0 overflow-y-auto select-none font-sans antialiased">
      
      {/* --- PREVIOUS STYLES & BACKGROUND OMITTED FOR BREVITY BUT ASSUMED INTACT --- */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none bg-zinc-950" />

      <motion.div 
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-lg bg-zinc-900/15 border border-zinc-900/80 backdrop-blur-3xl rounded-3xl p-10 md:p-12 z-10 mx-4 relative mt-10 mb-4"
      >
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
          <div className="h-14 w-14 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-center shadow-inner">
            <Layers className="w-5 h-5 text-zinc-200" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-3xl font-black tracking-tight text-white font-sans sm:text-4xl">ClientSprint</h1>
            <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Agency workspace</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/10 border border-red-900/20 text-red-400 text-xs font-semibold text-center tracking-wide">
            {errorMsg}
          </div>
        )}

        <motion.form variants={formVariants} initial="hidden" animate="visible" onSubmit={handleEmailLogin} className="space-y-6">
          <motion.div variants={itemVariants} className="space-y-2 relative">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-4 h-4 text-zinc-600" />
              <input 
                type="email" required disabled={loading} placeholder="name@agency.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 placeholder-zinc-700 focus:outline-none text-sm font-medium"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2 relative">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-4 h-4 text-zinc-600" />
              <input 
                type="password" required disabled={loading} placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-200 placeholder-zinc-700 focus:outline-none text-sm font-medium"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-2">
            <button 
              type="submit" disabled={loading} aria-label="Securely log in to workspace"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 text-zinc-100 font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Enter Workspace</span>}
            </button>
          </motion.div>
        </motion.form>
      </motion.div>

      {/* --- NEW: VISUAL DIAGNOSTIC TERMINAL --- */}
      {debugTrace.length > 0 && (
        <div className="w-full max-w-lg mx-4 mb-10 p-4 bg-black/80 border border-green-500/50 rounded-xl z-20 shadow-2xl">
          <h3 className="text-green-500 text-[10px] font-bold uppercase tracking-widest mb-2 border-b border-green-900/50 pb-2">Diagnostic Terminal</h3>
          <div className="space-y-1">
            {debugTrace.map((log, index) => (
              <p key={index} className="text-green-400 font-mono text-xs break-words">{log}</p>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}