import React from "react";
import { motion } from "framer-motion";
import { Award, CheckCircle, AlertCircle, Eye, Trash2, Trophy } from "lucide-react";

const getBadgeColor = (recommendation) => {
  switch (recommendation) {
    case "Strong Candidate":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    case "Good Candidate":
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
    case "Potential Candidate":
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    default:
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
  }
};

const CandidateTable = ({ candidates, onViewDetails, onDeleteCandidate }) => {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-slate-900/60 rounded-2xl p-8 text-center border border-slate-800">
        <Award size={44} className="mx-auto text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-300">No Candidates Found</h3>
        <p className="text-xs text-slate-500 mt-1">Upload resumes or adjust your search filters to view candidate rankings.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 rounded-2xl shadow-xl overflow-hidden border border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <th className="py-3.5 px-4 font-bold text-center w-16">Rank</th>
              <th className="py-3.5 px-4 font-bold">Candidate</th>
              <th className="py-3.5 px-4 font-bold text-center">Score</th>
              <th className="py-3.5 px-4 font-bold text-center">Skills Match</th>
              <th className="py-3.5 px-4 font-bold text-center">Experience</th>
              <th className="py-3.5 px-4 font-bold text-center">Recommendation</th>
              <th className="py-3.5 px-4 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {candidates.map((cand, index) => (
              <motion.tr
                key={cand.candidate_id || index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="hover:bg-slate-800/40 transition-colors duration-150"
              >
                {/* Rank Medal / Badge */}
                <td className="py-3.5 px-4 text-center font-bold">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black shadow-sm ${
                    index === 0 ? "bg-amber-400 text-amber-950 ring-2 ring-amber-400/30" :
                    index === 1 ? "bg-slate-300 text-slate-900" :
                    index === 2 ? "bg-amber-700 text-white" : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}>
                    {index === 0 ? <Trophy size={13} /> : `#${cand.rank || index + 1}`}
                  </span>
                </td>

                {/* Candidate Profile */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-100 text-sm">{cand.candidate_name}</div>
                  {cand.email && <div className="text-[11px] text-slate-400">{cand.email}</div>}
                  {cand.matched_skills && cand.matched_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {cand.matched_skills.slice(0, 4).map((sk, i) => (
                        <span key={i} className="text-[10px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 font-medium">
                          {sk}
                        </span>
                      ))}
                      {cand.matched_skills.length > 4 && (
                        <span className="text-[10px] text-slate-500">+{cand.matched_skills.length - 4} more</span>
                      )}
                    </div>
                  )}
                </td>

                {/* Overall Score */}
                <td className="py-3.5 px-4 text-center">
                  <span className={`text-base font-black ${
                    cand.score >= 85 ? "text-emerald-400" :
                    cand.score >= 70 ? "text-indigo-400" :
                    cand.score >= 50 ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {cand.score}%
                  </span>
                </td>

                {/* Skills Match */}
                <td className="py-3.5 px-4 text-center font-semibold text-slate-300">
                  {cand.skills_match != null ? `${cand.skills_match}%` : "N/A"}
                </td>

                {/* Experience Match */}
                <td className="py-3.5 px-4 text-center font-semibold text-slate-300">
                  {cand.experience_match != null ? `${cand.experience_match}%` : "N/A"}
                </td>

                {/* Recommendation Badge */}
                <td className="py-3.5 px-4 text-center">
                  <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full border ${getBadgeColor(cand.recommendation)}`}>
                    {cand.recommendation}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-center">
                  <div className="flex justify-center space-x-1">
                    <button
                      onClick={() => onViewDetails(cand)}
                      className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-500/20 rounded-lg transition"
                      title="View Candidate Profile"
                    >
                      <Eye size={16} />
                    </button>
                    {onDeleteCandidate && (
                      <button
                        onClick={() => onDeleteCandidate(cand.candidate_id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition"
                        title="Delete Candidate"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CandidateTable;
