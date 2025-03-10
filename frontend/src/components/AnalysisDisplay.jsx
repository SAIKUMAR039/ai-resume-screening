import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, User } from "lucide-react";

const AnalysisDisplay = ({ analysis }) => {
  // Function to format text with markdown-like syntax
  const formatText = (text) => {
    if (!text) return "";
    
    // Split the text by lines to handle each paragraph separately
    const lines = text.split("\n");
    
    return lines.map((line, lineIndex) => {
      // Format bold text (text between ** **)
      let formattedLine = line;
      let boldSegments = [];
      let lastIndex = 0;
      
      // Find all occurrences of text between ** **
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        const beforeBold = formattedLine.substring(lastIndex, match.index);
        const boldText = match[1]; // Text inside ** **
        
        if (beforeBold) {
          boldSegments.push(<span key={`${lineIndex}-text-${lastIndex}`}>{beforeBold}</span>);
        }
        
        boldSegments.push(
          <span key={`${lineIndex}-bold-${match.index}`} className="font-bold text-indigo-800">
            {boldText}
          </span>
        );
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add any remaining text after the last bold section
      if (lastIndex < formattedLine.length) {
        boldSegments.push(
          <span key={`${lineIndex}-text-end`}>
            {formattedLine.substring(lastIndex)}
          </span>
        );
      }
      
      // If no bold sections were found, return the original line
      if (boldSegments.length === 0) {
        return <p key={`line-${lineIndex}`} className="py-1">{line}</p>;
      }
      
      return <p key={`line-${lineIndex}`} className="py-1">{boldSegments}</p>;
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <div className="flex items-center">
          <CheckCircle size={24} className="text-white mr-3" />
          <h2 className="text-xl font-bold text-white">AI Resume Analysis</h2>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4 flex items-center">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <User size={20} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-indigo-700">Analysis Summary</h3>
        </div>
        
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <div className="prose text-gray-700 max-w-none">
            {formatText(analysis)}
          </div>
        </div>
        
        <div className="mt-5 flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
          >
            Save Analysis
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-2 px-4 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-md text-sm font-medium"
          >
            Export as PDF
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisDisplay;