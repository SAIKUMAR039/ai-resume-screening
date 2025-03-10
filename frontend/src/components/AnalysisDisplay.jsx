import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, User, Download, Save, FileText, Copy } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const AnalysisDisplay = ({ analysis }) => {
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Function to format text with markdown-like syntax
  const formatText = (text) => {
    if (!text) return [];
    
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

  // Function to copy analysis to clipboard
  const copyToClipboard = () => {
    // Remove markdown-like syntax for clipboard
    const plainText = analysis.replace(/\*\*(.*?)\*\*/g, "$1");
    navigator.clipboard.writeText(plainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Function to save analysis locally
  const saveAnalysis = () => {
    setSaving(true);
    
    // Simulate saving process
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ analysis }));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "resume_analysis.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      setSaving(false);
    }, 1000);
  };

  // Function to export analysis as PDF with enhanced formatting
  const exportAsPDF = async () => {
    // Create reference to the content div
    const content = document.getElementById("analysis-content");
    
    // First create a PDF with jsPDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    
    // Set document properties
    doc.setProperties({
      title: "Resume Analysis Report",
      subject: "AI-Generated Resume Analysis",
      author: "Resume Analysis Tool",
      keywords: "resume, analysis, AI",
      creator: "Resume Analysis Application"
    });
    
    // Add styled header
    doc.setFontSize(24);
    doc.setTextColor(63, 81, 181); // Indigo color
    doc.text("Resume Analysis Report", 20, 20);
    
    // Add date
    const today = new Date();
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${today.toLocaleDateString()}`, 20, 30);
    
    // Add horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    try {
      // Generate a canvas from the HTML content
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate aspect ratio to fit in PDF
      const imgWidth = 170; // mm
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      // Add content image
      doc.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);
      
      // If content is too long, create multiple pages
      if (imgHeight > pageHeight - 60) {
        let heightLeft = imgHeight;
        let position = 40;
        
        // Remove first page image that's now incomplete
        doc.deletePage(1);
        // Add page with complete content
        doc.addPage();
        
        // Add header to first page again
        doc.setFontSize(24);
        doc.setTextColor(63, 81, 181);
        doc.text("Resume Analysis Report", 20, 20);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on ${today.toLocaleDateString()}`, 20, 30);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);
        
        // Add first part of image
        doc.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);
        
        heightLeft -= (pageHeight - 40);
        position = 0;
        
        // Add other pages as needed
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }
      
      // Add footer on all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 20, pageHeight - 10);
        doc.text("Resume Analysis Tool", pageWidth - 60, pageHeight - 10);
      }
      
      // Save the PDF
      doc.save("resume_analysis.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      // Fallback to simpler PDF generation if html2canvas fails
      fallbackPDFExport();
    }
  };
  
  // Fallback PDF export method if html2canvas fails
  const fallbackPDFExport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const effectiveWidth = pageWidth - (margin * 2);
    
    // Add header with styling
    doc.setFontSize(18);
    doc.setTextColor(63, 81, 181); // Indigo color
    doc.text("Resume Analysis Report", margin, 20);
    
    // Add date
    const today = new Date();
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${today.toLocaleDateString()}`, margin, 30);
    
    // Add horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, 35, pageWidth - margin, 35);
    
    // Reset to normal text settings
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    
    // Format and add content
    if (analysis) {
      // Remove markdown-like syntax for PDF
      const plainText = analysis.replace(/\*\*(.*?)\*\*/g, "$1");
      
      // Split by paragraphs
      const paragraphs = plainText.split("\n");
      
      let yPosition = 45;
      
      // Process each paragraph
      paragraphs.forEach(paragraph => {
        if (paragraph.trim() === "") return;
        
        // Add text with word wrapping
        const splitText = doc.splitTextToSize(paragraph, effectiveWidth);
        
        // Check if we need a new page
        if (yPosition + splitText.length * 7 > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(splitText, margin, yPosition);
        yPosition += (splitText.length * 7) + 5; // Add some spacing between paragraphs
      });
      
      // Add footer with page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, margin, doc.internal.pageSize.getHeight() - 10);
      }
    }
    
    doc.save("resume_analysis.pdf");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle size={24} className="text-white mr-3" />
            <h2 className="text-xl font-bold text-white">AI Resume Analysis</h2>
          </div>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30"
              onClick={copyToClipboard}
              title="Copy to clipboard"
            >
              <Copy size={16} />
            </motion.button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4 flex items-center">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <User size={20} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-indigo-700">Analysis Summary</h3>
        </div>
        
        <div id="analysis-content" className="bg-white rounded-lg p-5 shadow-sm">
          <div className="prose text-gray-700 max-w-none">
            {formatText(analysis)}
          </div>
        </div>
        
        {copied && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm text-green-600 flex items-center"
          >
            <CheckCircle size={16} className="mr-1" /> Copied to clipboard
          </motion.div>
        )}
        
        <div className="mt-5 flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={saving}
            className="flex items-center justify-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium disabled:bg-indigo-400 flex-1"
            onClick={saveAnalysis}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Analysis
              </>
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center py-2 px-4 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-md text-sm font-medium flex-1"
            onClick={exportAsPDF}
          >
            <FileText size={16} className="mr-2" />
            Export as PDF
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center py-2 px-4 bg-gray-700 hover:bg-gray-800 text-white rounded-md text-sm font-medium flex-1"
            onClick={copyToClipboard}
          >
            <Copy size={16} className="mr-2" />
            Copy Text
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisDisplay;