"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { Plus, ExternalLink, RefreshCw, Layers } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Portal {
  id: string;
  client_name: string;
  project_name: string;
  slug: string;
  status: string;
}

// --- MICRO-COMPONENT: ANIMATED COUNT-UP STAT VALUE ---
function CountUpStat({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1], // Premium outward cubic ease
    });
    return () => controls.stop();
  }, [value, count]);

  useEffect(() => {
    return rounded.onChange((latest) => {
      if (ref.current) ref.current.textContent = String(latest);
    });
  }, [rounded]);

  return <p ref={ref} className="text-4xl font-black text-white tracking-tight tabular-nums">0</p>;
}

export default function AgencyOverviewDashboard() {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchPortals() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("client_portals")
        .select("id, client_name, project_name, slug, status");

      if (error) throw error;
      setPortals(data || []);
    } catch (err) {
      console.error("Error loading agency portal list:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPortals();
  }, []);

  return (
    <main className="relative w-full flex-1 mx-auto pt-16 md:pt-24 pb-24 px-6 md:p-10 space-y-12 select-none z-10">
      
      {/* Visual Rhythm Grid Overlay (Solves the empty space issue) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.25] pointer-events-none -z-10" />

      {/* Top Header Row Block Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-zinc-900/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Agency Core</h1>
          <p className="text-sm sm:text-base text-zinc-400 font-medium">Manage and monitor active onboarding sprints effortlessly.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05, rotate: 45 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            onClick={fetchPortals} 
            className="h-11 w-11 inline-flex items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-900/30 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
          
          <Link href="/dashboard/new">
            <Button asChild>
              <motion.button 
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="h-11 px-5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl flex items-center gap-2 cursor-pointer text-sm shadow-md transition-all"
              >
                <Plus className="w-4 h-4" /> Create Pipeline
              </motion.button>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Summary Cards Grid (With Scale-In & Dynamic Counting) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-zinc-900/10 border border-zinc-900 backdrop-blur-md rounded-2xl p-6 space-y-3 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">Active Links Deployed</span>
          <CountUpStat value={portals.length} />
          
          {/* Progress Bar Left-to-Right Slide */}
          <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden mt-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: portals.length > 0 ? "75%" : "0%" }}
              transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-zinc-400"
            />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-zinc-900/10 border border-zinc-900 backdrop-blur-md rounded-2xl p-6 space-y-3 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">Collection Velocity</span>
          <p className="text-4xl font-black text-white tracking-tight">48h <span className="text-zinc-500 text-sm font-bold uppercase">Avg</span></p>
          
          {/* Progress Bar Left-to-Right Staggered Slide */}
          <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden mt-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "90%" }}
              transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-zinc-400"
            />
          </div>
        </motion.div>
      </div>

      {/* Pipeline Rows Container Block */}
      <div className="space-y-5">
        <h2 className="text-xl font-bold tracking-tight text-zinc-200">Live Client Tunnels</h2>
        
        {loading ? (
          <div className="border border-zinc-900 bg-zinc-900/10 rounded-2xl p-16 text-center text-zinc-500 text-sm font-medium animate-pulse">
            Syncing rows to cloud arrays...
          </div>
        ) : portals.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-zinc-900 rounded-2xl p-16 text-center space-y-2 bg-zinc-900/5 backdrop-blur-sm"
          >
            <p className="text-zinc-500 text-sm font-medium">No active client workspaces built yet.</p>
          </motion.div>
        ) : (
          <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-900/5 backdrop-blur-md shadow-xl">
            <div className="divide-y divide-zinc-900/80">
              <AnimatePresence>
                {portals.map((portal, index) => (
                  <motion.div 
                    key={portal.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    // Strict 60ms stagger delay engine per index row
                    transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-zinc-900/20 transition-all duration-300 group relative"
                  >
                    <div className="min-w-0 space-y-1">
                      <h3 className="font-bold text-lg text-zinc-200 tracking-tight group-hover:text-white transition-colors">
                        {portal.client_name}
                      </h3>
                      <p className="text-sm text-zinc-500 font-medium">
                        Scope: <span className="text-zinc-400">{portal.project_name}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0">
                      {/* Pulse dot breathing continuously */}
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-950 border border-zinc-900 text-zinc-400">
                        <span className="relative flex h-2 w-2">
                          <motion.span 
                            animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="absolute inline-flex h-full w-full rounded-full bg-amber-400/80 opacity-75"
                          />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                        </span>
                        {portal.status}
                      </span>
                      
                      <Link href={`/welcome/${portal.slug}`} target="_blank">
                        <Button asChild size="sm">
                          <motion.button 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="h-9 px-4 text-xs font-bold gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white shadow-sm cursor-pointer transition-colors"
                          >
                            <span>Launch Link</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </motion.button>
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}