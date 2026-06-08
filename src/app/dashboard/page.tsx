"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Layers, LayoutGrid, PlusCircle, LogOut, RefreshCw, Plus, 
  ExternalLink, X, User, Briefcase, Loader2, CheckCircle2, 
  DownloadCloud, Copy, Check 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// --- TYPES ---
interface Pipeline {
  id: string;
  client_name: string;
  project_scope: string;
  status: string;
  completed_tasks: string[] | null;
  vault_credentials: string | null;
}

export default function AgencyCoreDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [clientName, setClientName] = useState("");
  const [projectScope, setProjectScope] = useState("");
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Tracking which client drawer is expanded
  const [expandedPipelineId, setExpandedPipelineId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => { 
    fetchPipelines(); 
  }, []);

  const fetchPipelines = async () => {
    setIsLoadingData(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (!error && data) setPipelines(data);
    }
    setIsLoadingData(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.assign("/login");
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !projectScope) return;
    
    setIsDeploying(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from("pipelines")
        .insert([{ 
          user_id: user.id, 
          client_name: clientName, 
          project_scope: projectScope, 
          status: "pending", 
          completed_tasks: [] 
        }]);
        
      if (!error) {
        await fetchPipelines();
        setIsCreateModalOpen(false);
        setClientName("");
        setProjectScope("");
      }
    }
    setIsDeploying(false);
  };

  // --- INLINE SECURE ASSET TOKEN GENERATOR ---
  const triggerDownload = async (pipelineId: string, taskId: string) => {
    try {
      // 1. List the files inside the specific client's storage folder
      const { data: files, error: listError } = await supabase.storage
        .from("client_assets")
        .list(pipelineId, { search: taskId });

      if (listError || !files || files.length === 0) {
        alert("Asset file record not found in storage.");
        return;
      }

      // Find the file matching our requirement type prefix
      const targetFile = files.find(f => f.name.startsWith(taskId));
      if (!targetFile) {
        alert("Target asset file structure mismatch.");
        return;
      }

      // 2. Generate a secure, short-lived 60-second download token link
      const { data, error: urlError } = await supabase.storage
        .from("client_assets")
        .createSignedUrl(`${pipelineId}/${targetFile.name}`, 60);

      if (urlError || !data?.signedUrl) {
        alert("Failed to sign an authorized download token link.");
        return;
      }

      // 3. Launch secure download string safely in window
      window.open(data.signedUrl, "_blank");
    } catch (err) {
      console.error("Secure link resolution fault:", err);
    }
  };

  const handleCopyCredentials = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const staggerContainer: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
  const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="flex h-screen w-screen bg-[#06060f] overflow-hidden font-sans antialiased text-zinc-100 selection:bg-purple-500/30">
      <style jsx global>{`
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-50px) scale(1.05)} 66%{transform:translate(-20px,30px) scale(0.95)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-30px,20px) scale(1.05)} 70%{transform:translate(20px,-30px) scale(0.95)} }
      `}</style>

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div style={{ animation: "orb1 20s ease-in-out infinite" }} className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-purple-900/15 blur-[120px]" />
        <div style={{ animation: "orb2 25s ease-in-out infinite" }} className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full bg-indigo-900/10 blur-[130px]" />
      </div>

      <motion.aside initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="w-64 bg-[#09090f]/80 backdrop-blur-xl border-r border-zinc-800/60 flex flex-col justify-between h-full relative z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-12 pl-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-900/30"><Layers className="w-4 h-4 text-white" /></div>
            <span className="text-xl font-black tracking-tight text-white">ClientSprint</span>
          </div>
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-800/50 text-white font-semibold rounded-xl border border-zinc-700/50 shadow-sm transition-all"><LayoutGrid className="w-4 h-4 text-purple-400" /><span className="text-sm">Overview</span></button>
            <button onClick={() => setIsCreateModalOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800/30 font-medium rounded-xl transition-all"><PlusCircle className="w-4 h-4" /><span className="text-sm">Create Portal</span></button>
          </nav>
        </div>
        <div className="p-6 space-y-4">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-red-400 font-medium transition-colors"><LogOut className="w-4 h-4" /><span className="text-sm">Sign Out</span></button>
        </div>
      </motion.aside>

      <main className="flex-1 relative overflow-y-auto z-10">
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="p-10 max-w-6xl mx-auto space-y-10 mt-4">
          <motion.header variants={fadeUp} className="flex items-center justify-between">
            <div className="space-y-1.5"><h1 className="text-3xl font-bold tracking-tight text-white">Agency Core</h1><p className="text-zinc-400 font-medium text-sm">Manage and monitor active onboarding sprints effortlessly.</p></div>
            <div className="flex items-center gap-4">
              <button onClick={fetchPipelines} className="h-10 w-10 rounded-xl bg-[#09090f] border border-zinc-800 shadow-sm flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"><RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} /></button>
              <button onClick={() => setIsCreateModalOpen(true)} className="h-10 px-5 rounded-xl bg-white text-zinc-950 font-bold text-sm flex items-center gap-2 hover:bg-zinc-200 transition-all"><Plus className="w-4 h-4" /><span>Create Pipeline</span></button>
            </div>
          </motion.header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="bg-[#0c0c14]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between min-h-[140px] transition-all duration-300">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Active Links Deployed</span>
              <div className="space-y-4 mt-3">
                <span className="text-4xl font-bold text-white tracking-tight">{pipelines.length}</span>
                <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: pipelines.length > 0 ? "100%" : "0%" }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full" /></div>
              </div>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} layout className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-white">Live Client Tunnels</h2>
            
            {isLoadingData ? (<div className="flex justify-center py-10 opacity-50"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>) : pipelines.length === 0 ? (
              <div className="bg-[#0c0c14]/50 border border-zinc-800/50 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center"><Layers className="w-8 h-8 text-zinc-600 mb-3" /><h3 className="text-sm font-bold text-zinc-300">No pipelines active</h3></div>
            ) : (
              <motion.div layout className="space-y-4">
                {pipelines.map((pipeline) => {
                  const tasksCompleted = pipeline.completed_tasks?.length || 0;
                  const progressPct = Math.round((tasksCompleted / 3) * 100);
                  const isDone = progressPct === 100;
                  const isExpanded = expandedPipelineId === pipeline.id;

                  return (
                    <motion.div 
                      key={pipeline.id} 
                      layout
                      onClick={() => setExpandedPipelineId(isExpanded ? null : pipeline.id)}
                      className={`bg-[#0c0c14]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 flex flex-col group transition-all cursor-pointer
                        ${isExpanded ? 'border-purple-500/40 shadow-[0_0_50px_rgba(139,92,246,0.03)]' : 'hover:border-zinc-700'}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-bold text-white">{pipeline.client_name}</h3>
                            {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <p className="text-sm font-medium text-zinc-500">{pipeline.project_scope}</p>
                          
                          <div className="max-w-xs mt-2 flex items-center gap-3">
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-1000 ${isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-600 to-indigo-500'}`} style={{ width: `${progressPct}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 w-8">{progressPct}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/p/${pipeline.id}`} target="_blank" className="h-9 px-4 rounded-lg bg-zinc-800/50 border border-zinc-700 text-zinc-300 font-semibold text-xs flex items-center gap-2 hover:bg-white hover:text-zinc-950 transition-all">
                            <span>Launch Link</span><ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {/* EXPANDABLE DRAWER: Dynamic Asset Retrieval Panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: "auto", opacity: 1, marginTop: 20 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            className="overflow-hidden border-t border-zinc-800/60 pt-5 flex flex-col gap-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <h4 className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">Collected Vault Assets</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* Asset 1: High Res Logos */}
                              <div className={`rounded-xl border p-4 flex items-center justify-between ${pipeline.completed_tasks?.includes("logo") ? 'bg-purple-500/5 border-purple-500/20' : 'bg-zinc-900/30 border-zinc-800/80 opacity-50'}`}>
                                <div>
                                  <p className="text-xs font-bold text-zinc-200">High-Res Logos</p>
                                  <p className="text-[10px] text-zinc-500 mt-0.5">{pipeline.completed_tasks?.includes("logo") ? "Ready to download" : "Awaiting client upload"}</p>
                                </div>
                                {pipeline.completed_tasks?.includes("logo") && (
                                  <button onClick={() => triggerDownload(pipeline.id, "logo")} className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all">
                                    <DownloadCloud className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              {/* Asset 2: Brand Guidelines */}
                              <div className={`rounded-xl border p-4 flex items-center justify-between ${pipeline.completed_tasks?.includes("brand") ? 'bg-purple-500/5 border-purple-500/20' : 'bg-zinc-900/30 border-zinc-800/80 opacity-50'}`}>
                                <div>
                                  <p className="text-xs font-bold text-zinc-200">Brand Guidelines</p>
                                  <p className="text-[10px] text-zinc-500 mt-0.5">{pipeline.completed_tasks?.includes("brand") ? "Ready to download" : "Awaiting client upload"}</p>
                                </div>
                                {pipeline.completed_tasks?.includes("brand") && (
                                  <button onClick={() => triggerDownload(pipeline.id, "brand")} className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all">
                                    <DownloadCloud className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              {/* Asset 3: Secure Domain Vault Credentials */}
                              <div className={`rounded-xl border p-4 flex items-center justify-between ${pipeline.completed_tasks?.includes("domain") ? 'bg-purple-500/5 border-purple-500/20' : 'bg-zinc-900/30 border-zinc-800/80 opacity-50'}`}>
                                <div className="flex-1 mr-2 overflow-hidden">
                                  <p className="text-xs font-bold text-zinc-200">Secure Password Vault</p>
                                  {pipeline.completed_tasks?.includes("domain") && pipeline.vault_credentials ? (
                                    <p className="text-[10px] font-mono text-zinc-400 mt-1 truncate bg-zinc-950 p-1 rounded border border-zinc-800/50">••••••••••••</p>
                                  ) : (
                                    <p className="text-[10px] text-zinc-500 mt-0.5">Awaiting client submission</p>
                                  )}
                                </div>
                                {pipeline.completed_tasks?.includes("domain") && pipeline.vault_credentials && (
                                  <button 
                                    onClick={() => handleCopyCredentials(pipeline.vault_credentials!, pipeline.id)} 
                                    className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all flex-shrink-0"
                                    title="Copy Credentials to Clipboard"
                                  >
                                    {copiedId === pipeline.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </main>

      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isDeploying && setIsCreateModalOpen(false)} className="absolute inset-0 bg-[#06060f]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-[#0c0c14] border border-zinc-800 shadow-[0_0_60px_-15px_rgba(139,92,246,0.2)] rounded-3xl p-8 overflow-hidden">
              <button onClick={() => setIsCreateModalOpen(false)} disabled={isDeploying} className="absolute top-6 right-6 text-zinc-500 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 p-2 rounded-full"><X className="w-4 h-4" /></button>
              <div className="mb-8"><h2 className="text-2xl font-black text-white">New Pipeline</h2></div>
              <form onSubmit={handleDeploy} className="space-y-5">
                <div className="space-y-2 relative"><User className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" /><input type="text" required disabled={isDeploying} value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client Name" className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#09090f] border border-zinc-800 text-white placeholder-zinc-600 focus:border-purple-500/50 focus:outline-none text-sm" /></div>
                <div className="space-y-2 relative"><Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" /><input type="text" required disabled={isDeploying} value={projectScope} onChange={(e) => setProjectScope(e.target.value)} placeholder="Project Scope" className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#09090f] border border-zinc-800 text-white placeholder-zinc-600 focus:border-purple-500/50 focus:outline-none text-sm" /></div>
                <div className="pt-4"><button type="submit" disabled={isDeploying || !clientName || !projectScope} className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">{isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Deploy Tunnel</span>}</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
