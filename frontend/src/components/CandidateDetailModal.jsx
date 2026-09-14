import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, CheckCircle, AlertTriangle, Award, Sparkles } from "lucide-react";

const CandidateDetailModal = ({ candidate, onClose }) => {
  if (!candidate) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col text-slate-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900/90 to-purple-900/90 p-6 relative border-b border-slate-800">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 rounded-full p-1.5 transition"
            >
              <X size={18} />
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xl font-black border border-indigo-500/30">
                {candidate.candidate_name ? candidate.candidate_name[0].toUpperCase() : "C"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{candidate.candidate_name}</h2>
                <div className="flex items-center space-x-4 text-slate-400 text-xs mt-1">
                  {candidate.email && (
                    <span className="flex items-center"><Mail size={13} className="mr-1 text-indigo-400" />{candidate.email}</span>
                  )}
                  {candidate.phone && (
                    <span className="flex items-center"><Phone size={13} className="mr-1 text-indigo-400" />{candidate.phone}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">

            {/* Score & Recommendation Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Score</div>
                <div className="text-2xl font-black text-indigo-400 mt-0.5">{candidate.score}%</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Skills Match</div>
                <div className="text-xl font-bold text-slate-200 mt-0.5">{candidate.skills_match ?? "N/A"}%</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Experience Match</div>
                <div className="text-xl font-bold text-slate-200 mt-0.5">{candidate.experience_match ?? "N/A"}%</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recommendation</div>
                <div className="mt-1">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {candidate.recommendation || "Screened"}
                  </span>
                </div>
              </div>
            </div>

            {/* Matched & Missing Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Matched Skills */}
              <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center text-emerald-400 font-bold mb-2">
                  <CheckCircle size={15} className="mr-1.5 text-emerald-400" />
                  Matched Required Skills ({candidate.matched_skills?.length || 0})
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {candidate.matched_skills && candidate.matched_skills.length > 0 ? (
                    candidate.matched_skills.map((sk, idx) => (
                      <span key={idx} className="bg-emerald-500/10 text-emerald-300 text-[11px] px-2.5 py-0.5 rounded-lg font-medium border border-emerald-500/20">
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">No direct skill matches</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/20">
                <div className="flex items-center text-rose-400 font-bold mb-2">
                  <AlertTriangle size={15} className="mr-1.5 text-rose-400" />
                  Missing Required Skills ({candidate.missing_skills?.length || 0})
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {candidate.missing_skills && candidate.missing_skills.length > 0 ? (
                    candidate.missing_skills.map((sk, idx) => (
                      <span key={idx} className="bg-rose-500/10 text-rose-300 text-[11px] px-2.5 py-0.5 rounded-lg font-medium border border-rose-500/20">
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-emerald-400 font-medium">All required skills matched!</span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Explanation / Rationale */}
            {candidate.ai_explanation && (
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center text-purple-300 font-bold mb-2">
                  <Sparkles size={15} className="mr-1.5 text-purple-400" />
                  Recruiter Screening Rationale
                </div>
                <p className="text-slate-300 whitespace-pre-line leading-relaxed text-xs">
                  {candidate.ai_explanation}
                </p>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition"
            >
              Close Profile
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CandidateDetailModal;
