"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Play,
  Clock,
  Shield,
  Zap,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  X,
} from "lucide-react";
import Link from "next/link";
import type { Variants } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0  },
};

const HERO_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0 } },
};

const CARDS_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0 } },
};

const CARD_ITEM: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0  },
};

const CARD_TRANSITION = { duration: 0.35, ease: EASE };

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, animId: number;
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    let particles: P[] = [];
    const mouse = { x: -999, y: -999 };

    function mp(): P {
      return {
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.3 + 0.3, a: Math.random() * 0.3 + 0.05,
      };
    }

    function init() {
      W = canvas!.width  = window.innerWidth;
      H = canvas!.height = window.innerHeight;
      particles = Array.from({ length: 100 }, mp);
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const mdx = mouse.x - p.x, mdy = mouse.y - p.y;
        const md  = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 140) { p.vx -= (mdx / md) * 0.025; p.vy -= (mdy / md) * 0.025; }
        p.vx *= 0.993; p.vy *= 0.993;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) Object.assign(p, mp());
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx!.beginPath(); ctx!.moveTo(p.x, p.y); ctx!.lineTo(q.x, q.y);
            ctx!.strokeStyle = `rgba(139,92,246,${(1 - d / 100) * 0.15})`;
            ctx!.lineWidth = 0.5; ctx!.stroke();
          }
        }
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(167,139,250,${p.a})`; ctx!.fill();
      }
      animId = requestAnimationFrame(draw);
    }

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", init);

    // defer canvas init so it never blocks first paint
    const t = setTimeout(() => { init(); draw(); }, 100);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", init);
    };
  }, []);

  const features = [
    { icon: Clock,         color: "purple",  label: "48-Hour Turnaround",   desc: "Contextual nudges move clients forward without manual email chasing or awkward follow-ups." },
    { icon: Shield,        color: "indigo",  label: "Credential Vault",      desc: "Encrypted, isolated forms collect sensitive passwords away from chaotic group chats." },
    { icon: Layers,        color: "blue",    label: "One-Click Workspaces",  desc: "Spin up a structured requirement list in 60 seconds, tailored to your exact service." },
    { icon: MessageSquare, color: "emerald", label: "WhatsApp Reminders",    desc: "Automated nudges hit their phone directly. The killer feature no other tool has." },
  ];

  const colorMap: Record<string, { ring: string; bg: string; icon: string; glow: string }> = {
    purple:  { ring: "border-purple-500/20",  bg: "bg-purple-500/10",  icon: "text-purple-400",  glow: "bg-purple-500/10"  },
    indigo:  { ring: "border-indigo-500/20",  bg: "bg-indigo-500/10",  icon: "text-indigo-400",  glow: "bg-indigo-500/10"  },
    blue:    { ring: "border-blue-500/20",    bg: "bg-blue-500/10",    icon: "text-blue-400",    glow: "bg-blue-500/10"    },
    emerald: { ring: "border-emerald-500/20", bg: "bg-emerald-500/10", icon: "text-emerald-400", glow: "bg-emerald-500/10" },
  };

  const steps = [
    { n: "01", title: "Create Pipeline",  desc: "Build a custom checklist of everything you need from the client in under 60 seconds." },
    { n: "02", title: "Send Magic Link",  desc: "One link lands in their WhatsApp or inbox. No login, no account, zero friction."     },
    { n: "03", title: "Start Working",    desc: "Assets arrive organized and on time. Project kicks off. Everyone's happy."            },
  ];

  const starterFeatures = ["Up to 10 active pipelines", "Standard email reminders", "Secure credential vault"];
  const agencyFeatures  = ["Unlimited pipelines", "WhatsApp & SMS reminders", "Custom agency branding", "Priority support"];

  return (
    <main className="relative min-h-screen bg-[#06060f] text-zinc-50 overflow-x-hidden font-sans antialiased selection:bg-purple-500/30">

      <style>{`
        @keyframes orb1 {
          0%,100% { transform:translate(0,0) scale(1); }
          33%      { transform:translate(50px,-40px) scale(1.08); }
          66%      { transform:translate(-30px,50px) scale(0.94); }
        }
        @keyframes orb2 {
          0%,100% { transform:translate(0,0) scale(1); }
          40%      { transform:translate(-40px,30px) scale(1.06); }
          70%      { transform:translate(35px,-40px) scale(0.96); }
        }
        @keyframes gridFloat {
          0%,100% { opacity:0.04; }
          50%      { opacity:0.07; }
        }
        @keyframes badgePop {
          from { opacity:0; transform:scale(0.88) translateY(8px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes badgePulse {
          0%,100% { box-shadow:0 0 0 0 rgba(139,92,246,0.28); }
          50%      { box-shadow:0 0 0 6px rgba(139,92,246,0); }
        }
        @keyframes shimmerBtn {
          from { left:-80%; }
          to   { left:160%; }
        }
        @keyframes dashIn {
          from { opacity:0; transform:translateY(40px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)   scale(1);    }
        }
        .badge-anim { animation: badgePop 0.35s cubic-bezier(0.22,1,0.36,1) both, badgePulse 3s ease-in-out 0.4s infinite; }
        .grid-bg    { animation: gridFloat 8s ease-in-out infinite; }
        .dash-in    { animation: dashIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .btn-shimmer { position:relative; overflow:hidden; }
        .btn-shimmer:hover::after {
          content:''; position:absolute; top:0; width:50%; height:100%;
          background:rgba(255,255,255,0.09); transform:skewX(-15deg);
          animation:shimmerBtn 0.5s ease-out forwards; pointer-events:none;
        }
      `}</style>

      {/* Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />

      {/* Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{ animation: "orb1 20s ease-in-out infinite" }}
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-purple-900/20 blur-[130px]" />
        <div style={{ animation: "orb2 25s ease-in-out infinite" }}
          className="absolute -bottom-40 -right-40 w-[800px] h-[800px] rounded-full bg-indigo-900/10 blur-[140px]" />
        <div style={{ animation: "orb1 18s ease-in-out infinite reverse" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-900/10 blur-[100px]" />
        <div className="grid-bg absolute inset-0 bg-[radial-gradient(rgba(139,92,246,0.15)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* ── NAVBAR ─────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[rgba(6,6,15,0.7)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-900/40">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">ClientSprint</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500">
            {["Features", "How it works", "Pricing"].map((l) => (
              <Link key={l} href={`#${l.toLowerCase().replace(" ", "-")}`}
                className="hover:text-white transition-colors duration-150">{l}
              </Link>
            ))}
          </div>

          <Link href="/login"
            className="btn-shimmer h-9 px-5 rounded-lg bg-white text-zinc-950 font-bold text-sm flex items-center gap-1.5 hover:bg-zinc-100 transition-all duration-150 hover:-translate-y-px shadow-md">
            Get started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────── */}
      <section className="relative z-10 pt-40 pb-20 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">

        {/* Badge — CSS only, no framer delay */}
        <div className="badge-anim inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold uppercase tracking-widest mb-8">
          <Zap className="w-3 h-3" />
          Stop losing revenue to stalled projects
        </div>

        {/* Hero text — stagger starts at 0, fast children */}
        <motion.div
          variants={HERO_CONTAINER}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-0"
        >
          <motion.h1
            variants={FADE_UP}
            transition={{ duration: 0.45, ease: EASE }}
            className="text-5xl md:text-[70px] font-black tracking-tight text-white mb-5 leading-[1.08]"
            style={{ textShadow: "0 0 80px rgba(139,92,246,0.22)" }}
          >
            The automated<br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              onboarding portal
            </span>
            <br />for modern agencies.
          </motion.h1>

          <motion.p
            variants={FADE_UP}
            transition={{ duration: 0.4, ease: EASE }}
            className="text-lg md:text-xl font-medium text-zinc-400 max-w-2xl mb-8 leading-relaxed"
          >
            Collect logos, copy, and project credentials in 48 hours or less — with
            frictionless, gamified checklist paths. No more chasing emails.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={FADE_UP}
            transition={{ duration: 0.38, ease: EASE }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-10"
          >
            <Link href="/login"
              className="btn-shimmer group h-12 px-8 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm flex items-center gap-2 shadow-[0_0_40px_rgba(139,92,246,0.35)] hover:shadow-[0_0_70px_rgba(139,92,246,0.55)] transition-all duration-200 hover:-translate-y-0.5">
              Start free trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button className="group h-12 px-8 rounded-xl border border-zinc-700/80 text-white font-bold text-sm flex items-center gap-2 hover:bg-zinc-900/80 hover:border-zinc-600 transition-all duration-150">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                <Play className="w-3 h-3 ml-0.5" />
              </div>
              See it in action
            </button>
          </motion.div>

          {/* Social proof — fast, no long delay */}
          <motion.div
            variants={FADE_UP}
            transition={{ duration: 0.38, ease: EASE }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex -space-x-3">
              {[10, 11, 12, 13, 14].map((n) => (
                <div key={n} className="w-9 h-9 rounded-full border-2 border-[#06060f] bg-gradient-to-br from-zinc-700 to-zinc-800 overflow-hidden ring-1 ring-purple-500/20">
                  <img src={`https://i.pravatar.cc/80?img=${n}`} alt="" className="w-full h-full object-cover opacity-75" />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-zinc-500">
              <strong className="text-zinc-200">340+ agencies</strong> collecting assets 48% faster
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── DASHBOARD MOCKUP ───────────────────────────── */}
      <section className="relative z-10 px-6 max-w-6xl mx-auto pb-32">
        <div className="dash-in rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-2 md:p-3 shadow-[0_0_120px_-20px_rgba(139,92,246,0.28)] overflow-hidden backdrop-blur-xl">
          <div className="rounded-xl border border-zinc-800/80 bg-[#09090f] w-full overflow-hidden">

            {/* Traffic lights */}
            <div className="h-10 border-b border-zinc-800/60 flex items-center gap-2 px-4">
              <div className="flex gap-1.5">
                {["bg-red-500/60", "bg-amber-500/60", "bg-green-500/60"].map((c, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-full ${c}`} />
                ))}
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-4 w-48 bg-zinc-800/60 rounded-md" />
              </div>
            </div>

            <div className="flex" style={{ minHeight: 340 }}>
              {/* Sidebar */}
              <div className="w-44 border-r border-zinc-800/50 p-4 hidden md:flex flex-col gap-2 flex-shrink-0">
                <div className="h-5 w-24 bg-zinc-800/80 rounded mb-4" />
                <div className="h-8 w-full bg-purple-500/15 border border-purple-500/20 rounded-lg" />
                {[1,2,3].map(i => <div key={i} className="h-8 w-full bg-zinc-800/30 rounded-lg" />)}
                <div className="mt-auto h-8 w-full bg-zinc-800/20 rounded-lg" />
              </div>

              {/* Main */}
              <div className="flex-1 p-6 flex flex-col gap-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/8 blur-[90px] rounded-full pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="h-7 w-36 bg-zinc-800/80 rounded-lg" />
                  <div className="h-8 w-28 bg-purple-500/20 border border-purple-500/30 rounded-lg" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { c: "bg-purple-500/20 border-purple-500/20", w: "w-8" },
                    { c: "bg-emerald-500/20 border-emerald-500/20", w: "w-12" },
                    { c: "bg-amber-500/20 border-amber-500/20", w: "w-10" },
                    { c: "bg-red-500/20 border-red-500/20", w: "w-6" },
                  ].map((s, i) => (
                    <div key={i} className={`rounded-xl border p-3 ${s.c}`}>
                      <div className="h-2.5 w-16 bg-white/10 rounded mb-2.5" />
                      <div className={`h-6 ${s.w} bg-white/20 rounded`} />
                      <div className="h-2 w-12 bg-white/10 rounded mt-1.5" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 w-32 bg-zinc-700/60 rounded mb-1" />
                  {[{ pct: "40%", c: "bg-purple-500" }, { pct: "80%", c: "bg-emerald-500" }, { pct: "20%", c: "bg-red-500" }].map((row, i) => (
                    <div key={i} className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/40 rounded-xl p-3">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-2.5 w-24 bg-zinc-700/70 rounded mb-1.5" />
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full">
                          <div className={`h-1.5 rounded-full ${row.c}`} style={{ width: row.pct }} />
                        </div>
                      </div>
                      <div className="h-5 w-14 bg-zinc-800/60 rounded-full flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────── */}
      <section id="features" className="relative z-10 px-6 max-w-6xl mx-auto pb-32">
        <div className="text-center mb-12">
          <motion.h2
            variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.38, ease: EASE }}
            className="text-3xl md:text-4xl font-black text-white mb-3"
          >
            Everything your agency needs
          </motion.h2>
          <p className="text-zinc-500 font-medium">Built for high-ticket studios that can't afford project delays.</p>
        </div>

        <motion.div
          variants={CARDS_CONTAINER} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((f) => {
            const c = colorMap[f.color];
            const Icon = f.icon;
            return (
              <motion.div
                key={f.label}
                variants={CARD_ITEM}
                transition={CARD_TRANSITION}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                className={`group relative bg-zinc-900/40 border ${c.ring} rounded-2xl p-6 hover:bg-zinc-900/70 transition-colors duration-200 overflow-hidden cursor-default`}
              >
                <div className={`absolute top-0 right-0 w-28 h-28 ${c.glow} blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.ring} flex items-center justify-center mb-5 relative z-10`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <h3 className="text-white font-bold text-base mb-2 relative z-10">{f.label}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed relative z-10">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 px-6 max-w-5xl mx-auto pb-32">
        <div className="text-center mb-14">
          <motion.h2
            variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.38, ease: EASE }}
            className="text-3xl md:text-4xl font-black text-white mb-3"
          >
            How it works
          </motion.h2>
          <p className="text-zinc-500 font-medium">Three steps. No complexity. Projects start on time.</p>
        </div>

        <motion.div
          variants={CARDS_CONTAINER} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
          className="flex flex-col md:flex-row items-start justify-between gap-10 relative"
        >
          <div className="hidden md:block absolute top-6 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              variants={CARD_ITEM}
              transition={CARD_TRANSITION}
              className="relative z-10 flex flex-col items-center text-center flex-1"
            >
              <motion.div
                whileHover={{ scale: 1.1, boxShadow: "0 0 28px rgba(139,92,246,0.4)" }}
                transition={{ duration: 0.15 }}
                className="w-12 h-12 rounded-full bg-[#06060f] border-2 border-zinc-700 hover:border-purple-500/60 text-white font-black text-sm flex items-center justify-center mb-6 shadow-lg transition-colors duration-200"
              >
                {s.n}
              </motion.div>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-[200px]">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── PRICING ────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 px-6 max-w-4xl mx-auto pb-32">
        <div className="text-center mb-12">
          <motion.h2
            variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.38, ease: EASE }}
            className="text-3xl md:text-4xl font-black text-white mb-3"
          >
            Simple, honest pricing
          </motion.h2>
          <p className="text-zinc-500 font-medium">No enterprise sales calls. Start onboarding immediately.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.38, ease: EASE }}
            className="bg-zinc-900/40 border border-zinc-800/70 rounded-3xl p-8 flex flex-col"
          >
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Starter</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black text-white">€49</span>
              <span className="text-sm text-zinc-600 font-medium">/mo</span>
            </div>
            <ul className="space-y-3.5 mb-8 flex-1">
              {starterFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-zinc-400">
                  <CheckCircle2 className="w-4 h-4 text-zinc-600 flex-shrink-0" /> {feat}
                </li>
              ))}
            </ul>
            <button className="btn-shimmer w-full h-12 rounded-xl border border-zinc-700 hover:border-zinc-500 text-white font-bold text-sm transition-all duration-150 hover:-translate-y-px">
              Start free trial
            </button>
          </motion.div>

          <motion.div
            variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.38, delay: 0.08, ease: EASE }}
            className="relative bg-gradient-to-b from-purple-900/25 to-zinc-900/40 border border-purple-500/25 rounded-3xl p-8 flex flex-col overflow-hidden shadow-[0_0_60px_-10px_rgba(139,92,246,0.25)]"
          >
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">
              Most Popular
            </div>
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-4">Agency</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black text-white">€199</span>
              <span className="text-sm text-zinc-500 font-medium">/mo</span>
            </div>
            <ul className="space-y-3.5 mb-8 flex-1">
              {agencyFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" /> {feat}
                </li>
              ))}
            </ul>
            <button className="btn-shimmer w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm transition-all duration-150 hover:-translate-y-0.5 shadow-[0_4px_24px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.55)]">
              Upgrade to Agency
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-zinc-900/80">
        <div className="relative max-w-4xl mx-auto px-6 py-28 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 via-transparent to-transparent pointer-events-none" />
          <motion.h2
            variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.42, ease: EASE }}
            className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight relative z-10"
          >
            Your next project shouldn't<br />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              start with a week of chasing emails.
            </span>
          </motion.h2>
          <motion.div
            variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.38, delay: 0.08, ease: EASE }}
            className="relative z-10"
          >
            <Link href="/login"
              className="btn-shimmer inline-flex h-12 px-8 rounded-xl bg-white text-zinc-950 font-bold text-sm items-center gap-2 hover:bg-zinc-100 transition-all duration-150 hover:-translate-y-0.5 shadow-xl">
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <div className="border-t border-zinc-900/60 py-8">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
                <Layers className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold text-zinc-600">ClientSprint © 2026</span>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium text-zinc-600">
              <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-zinc-300 transition-colors flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" /> Follow us
              </a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}