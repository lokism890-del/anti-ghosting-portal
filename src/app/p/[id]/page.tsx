"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, CheckCircle2, UploadCloud, Type, Key, Lock, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Pipeline {
  id: string;
  client_name: string;
  project_scope: string;
  status: string;
  completed_tasks: string[] | null;
}

export default function ClientPortal() {
  const params = useParams();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingTask, setUploadingTask] = useState<string | null>(null);
  
  // Vault state
  const [showVaultForm, setShowVaultForm] = useState(false);
  const [credentialsText, setCredentialsText] = useState("");
  const [isVaultSubmitting, setIsVaultSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchPortalData = async () => {
      const portalId = params?.id;
      if (!portalId) return;
      
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("id", portalId)
        .single();

      if (!error && data) {
        setPipeline(data);
        // If credentials are already submitted, make sure form doesn't display
        if (data.completed_tasks?.includes("domain")) {
          setShowVaultForm(false);
        }
      }
      setLoading(false);
    };

    fetchPortalData();
  }, [params]);

  const handleTaskAction = (taskId: string, type: string) => {
    const currentTasks = pipeline?.completed_tasks || [];
    if (currentTasks.includes(taskId)) return;

    if (type === "upload") {
      const fileInput = document.getElementById(`file-upload-${taskId}`) as HTMLInputElement;
      if (fileInput) fileInput.click();
    } else if (type === "vault") {
      setShowVaultForm((prev) => !prev);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
    const file = e.target.files?.[0];
    if (!file || !pipeline) return;

    setUploadingTask(taskId);
    
    const filePath = `${pipeline.id}/${taskId}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('client_assets')
      .upload(filePath, file);

    if (!uploadError) {
      await markTaskComplete(taskId);
    } else {
      console.error("Upload failed", uploadError);
      alert("Upload failed. Make sure storage bucket configuration is valid.");
    }
    
    setUploadingTask(null);
  };

  const handleVaultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialsText.trim() || !pipeline) return;

    setIsVaultSubmitting(true);
    
    // Save to the secret column and append task completion
    const currentTasks = pipeline.completed_tasks || [];
    const newTasks = [...currentTasks, "domain"];

    const { error } = await supabase
      .from("pipelines")
      .update({ 
        vault_credentials: credentialsText.trim(),
        completed_tasks: newTasks
      })
      .eq("id", pipeline.id);

    if (!error) {
      setPipeline({ ...pipeline, completed_tasks: newTasks });
      setShowVaultForm(false);
      setCredentialsText("");
    } else {
      console.error("Vault submission failed:", error);
    }
    setIsVaultSubmitting(false);
  };

  const markTaskComplete = async (taskId: string) => {
    if (!pipeline) return;
    const currentTasks = pipeline.completed_tasks || [];
    if (currentTasks.includes(taskId)) return;
    
    const newTasks = [...currentTasks, taskId];
    await supabase.from("pipelines").update({ completed_tasks: newTasks }).eq("id", pipeline.id);
    setPipeline({ ...pipeline, completed_tasks: newTasks });
  };

  const tasks = [
    { id: "logo", title: "High-Res Logos", desc: "Upload SVG or transparent PNG formats.", icon: UploadCloud, type: "upload" },
    { id: "brand", title: "Brand Guidelines", desc: "Colors, typography, and voice documentation.", icon: Type, type: "upload" },
    { id: "domain", title: "Domain Access", desc: "Registrar login credentials (securely vaulted).", icon: Key, type: "vault" },
  ];

  if (loading) return <div className="min-h-screen bg-[#06060f] flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>;
  if (!pipeline) return <div className="min-h-screen bg-[#06060f] flex flex-col items-center justify-center text-white"><Lock className="w-12 h-12 text-zinc-600 mb-4" /><h1 className="text-2xl font-bold">Portal Not Found</h1></div>;

  const completedCount = pipeline.completed_tasks?.length || 0;
  const progress = Math.round((completedCount / tasks.length) * 100);

  return (
    <main className="min-h-screen bg-[#06060f] text-zinc-50 selection:bg-purple-500/30 font-sans antialiased relative overflow-x-hidden">
      
      <style jsx global>{`
        @keyframes shimmerBtn { from{left:-80%} to{left:160%} }
        .btn-shimmer:hover::after {
          content:'';position:absolute;top:0;width:50%;height:100%;
          background:rgba(255,255,255,0.10);transform:skewX(-15deg);
          animation:shimmerBtn 0.55s ease-out forwards;pointer-events:none;
        }
        .btn-shimmer { position:relative; overflow:hidden; }
      `}</style>

      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-900/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(139,92,246,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start mb-16 border-b border-zinc-800/80 pb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-6">
              <Lock className="w-3 h-3" /> Secure Client Tunnel
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">Welcome, <br/><span className="text-zinc-400">{pipeline.client_name}</span></h1>
            <p className="text-lg text-zinc-500 font-medium">Scope: {pipeline.project_scope}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <Layers className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-xl font-bold text-white">Project Requirements</h2>
            <span className="text-3xl font-black text-white">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.5)]" />
          </div>
        </motion.div>

        {/* Requirements Stack Wrapper */}
        <motion.div layout className="space-y-4">
          {tasks.map((task, index) => {
            const currentCompleted = pipeline.completed_tasks || [];
            const isCompleted = currentCompleted.includes(task.id);
            const isUploading = uploadingTask === task.id;
            const isVaultOpen = task.type === "vault" && showVaultForm && !isCompleted;
            const Icon = task.icon;
            
            return (
              <motion.div 
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.2 + (index * 0.1), layout: { type: "spring", stiffness: 300, damping: 26 } }}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-center
                  ${isCompleted ? 'bg-purple-500/5 border-purple-500/30' : 'bg-[#09090f]/80 border-zinc-800/80 hover:bg-zinc-900'} 
                  ${isVaultOpen ? 'border-purple-500/40 bg-[#0c0c14]/90 shadow-[0_0_40px_rgba(139,92,246,0.05)]' : ''}`}
              >
                {/* Clickable Card Header Row */}
                <div 
                  onClick={() => handleTaskAction(task.id, task.type)}
                  className={`flex items-center gap-5 w-full ${isCompleted ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {task.type === "upload" && !isCompleted && (
                    <input 
                      id={`file-upload-${task.id}`}
                      type="file" 
                      onChange={(e) => handleFileUpload(e, task.id)} 
                      className="hidden" 
                    />
                  )}

                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors relative z-10 flex-shrink-0
                    ${isCompleted ? 'bg-purple-500 border-purple-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'border-zinc-700 group-hover:border-purple-500/50'}`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isUploading ? <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> : null}
                  </div>

                  <div className="flex-1 relative z-10">
                    <h3 className={`text-base font-bold transition-colors ${isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>{task.title}</h3>
                    <p className="text-xs text-zinc-500">{isUploading ? 'Uploading file securely...' : task.desc}</p>
                  </div>

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative z-10 flex-shrink-0
                    ${isCompleted ? 'bg-purple-500/10 text-purple-400' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700'}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* SLIDE DOWN VAULT FORM PANEL */}
                <AnimatePresence>
                  {isVaultOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                      className="overflow-hidden w-full border-t border-zinc-800/60 pt-6 relative z-30"
                      onClick={(e) => e.stopPropagation()} // Stop click bubbling to wrapper
                    >
                      <form onSubmit={handleVaultSubmit} className="space-y-4">
                        <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3.5 flex items-start gap-3 mb-2">
                          <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Credentials entered here are isolated outside plain chats. All inputs are masked and hidden dynamically.
                          </p>
                        </div>

                        <div className="space-y-1.5 relative">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 pl-1">Access Keys / Password Matrix</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"} 
                              required 
                              disabled={isVaultSubmitting}
                              value={credentialsText}
                              onChange={(e) => setCredentialsText(e.target.value)}
                              placeholder="Paste GoDaddy/Namecheap logins, API secrets, or server notes..."
                              className="w-full h-12 pl-4 pr-12 rounded-xl bg-[#06060f] border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-purple-500/40 font-mono transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-3.5 text-zinc-600 hover:text-zinc-400 transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <motion.button 
                            type="submit"
                            disabled={isVaultSubmitting || !credentialsText.trim()}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-shimmer h-10 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-md hover:shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {isVaultSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <span>Lock to Vault</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </motion.button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })}
        </motion.div>

        {/* Completion Box */}
        {progress === 100 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 text-center relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.1)]">
            <h3 className="text-2xl font-black text-white mb-2 relative z-10">You're all set!</h3>
            <p className="text-zinc-400 font-medium relative z-10 mb-6">Our team has received everything we need. The project will begin shortly.</p>
            <Link 
              href="/" 
              className="relative z-10 inline-flex items-center justify-center gap-2 h-12 px-6 bg-white text-zinc-950 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-all"
            >
              Return to Website <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}