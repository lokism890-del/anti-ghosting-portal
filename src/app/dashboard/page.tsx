"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Layers, LayoutGrid, PlusCircle, LogOut, RefreshCw, Plus, Search,
  ExternalLink, X, User, Briefcase, Loader2, CheckCircle2,
  DownloadCloud, Copy, Check, Link2, Key, FolderOpen, Mail, Clock,
  Archive, Trash2, ShieldAlert, BarChart3, Package, Percent, Settings, 
  CheckSquare, Square, PlusSquare
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// --- TYPES ---
interface LogEntry {
  event: string;
  timestamp: string;
}

interface Pipeline {
  id: string;
  client_name: string;
  project_scope: string;
  status: string;
  completed_tasks: string[] | null;
  vault_credentials: string | null;
  tunnel_url: string | null;
  client_email: string | null;
  archived_at: string | null;
  activity_logs: LogEntry[] | null;
  required_tasks: string[] | null;
  target_notes: string | null;
}

type DashboardView = "overview" | "master-vault" | "global-assets" | "settings";
type StatusFilter = "all" | "pending" | "completed" | "archived";

export default function AgencyCoreDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [clientName, setClientName] = useState("");
  const [projectScope, setProjectScope] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Advanced State Controllers
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPipelineIds, setSelectedPipelineIds] = useState<string[]>([]);
  
  // Persistent Sidebar Panel State
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [isNudging, setIsNudging] = useState<boolean>(false);

  // Global Rules Matrix Configurations
  const [availableRules, setAvailableRules] = useState<string[]>(["logo", "brand", "domain"]);
  const [activeSelectedRules, setActiveSelectedRules] = useState<string[]>(["logo", "brand", "domain"]);
  const [newRuleInput, setNewRuleInput] = useState("");
  const [fallbackNotes, setFallbackNotes] = useState("Requirements verification pipeline active.");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // --- INITIAL DATA FETCH ---
  useEffect(() => { 
    fetchPipelines();
    fetchGlobalAgencySettings();
  }, []);

  // --- THE REAL-TIME SOLUTION ENGINE (FIX FOR image_46a717.png) ---
  useEffect(() => {
    // Open a persistent live websocket pipeline straight to your Supabase instance
    const realtimeChannel = supabase
      .channel("dashboard-realtime-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pipelines" },
        (payload) => {
          // 1. Handle background update mutations (e.g., client drops a file or types text)
          if (payload.eventType === "UPDATE") {
            const updatedRow = payload.new as Pipeline;
            setPipelines(prev => prev.map(item => item.id === updatedRow.id ? updatedRow : item));
          }
          // 2. Handle background insert updates (e.g., new layout links spawned)
          else if (payload.eventType === "INSERT") {
            const newRow = payload.new as Pipeline;
            setPipelines(prev => [newRow, ...prev]);
          }
          // 3. Handle background row delete executions
          else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id: string };
            setPipelines(prev => prev.filter(item => item.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    // Clean up connections thread on component layout teardown
    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  // Sync right persistent asset bar variables when master records fluctuate
  useEffect(() => {
    if (selectedPipeline) {
      const updated = pipelines.find(p => p.id === selectedPipeline.id);
      setSelectedPipeline(updated || null);
    }
  }, [pipelines]);

  const fetchGlobalAgencySettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("agency_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        if (data.available_tasks) {
          setAvailableRules(data.available_tasks);
          setActiveSelectedRules(data.available_tasks);
        }
        if (data.fallback_notes) setFallbackNotes(data.fallback_notes);
      }
    }
  };

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
      const placeholderId = crypto.randomUUID();
      const generatedLink = `${window.location.origin}/p/${placeholderId}`;
      const initialLogs: LogEntry[] = [{ event: "Pipeline deployed successfully", timestamp: new Date().toLocaleTimeString() }];

      const { error } = await supabase
        .from("pipelines")
        .insert([{ 
          id: placeholderId,
          user_id: user.id, 
          client_name: clientName, 
          project_scope: projectScope, 
          status: "pending", 
          completed_tasks: [],
          tunnel_url: generatedLink,
          client_email: clientEmail.trim() || null,
          archived_at: null,
          activity_logs: initialLogs,
          required_tasks: activeSelectedRules,
          target_notes: fallbackNotes
        }]);
        
      if (!error) {
        setIsCreateModalOpen(false);
        setClientName("");
        setProjectScope("");
        setClientEmail("");
      }
    }
    setIsDeploying(false);
  };

  const appendLogEntry = async (pipelineId: string, eventText: string) => {
    const pipe = pipelines.find(p => p.id === pipelineId);
    if (!pipe) return;

    const currentLogs = pipe.activity_logs || [];
    const newLogs: LogEntry[] = [{ event: eventText, timestamp: new Date().toLocaleTimeString() }, ...currentLogs];

    await supabase.from("pipelines").update({ activity_logs: newLogs }).eq("id", pipelineId);
  };

  const handleCopyAction = (text: string, pipelineId: string, type: "vault" | "link") => {
    navigator.clipboard.writeText(text);
    if (type === "vault") {
      setCopiedId(pipelineId);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedLinkId(pipelineId);
      setTimeout(() => setCopiedLinkId(null), 2000);
    }
  };

  const toggleSelectPipeline = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPipelineIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const executeBatchArchive = async () => {
    if (selectedPipelineIds.length === 0) return;
    const timestamp = new Date().toISOString();
    const { error } = await supabase.from("pipelines").update({ archived_at: timestamp }).in("id", selectedPipelineIds);
    if (!error) setSelectedPipelineIds([]);
  };

  const executeBatchDelete = async () => {
    if (selectedPipelineIds.length === 0 || !confirm("Delete all selected entries permanently?")) return;
    const { error } = await supabase.from("pipelines").delete().in("id", selectedPipelineIds);
    if (!error) {
      setSelectedPipelineIds([]);
      setSelectedPipeline(null);
    }
  };

  const toggleArchivePipeline = async (id: string, currentlyArchived: boolean) => {
    const timestamp = currentlyArchived ? null : new Date().toISOString();
    const { error } = await supabase.from("pipelines").update({ archived_at: timestamp }).eq("id", id);
    if (!error) {
      appendLogEntry(id, currentlyArchived ? "Pipeline unarchived" : "Pipeline pushed to archive storage");
    }
  };

  const hardDeletePipeline = async (id: string) => {
    if (!confirm("Permanently wipe this record?")) return;
    const { error } = await supabase.from("pipelines").delete().eq("id", id);
    if (!error && selectedPipeline?.id === id) setSelectedPipeline(null);
  };

  const handleEmailNudge = async (pipeline: Pipeline) => {
    if (!pipeline.client_email) return;
    setIsNudging(true);
    const doneCount = pipeline.completed_tasks?.length || 0;
    const percent = Math.round((doneCount / 3) * 100);
    const tasksLeft = 3 - doneCount;

    try {
      const response = await fetch("/api/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: pipeline.client_name,
          client_email: pipeline.client_email,
          project_scope: pipeline.project_scope,
          percent,
          tasks_left: tasksLeft,
          tunnel_url: pipeline.tunnel_url
        }),
      });
      if (response.ok) {
        await appendLogEntry(pipeline.id, "Nudge email reminder dispatched");
        alert("Email dispatched smoothly!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsNudging(false);
    }
  };

  const triggerDownload = async (pipelineId: string, taskId: string) => {
    const { data: files } = await supabase.storage.from("client_assets").list(pipelineId, { search: taskId });
    const targetFile = files?.find(f => f.name.startsWith(taskId));
    if (!targetFile) return;
    const { data } = await supabase.storage.from("client_assets").createSignedUrl(`${pipelineId}/${targetFile.name}`, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const handleAddNewRule = () => {
    if (!newRuleInput.trim()) return;
    const sanitizedRule = newRuleInput.trim().toLowerCase();
    if (!availableRules.includes(sanitizedRule)) {
      setAvailableRules(prev => [...prev, sanitizedRule]);
      setActiveSelectedRules(prev => [...prev, sanitizedRule]);
    }
    setNewRuleInput("");
  };

  const handleRemoveRuleFromSystem = (rule: string) => {
    setAvailableRules(prev => prev.filter(r => r !== rule));
    setActiveSelectedRules(prev => prev.filter(r => r !== rule));
  };

  const handleUpdateGlobalRulesMatrix = async () => {
    setIsSavingSettings(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from("agency_settings")
        .upsert({
          user_id: user.id,
          available_tasks: availableRules,
          fallback_notes: fallbackNotes,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (!error) alert("Global rules configuration saved & updated successfully.");
    }
    setIsSavingSettings(false);
  };

  const toggleRuleSelection = (rule: string) => {
    setActiveSelectedRules(prev => prev.includes(rule) ? prev.filter(r => r !== rule) : [...prev, rule]);
  };

  // --- RE-CALCULATED PROPERTIES ---
  const activePipelines = pipelines.filter(p => p.archived_at === null);
  const archivedPipelines = pipelines.filter(p => p.archived_at !== null);

  const filteredPipelines = pipelines.filter(p => {
    const matchesSearch = p.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || p.project_scope.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === "archived") return p.archived_at !== null;
    if (p.archived_at !== null) return false;
    const done = p.completed_tasks?.length || 0;
    if (statusFilter === "pending") return done < 3;
    if (statusFilter === "completed") return done === 3;
    return true;
  });

  const totalActiveSprints = activePipelines.length;
  const completedDecksCount = activePipelines.filter(p => (p.completed_tasks?.length || 0) === 3).length;
  const averageCompletion = totalActiveSprints > 0 ? Math.round((activePipelines.reduce((a, c) => a + (c.completed_tasks?.length || 0), 0) / (totalActiveSprints * 3)) * 100) : 0;

  const staggerContainer: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
  const fadeUp: Variants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 }, exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } } };

  return (
    <div className="flex h-screen w-screen bg-[#06060f] overflow-hidden font-sans antialiased text-zinc-100 selection:bg-purple-500/30 relative">
      <style jsx global>{`
        .premium-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .premium-scroll::-webkit-scrollbar-track { background: transparent; }
        .premium-scroll::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0); border-radius: 10px; }
        .premium-scroll:hover::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.45); }
      `}</style>

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[130px]" />
      </div>

      {/* --- SIDEBAR PANEL --- */}
      <motion.aside className="w-64 bg-[#09090f]/90 backdrop-blur-xl border-r border-zinc-900 flex flex-col justify-between h-full relative z-20 flex-shrink-0 select-none">
        <div className="p-6 flex flex-col h-full overflow-y-auto premium-scroll">
          <div className="flex items-center gap-3 mb-10 pl-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center"><Layers className="w-4 h-4 text-white" /></div>
            <span className="text-xl font-black tracking-tight text-white">ClientSprint</span>
          </div>

          <div className="space-y-1.5 mb-7">
            <span className="text-[10px] font-black tracking-widest text-zinc-600 uppercase pl-4">Core Engine</span>
            <button onClick={() => { setActiveView("overview"); setStatusFilter("all"); }} className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-xl border text-left transition-all ${activeView === "overview" && statusFilter !== "archived" ? 'bg-zinc-800/40 text-white border-zinc-800' : 'border-transparent text-zinc-400 hover:text-white'}`}><LayoutGrid className="w-4 h-4 text-purple-400" /><span className="text-sm">Overview</span></button>
            <button onClick={() => { setActiveView("settings"); setSelectedPipeline(null); }} className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-xl border text-left transition-all ${activeView === "settings" ? 'bg-zinc-800/40 text-white border-zinc-800' : 'border-transparent text-zinc-400 hover:text-white'}`}><Settings className="w-4 h-4 text-zinc-500" /><span className="text-sm">Global Rules</span></button>
          </div>

          <div className="space-y-1.5 mb-7">
            <span className="text-[10px] font-black tracking-widest text-zinc-600 uppercase pl-4">Management Vaults</span>
            <button onClick={() => { setActiveView("master-vault"); setSelectedPipeline(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 font-bold rounded-xl text-left transition-all ${activeView === "master-vault" ? 'bg-zinc-800/40 text-white' : 'text-zinc-400 hover:text-white'}`}><Key className="w-4 h-4 text-amber-400" /><span className="text-sm">Master Vault</span></button>
            <button onClick={() => { setActiveView("global-assets"); setSelectedPipeline(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 font-bold rounded-xl text-left transition-all ${activeView === "global-assets" ? 'bg-zinc-800/40 text-white' : 'text-zinc-400 hover:text-white'}`}><DownloadCloud className="w-4 h-4 text-blue-400" /><span className="text-sm">Global Assets</span></button>
          </div>

          <div className="space-y-1 flex-1">
            <span className="text-[10px] font-black tracking-widest text-zinc-600 uppercase pl-4">Pipeline Status</span>
            <div className="space-y-0.5 pt-1">
              <button onClick={() => { setActiveView("overview"); setStatusFilter("all"); }} className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-bold ${statusFilter === "all" && activeView === "overview" ? 'bg-zinc-800/20 text-white' : 'text-zinc-400'}`}>
                <div className="flex items-center gap-2.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /><span>All Sprints</span></div><span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded font-black">{activePipelines.length}</span>
              </button>
              <button onClick={() => { setActiveView("overview"); setStatusFilter("pending"); }} className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-bold ${statusFilter === "pending" && activeView === "overview" ? 'bg-zinc-800/20 text-white' : 'text-zinc-400'}`}>
                <div className="flex items-center gap-2.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /><span>Pending</span></div><span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded font-black">{activePipelines.filter(p => (p.completed_tasks?.length || 0) < 3).length}</span>
              </button>
              <button onClick={() => { setActiveView("overview"); setStatusFilter("completed"); }} className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-bold ${statusFilter === "completed" && activeView === "overview" ? 'bg-zinc-800/20 text-white' : 'text-zinc-400'}`}>
                <div className="flex items-center gap-2.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span>Completed</span></div><span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded font-black">{activePipelines.filter(p => (p.completed_tasks?.length || 0) === 3).length}</span>
              </button>
              <button onClick={() => { setActiveView("overview"); setStatusFilter("archived"); setSelectedPipeline(null); }} className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-bold mt-4 ${statusFilter === "archived" && activeView === "overview" ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-zinc-500'}`}>
                <div className="flex items-center gap-2.5"><Archive className="w-3.5 h-3.5" /><span>Archive Deck</span></div><span className="text-[10px] bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded font-black">{archivedPipelines.length}</span>
              </button>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-4"><button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-red-400 font-black uppercase tracking-wider text-xs"><LogOut className="w-4 h-4" /><span>Sign Out</span></button></div>
        </div>
      </motion.aside>

      {/* --- DISPLAY MATRIX --- */}
      <main className="flex-1 relative flex overflow-hidden z-10">
        
        {/* VIEW 1: OVERVIEW ENGINE */}
        {activeView === "overview" && (
          <div className="flex-1 overflow-y-auto p-10 space-y-10 premium-scroll">
            <motion.header className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-white uppercase">{statusFilter === "archived" ? "Archive Storage" : "Agency Core"}</h1>
                <p className="text-zinc-400 font-semibold text-sm">Real-time onboarding operations hub dashboard.</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsCreateModalOpen(true)} className="h-10 px-5 rounded-xl bg-white text-zinc-950 font-black text-sm flex items-center gap-2 shadow-md"><Plus className="w-4 h-4" /><span>Create Pipeline</span></button>
              </div>
            </motion.header>

            {statusFilter !== "archived" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-[#0d0d16]/70 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
                  <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Active Sprints</span><BarChart3 className="w-4 h-4 text-purple-400" /></div>
                  <h3 className="text-3xl font-black text-white mt-1 tracking-tight">{totalActiveSprints}</h3>
                  <div className="h-6 w-full mt-2"><svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0 25 Q15 10, 30 20 T60 5 T90 15 L100 12 L100 30 L0 30 Z" fill="rgba(168,85,247,0.08)"/><path d="M0 25 Q15 10, 30 20 T60 5 T90 15 L100 12" fill="none" stroke="#a855f7" strokeWidth="1.5"/></svg></div>
                </div>
                <div className="bg-[#0d0d16]/70 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
                  <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Asset Decks Secured</span><Package className="w-4 h-4 text-blue-400" /></div>
                  <h3 className="text-3xl font-black text-white mt-1 tracking-tight">{completedDecksCount}</h3>
                  <div className="h-6 w-full mt-2"><svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0 28 L20 22 L45 25 L70 12 L100 2 L100 30 L0 30 Z" fill="rgba(59,130,246,0.08)"/><path d="M0 28 L20 22 L45 25 L70 12 L100 2" fill="none" stroke="#3b82f6" strokeWidth="1.5"/></svg></div>
                </div>
                <div className="bg-[#0d0d16]/70 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
                  <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Global Progress Matrix</span><Percent className="w-4 h-4 text-emerald-400" /></div>
                  <h3 className="text-3xl font-black text-white mt-1 tracking-tight">{averageCompletion}%</h3>
                  <div className="h-6 w-full mt-2"><svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0 25 Q25 28, 50 15 T100 5 L100 30 L0 30 Z" fill="rgba(16,185,129,0.08)"/><path d="M0 25 Q25 28, 50 15 T100 5" fill="none" stroke="#10b981" strokeWidth="1.5"/></svg></div>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[#09090f]/60 p-4 border border-zinc-900 rounded-2xl">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-600" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter active workflows instantly..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#06060f] border border-zinc-800 text-xs font-bold text-white focus:outline-none focus:border-purple-500/50" />
              </div>

              {selectedPipelineIds.length > 0 && (
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-lg text-purple-400 font-mono">{selectedPipelineIds.length} Selected</span>
                  <button onClick={executeBatchArchive} className="h-9 px-4 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-black text-zinc-300 flex items-center gap-1.5 hover:text-white"><Archive className="w-3.5 h-3.5" /><span>Batch Archive</span></button>
                  <button onClick={executeBatchDelete} className="h-9 px-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-xs font-black flex items-center gap-1.5 hover:bg-red-600 hover:text-white"><Trash2 className="w-3.5 h-3.5" /><span>Batch Delete</span></button>
                </motion.div>
              )}
            </div>

            <div className="space-y-4">
              {filteredPipelines.length === 0 ? (
                <div className="bg-[#0c0c14]/30 border border-zinc-800/60 border-dashed rounded-2xl p-12 text-center text-zinc-500 italic font-bold">No active pipelines found matching parameters.</div>
              ) : (
                <motion.div variants={staggerContainer} initial="hidden" animate="show" layout className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filteredPipelines.map((pipeline) => {
                      const doneCount = pipeline.completed_tasks?.length || 0;
                      const totalTasks = pipeline.required_tasks?.length || 3;
                      const percent = Math.round((doneCount / totalTasks) * 100) || 0;
                      const isSelected = selectedPipelineIds.includes(pipeline.id);

                      return (
                        <motion.div 
                          key={pipeline.id} variants={fadeUp} layout exit="exit"
                          onClick={() => setSelectedPipeline(pipeline)}
                          className={`p-5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer bg-[#0c0c14]/40 ${selectedPipeline?.id === pipeline.id ? 'border-purple-500/50 bg-[#0c0c14]/80' : 'border-zinc-800/80'}`}
                        >
                          <div className="flex items-center gap-4 flex-1 pr-6">
                            <div onClick={(e) => toggleSelectPipeline(pipeline.id, e)} className="text-zinc-600 hover:text-purple-400 transition-colors">
                              {isSelected ? <CheckSquare className="w-5 h-5 text-purple-500" /> : <Square className="w-5 h-5" />}
                            </div>
                            
                            <div className="space-y-1 flex-1">
                              <h3 className="text-base font-extrabold text-white uppercase tracking-wide">{pipeline.client_name}</h3>
                              <p className="text-xs text-zinc-400 font-bold">Scope: {pipeline.project_scope}</p>
                              <div className="w-36 h-1.5 bg-zinc-800/80 rounded-full overflow-hidden mt-1.5">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                            <Link href={`/p/${pipeline.id}`} target="_blank" className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"><ExternalLink className="w-3.5 h-3.5" /></Link>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: MASTER VAULT */}
        {activeView === "master-vault" && (
          <div className="flex-1 overflow-y-auto p-10 space-y-10 premium-scroll">
            <h1 className="text-3xl font-black text-white uppercase">Master Vault Matrix</h1>
            <div className="bg-[#0c0c14]/50 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-[#09090f]/60 text-[10px] font-black uppercase text-zinc-500"><th className="p-4 pl-6">Client Identity</th><th className="p-4">Project Scope</th><th className="p-4">Vaulted Key Data</th><th className="p-4 text-center">Operational Administration</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40 text-sm font-bold">
                  {pipelines.filter(p => p.vault_credentials).map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-900/20">
                      <td className="p-4 pl-6 text-white uppercase font-black">{p.client_name}</td>
                      <td className="p-4 text-zinc-400">{p.project_scope}</td>
                      <td className="p-4 font-mono text-xs text-amber-400 truncate max-w-xs">{p.vault_credentials}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleCopyAction(p.vault_credentials!, p.id, "vault")} className="h-8 px-3 rounded-lg bg-zinc-800 text-xs font-black border border-zinc-700">{copiedId === p.id ? "Copied" : "Copy Keys"}</button>
                          <button onClick={() => toggleArchivePipeline(p.id, p.archived_at !== null)} className={`h-8 w-8 rounded-lg border flex items-center justify-center ${p.archived_at ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-zinc-400 border-zinc-700 bg-zinc-800'}`}><Archive className="w-4 h-4" /></button>
                          <button onClick={() => hardDeletePipeline(p.id)} className="h-8 w-8 rounded-lg bg-zinc-800 border border-red-950/40 text-red-400 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: GLOBAL ASSETS FILE MATRIX */}
        {activeView === "global-assets" && (
          <div className="flex-1 overflow-y-auto p-10 space-y-10 premium-scroll">
            <h1 className="text-3xl font-black text-white uppercase">Global Assets Deck</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pipelines.filter(p => p.completed_tasks && p.completed_tasks.length > 0).map((p) => (
                <div key={p.id} className="bg-[#0c0c14]/60 border border-zinc-800/80 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h3 className="text-base font-black text-white uppercase tracking-wide">{p.client_name} Deck</h3>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleArchivePipeline(p.id, p.archived_at !== null)} className="h-6 w-6 rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400"><Archive className="w-3" /></button>
                      <button onClick={() => hardDeletePipeline(p.id)} className="h-6 w-6 rounded border border-red-900/20 bg-zinc-900 flex items-center justify-center text-red-400"><Trash2 className="w-3" /></button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {p.completed_tasks?.map(task => (
                      <div key={task} className="flex items-center justify-between bg-zinc-950/50 p-3 rounded-xl border border-zinc-900 text-xs font-bold">
                        <span className="text-zinc-200 capitalize">{task} Package Asset</span>
                        <button onClick={() => triggerDownload(p.id, task)} className="h-7 w-7 bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center text-purple-400"><DownloadCloud className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: RULES SETTINGS DESK */}
        {activeView === "settings" && (
          <div className="flex-1 overflow-y-auto p-10 space-y-10 premium-scroll">
            <header className="space-y-1">
              <h1 className="text-3xl font-black text-white uppercase">Global Rules Desk</h1>
              <p className="text-zinc-400 font-semibold text-sm">Configure default onboarding task options and add 4th or more requirement parameters.</p>
            </header>
            
            <div className="max-w-xl bg-[#0c0c14]/50 border border-zinc-800/80 p-8 rounded-3xl space-y-6">
              
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Add New Requirements Parameter Option</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newRuleInput} 
                    onChange={(e) => setNewRuleInput(e.target.value)} 
                    placeholder="e.g., source code, analytics keys, access links" 
                    className="flex-1 h-11 px-4 rounded-xl bg-[#06060f] border border-zinc-800 text-xs font-bold text-white focus:outline-none focus:border-purple-500/50"
                  />
                  <button 
                    onClick={handleAddNewRule}
                    className="h-11 px-4 bg-zinc-800 border border-zinc-700 hover:border-purple-500/50 text-white rounded-xl flex items-center justify-center text-xs font-black uppercase tracking-widest gap-2"
                  >
                    <PlusSquare className="w-4 h-4 text-purple-400" />
                    <span>Append Option</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Active Pipeline Blueprints Setup Checklist</label>
                <div className="space-y-2">
                  {availableRules.map(task => {
                    const active = activeSelectedRules.includes(task);
                    return (
                      <div key={task} className="p-3 bg-[#06060f] border border-zinc-800 rounded-xl flex items-center justify-between group transition-all">
                        <div onClick={() => toggleRuleSelection(task)} className="flex items-center gap-3 cursor-pointer flex-1">
                          {active ? <CheckSquare className="w-4 h-4 text-purple-400" /> : <Square className="w-4 h-4 text-zinc-600" />}
                          <span className="text-xs font-bold text-zinc-200 capitalize">{task} Requirement Verification</span>
                        </div>
                        
                        {!["logo", "brand", "domain"].includes(task) && (
                          <button 
                            onClick={() => handleRemoveRuleFromSystem(task)}
                            className="text-zinc-600 hover:text-red-400 p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Secure Client Notice Guidelines Template</label>
                <textarea value={fallbackNotes} onChange={(e) => setFallbackNotes(e.target.value)} rows={3} className="w-full p-4 rounded-xl bg-[#06060f] border border-zinc-800 text-xs font-bold text-white focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed" />
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleUpdateGlobalRulesMatrix} 
                  disabled={isSavingSettings}
                  className="h-12 px-6 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs uppercase tracking-widest font-black rounded-xl flex items-center gap-2"
                >
                  {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Global Desk Rules</span>}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* --- PERSISTENT RIGHT SIDEBAR WITH LOG CHRONOLOGY TIMELINES --- */}
        <AnimatePresence>
          {selectedPipeline && activeView === "overview" && (
            <motion.aside initial={{ x: 380, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 380, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 28 }} className="w-96 h-full bg-[#09090f]/95 backdrop-blur-2xl border-l border-zinc-900 relative z-30 p-8 flex flex-col justify-between shadow-[-20px_0_60px_rgba(0,0,0,0.4)]">
              <div className="space-y-6 overflow-y-auto pr-1 premium-scroll flex-1">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
                  <div className="flex items-center gap-2 text-purple-400"><FolderOpen className="w-4 h-4" /><span className="text-xs font-black uppercase tracking-widest">Asset Matrix Sidebar</span></div>
                  <button onClick={() => setSelectedPipeline(null)} className="h-7 w-7 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-500"><X className="w-4 h-4" /></button>
                </div>

                <div className="space-y-1"><h3 className="text-2xl font-black text-white truncate uppercase">{selectedPipeline.client_name}</h3><p className="text-xs text-zinc-400 font-bold uppercase tracking-wide">Scope Matrix: {selectedPipeline.project_scope}</p></div>

                <div className="bg-zinc-950/40 p-4 border border-zinc-900 rounded-xl space-y-2.5">
                  <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5"><ShieldAlert className="w-3 h-3" /> Admin Operations Control</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => toggleArchivePipeline(selectedPipeline.id, selectedPipeline.archived_at !== null)} className={`h-10 border rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${selectedPipeline.archived_at ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'}`}><Archive className="w-4 h-4" /><span>{selectedPipeline.archived_at ? "Unarchive" : "Archive"}</span></button>
                    <button onClick={() => hardDeletePipeline(selectedPipeline.id)} className="h-10 bg-red-950/10 border border-red-900/30 hover:bg-red-600 text-red-500 hover:text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"><Trash2 className="w-4 h-4" /><span>Delete</span></button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5"><Link2 className="w-3 h-3" /> Share Tunnel</span>
                  <div className="flex items-center gap-2"><div className="flex-1 bg-zinc-950 px-3 py-2 border border-zinc-900 text-xs font-mono text-zinc-400 truncate">{selectedPipeline.tunnel_url}</div><button onClick={() => handleCopyAction(selectedPipeline.tunnel_url!, selectedPipeline.id, "link")} className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">{copiedLinkId === selectedPipeline.id ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}</button></div>
                </div>

                {selectedPipeline.completed_tasks?.length !== (selectedPipeline.required_tasks?.length || 3) && !selectedPipeline.archived_at && (
                  <button onClick={() => handleEmailNudge(selectedPipeline)} disabled={isNudging || !selectedPipeline.client_email} className="w-full h-11 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all">{isNudging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}<span>Send Email Reminder</span></button>
                )}

                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Real-time Onboarding Logs</h4>
                  <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-900 space-y-3 max-h-40 overflow-y-auto premium-scroll">
                    {(!selectedPipeline.activity_logs || selectedPipeline.activity_logs.length === 0) ? (
                      <p className="text-[10px] text-zinc-600 font-bold italic">No chronology footprints cached yet.</p>
                    ) : (
                      selectedPipeline.activity_logs.map((log, lidx) => (
                        <div key={lidx} className="flex items-start gap-2.5 text-xs text-zinc-300 border-l border-zinc-800/60 pl-2.5 py-0.5">
                          <div className="flex-1">
                            <p className="font-bold leading-tight text-zinc-200">{log.event}</p>
                            <span className="text-[9px] font-mono text-zinc-500">{log.timestamp}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pipeline Task Checkpoints</h4>
                  <div className="space-y-2">
                    {(selectedPipeline.required_tasks || ["logo", "brand", "domain"]).map(task => {
                      const completed = selectedPipeline.completed_tasks?.includes(task);
                      return (
                        <div key={task} className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl flex items-center justify-between text-xs font-bold">
                          <span className="text-zinc-300 capitalize">{task} Package Checkpoint</span>
                          {completed ? (
                            task === "domain" ? (
                              <span className="text-[10px] text-amber-400 font-mono">Secured</span>
                            ) : (
                              <button onClick={() => triggerDownload(selectedPipeline.id, task)} className="h-7 w-7 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center text-purple-400"><DownloadCloud className="w-4 h-4" /></button>
                            )
                          ) : (
                            <span className="text-[10px] text-zinc-600 italic">Awaiting upload</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400"><Key className="w-3 h-3 inline mr-1" /> Credential Vault Entry</h4>
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 font-mono text-xs font-bold text-amber-400 break-all select-all">{selectedPipeline.vault_credentials || "Vault Empty"}</div>
                </div>

              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      {/* --- CREATE PORTAL MODAL DIALOG --- */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isDeploying && setIsCreateModalOpen(false)} className="absolute inset-0 bg-[#06060f]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-[#0c0c14] border border-zinc-800 rounded-3xl p-8 overflow-hidden">
              <button onClick={() => setIsCreateModalOpen(false)} disabled={isDeploying} className="absolute top-6 right-6 text-zinc-500 hover:text-white bg-zinc-900/50 p-2 rounded-full"><X className="w-4 h-4" /></button>
              <div className="mb-8"><h2 className="text-2xl font-black text-white">New Pipeline</h2></div>
              <form onSubmit={handleDeploy} className="space-y-5">
                <div className="space-y-2"><input type="text" required disabled={isDeploying} value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client Name" className="w-full h-11 px-4 rounded-xl bg-[#09090f] border border-zinc-800 text-white text-sm font-bold focus:outline-none focus:border-purple-500/50" /></div>
                <div className="space-y-2"><input type="text" required disabled={isDeploying} value={projectScope} onChange={(e) => setProjectScope(e.target.value)} placeholder="Project Scope" className="w-full h-11 px-4 rounded-xl bg-[#09090f] border border-zinc-800 text-white text-sm font-bold focus:outline-none focus:border-purple-500/50" /></div>
                <div className="space-y-2"><input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Client Corporate Email Address" className="w-full h-11 px-4 rounded-xl bg-[#09090f] border border-zinc-800 text-white text-sm font-bold focus:outline-none focus:border-purple-500/50" /></div>
                <div className="pt-4"><button type="submit" disabled={isDeploying || !clientName || !projectScope} className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg hover:shadow-purple-500/20">{isDeploying ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span>Deploy Active Tunnel</span>}</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}