import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileText, 
  Briefcase, 
  AlertCircle, 
  Loader, 
  Zap,
  CheckCircle,
  BarChart2,
  Award,
  Star,
  User,
  TrendingUp,
  Github,
  Mail,
  Linkedin,
  Globe,
  Users,
  Search,
  Filter,
  Sparkles,
  Trash2,
  RefreshCw,
  Layers,
  Cpu,
  Database
} from "lucide-react";
import AnalysisDisplay from "./components/AnalysisDisplay";
import CandidateTable from "./components/CandidateTable";
import CandidateDetailModal from "./components/CandidateDetailModal";

const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "";
const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");


const SAMPLE_JOB_DESCRIPTIONS = [
  {
    title: "Python Full Stack Engineer",
    text: "Looking for a Python Developer with experience in FastAPI, PostgreSQL, React.js, Docker, and REST APIs. Experience with spaCy or NLP is a plus."
  },
  {
    title: "AI / ML & NLP Specialist",
    text: "Seeking an NLP Engineer proficient in Python, spaCy, Machine Learning, Deep Learning, TensorFlow/PyTorch, SQL, and AWS."
  },
  {
    title: "Frontend React Engineer",
    text: "Required React Developer skilled in JavaScript, TypeScript, Tailwind CSS, Redux, REST API integration, and Git."
  }
];

const App = () => {
  const [activeTab, setActiveTab] = useState("screen"); // 'screen', 'dashboard', 'directory'
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Ranked Candidates & Dashboard state
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchSkill, setSearchSkill] = useState("");
  const [minScoreFilter, setMinScoreFilter] = useState("");

  // Fetch candidates from API
  const fetchCandidates = async () => {
    try {
      let url = `${API_BASE_URL}/api/candidates/ranked`;
      if (searchSkill || minScoreFilter) {
        url = `${API_BASE_URL}/api/candidates/filter?`;
        if (searchSkill) url += `skill=${encodeURIComponent(searchSkill)}&`;
        if (minScoreFilter) url += `min_score=${minScoreFilter}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCandidates(data);
        } else if (data.candidates) {
          setCandidates(data.candidates);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch candidates from backend API:", err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [searchSkill, minScoreFilter]);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleJobDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };

  const loadSampleJD = (sampleText) => {
    setJobDescription(sampleText);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a resume file (PDF, DOCX, or TXT).");
      return;
    }
    if (!jobDescription || !jobDescription.strip?.() && !jobDescription.trim()) {
      setError("Please enter or select a job description.");
      return;
    }

    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("job_description", jobDescription);

    try {
      let response = await fetch(`${API_BASE_URL}/api/screen`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        response = await fetch(`${API_BASE_URL}/upload_resume/`, {
          method: "POST",
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        setError(result.error);
      } else {
        if (result.ai_explanation || result.ai_analysis) {
          const analysisText = result.ai_analysis || (
            `**Candidate Name**: ${result.candidate_name}\n` +
            `**Overall Match Score**: ${result.score}%\n` +
            `**Recommendation**: ${result.recommendation}\n\n` +
            `**Matched Required Skills**: ${result.matched_skills?.join(", ") || "None"}\n` +
            `**Missing Required Skills**: ${result.missing_skills?.join(", ") || "None"}\n\n` +
            `**AI Analysis & Rationale**:\n${result.ai_explanation}`
          );
          setAnalysis(analysisText);
        }
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 3000);
        fetchCandidates();
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError(`Failed to connect to backend API (${API_BASE_URL || "http://localhost:8000"}): ${error.message}. Ensure the backend is active on Render.`);

    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/candidates/${candidateId}`, { method: "DELETE" });
      if (res.ok) {
        fetchCandidates();
      }
    } catch (err) {
      console.error("Failed to delete candidate:", err);
    }
  };

  // Metric stats
  const totalCandidatesCount = candidates.length;
  const screenedCount = candidates.filter(c => c.score != null).length;
  const avgScore = candidates.length > 0
    ? roundTo(candidates.reduce((acc, c) => acc + (c.score || 0), 0) / candidates.length, 1)
    : 0;
  const topCandidate = candidates.length > 0 ? candidates[0] : null;

  function roundTo(num, dec) {
    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px]" />
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-300">
                ScreenAI <span className="text-indigo-400 font-medium text-sm ml-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">v2.0</span>
              </span>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>FastAPI + spaCy NLP Engine Active</span>
              </div>
            </div>
          </div>

          {/* Navigation Segmented Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/50 shadow-inner">
            <button
              onClick={() => setActiveTab("screen")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "screen"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <Sparkles size={14} />
              <span>Screening Tool</span>
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "dashboard"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <BarChart2 size={14} />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "directory"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <Users size={14} />
              <span>Candidates ({candidates.length})</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Success Overlay */}
        <AnimatePresence>
          {showSuccessAnimation && (
            <motion.div 
              className="fixed inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-md z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center max-w-sm"
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.05, 1] }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
                  <CheckCircle size={44} />
                </div>
                <h3 className="text-xl font-bold text-white">Screening Complete!</h3>
                <p className="text-sm text-slate-400 mt-1">Resume parsed, matched, and candidate ranked successfully.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab 1: Screening Tool */}
        {activeTab === "screen" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Title Section */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                AI Resume Screening & Ranking Engine
              </h1>
              <p className="text-sm text-slate-400">
                Upload candidate resumes (PDF, DOCX, TXT) and match against job descriptions using spaCy NLP entity extraction and deterministic 4-factor scoring.
              </p>
            </div>

            {/* 2-Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Upload Resume */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <FileText size={18} />
                      </div>
                      <h2 className="text-base font-bold text-white">1. Candidate Resume Upload</h2>
                    </div>
                    <span className="text-xs text-slate-500">PDF, DOCX, TXT</span>
                  </div>

                  {/* Dropzone */}
                  <label 
                    htmlFor="file-upload"
                    className={`relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                      dragActive 
                        ? "border-indigo-500 bg-indigo-500/10" 
                        : selectedFile
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : "border-slate-700 hover:border-indigo-500/60 hover:bg-slate-800/40 bg-slate-950/40"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className="flex flex-col items-center text-center p-4">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/30">
                          <CheckCircle size={28} />
                        </div>
                        <p className="text-sm font-semibold text-white truncate max-w-xs">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB • Ready to analyze</p>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                          className="mt-3 text-xs text-rose-400 hover:text-rose-300 underline"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 border border-indigo-500/20">
                          <Upload size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-300">
                          <span className="text-indigo-400 font-semibold">Click to browse</span> or drag & drop resume
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, and TXT files (Max 15MB)</p>
                      </div>
                    )}
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
                  </label>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <Cpu size={16} className="text-indigo-400 flex-shrink-0" />
                  <span>spaCy NLP will parse skills, education, experience, and contact info automatically.</span>
                </div>
              </div>

              {/* Right Column: Job Description */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Briefcase size={18} />
                      </div>
                      <h2 className="text-base font-bold text-white">2. Job Description Requirements</h2>
                    </div>
                    {jobDescription && (
                      <button
                        onClick={() => setJobDescription("")}
                        className="text-xs text-slate-500 hover:text-slate-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Sample JD Presets */}
                  <div className="mb-3">
                    <span className="text-xs text-slate-400 block mb-1.5 font-medium">Load Quick Presets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_JOB_DESCRIPTIONS.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => loadSampleJD(preset.text)}
                          className="text-[11px] bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2.5 py-1 rounded-lg border border-slate-700 transition"
                        >
                          + {preset.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    placeholder="Enter or paste target job description requirements (e.g. Looking for a Python Engineer with FastAPI, PostgreSQL, spaCy, and React)..."
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                    className="w-full h-44 p-4 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Characters: {jobDescription.length}</span>
                  <span>Words: {jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0}</span>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="max-w-xl mx-auto">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl shadow-xl shadow-indigo-600/25 transition duration-200 transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg space-x-3"
              >
                {loading ? (
                  <>
                    <Loader size={22} className="animate-spin text-white" />
                    <span>Executing spaCy NLP & Match Engine...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={22} />
                    <span>Screen & Match Resume</span>
                  </>
                )}
              </button>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center"
                >
                  <AlertCircle size={18} className="mr-2 flex-shrink-0 text-rose-400" />
                  <span>{error}</span>
                </motion.div>
              )}
            </div>

            {/* Analysis Output Section */}
            {analysis && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                <AnalysisDisplay analysis={analysis} />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Tab 2: Dashboard */}
        {activeTab === "dashboard" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Recruiter Analytics & KPI Overview</h1>
                <p className="text-xs text-slate-400">Database screening metrics and top candidate rankings</p>
              </div>
              <button
                onClick={fetchCandidates}
                className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 transition"
              >
                <RefreshCw size={14} />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center space-x-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20"><Users size={26} /></div>
                <div>
                  <div className="text-2xl font-black text-white">{totalCandidatesCount}</div>
                  <div className="text-xs text-slate-400 font-medium">Total Candidates</div>
                </div>
              </div>
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center space-x-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><CheckCircle size={26} /></div>
                <div>
                  <div className="text-2xl font-black text-white">{screenedCount}</div>
                  <div className="text-xs text-slate-400 font-medium">Screened Resumes</div>
                </div>
              </div>
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center space-x-4">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20"><TrendingUp size={26} /></div>
                <div>
                  <div className="text-2xl font-black text-white">{avgScore}%</div>
                  <div className="text-xs text-slate-400 font-medium">Average Match Score</div>
                </div>
              </div>
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center space-x-4">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20"><Award size={26} /></div>
                <div>
                  <div className="text-lg font-extrabold text-white truncate max-w-[130px]">
                    {topCandidate ? topCandidate.candidate_name : "None"}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Top Match</div>
                </div>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">Top Candidate Leaderboard</h3>
              <CandidateTable
                candidates={candidates.slice(0, 5)}
                onViewDetails={(c) => setSelectedCandidate(c)}
              />
            </div>
          </motion.div>
        )}

        {/* Tab 3: Candidate Directory */}
        {activeTab === "directory" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Candidate Database & Rankings</h1>
                <p className="text-xs text-slate-400">Filter candidate profiles by technical skill or minimum screening score</p>
              </div>

              {/* Search & Filter Inputs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter by skill (e.g. Python)"
                    value={searchSkill}
                    onChange={(e) => setSearchSkill(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Filter size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="number"
                    placeholder="Min Score % (e.g. 75)"
                    value={minScoreFilter}
                    onChange={(e) => setMinScoreFilter(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none w-44"
                  />
                </div>
              </div>
            </div>

            <CandidateTable
              candidates={candidates}
              onViewDetails={(c) => setSelectedCandidate(c)}
              onDeleteCandidate={handleDeleteCandidate}
            />
          </motion.div>
        )}

        {/* Candidate Detail Modal */}
        {selectedCandidate && (
          <CandidateDetailModal
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
          />
        )}
      </main>

      {/* Footer with Compact Developer Info */}
      <footer className="mt-auto bg-slate-900/90 border-t border-slate-800/80 py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Developer Attribution & Links */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">SK</div>
              <span className="text-slate-300 font-medium">Developed by <strong className="text-white">Sai Kumar</strong></span>
            </div>
            
            <div className="flex items-center space-x-2">
              <a href="https://github.com/SAIKUMAR039" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition p-1 bg-slate-800 rounded-md">
                <Github size={14} />
              </a>
              <a href="https://www.linkedin.com/in/sai-kumar-thota-101764252/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition p-1 bg-slate-800 rounded-md">
                <Linkedin size={14} />
              </a>
              <a href="https://www.saikumarthota.live" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition p-1 bg-slate-800 rounded-md">
                <Globe size={14} />
              </a>
              <a href="mailto:saikumarthota2004@gmail.com" className="text-slate-400 hover:text-white transition p-1 bg-slate-800 rounded-md">
                <Mail size={14} />
              </a>
            </div>
          </div>

          {/* Tech Stack Badges & Copyright */}
          <div className="flex items-center space-x-3 text-[11px] text-slate-500">
            <span className="hidden sm:inline-block">Python • FastAPI • spaCy • PostgreSQL • React</span>
            <span>© 2026 AI Resume Screening System</span>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default App;