"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Layers, ArrowRight } from "lucide-react";

export default function ClientSprintHomeGateway() {
  const router = useRouter();

  return (
    <main className="fixed inset-0 w-screen h-screen bg-zinc-950 flex flex-col items-center justify-center m-0 p-0 overflow-hidden font-sans antialiased">
      {/* Our signature ambient drifting mesh line layers */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141416_1px,transparent_1px),linear-gradient(to_bottom,#141416_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
      <div className="absolute top-[-20%] w-[600px] h-[600px] rounded-full bg-purple-950/10 blur-[140px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-8 max-w-md px-6 z-10"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">ClientSprint</h1>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed">
            The hyper-velocity asset collection and onboarding pipeline for elite digital agencies.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/login")}
          className="w-full h-12 bg-zinc-100 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-widest shadow-xl transition-all"
        >
          <span>Open Agency Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </main>
  );
}