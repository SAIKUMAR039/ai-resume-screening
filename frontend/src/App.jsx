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
  BarChart,
  Award,
  Star,
  ThumbsUp,
  User,
  Clock,
  TrendingUp,
  Settings,
  Github,
  Mail,
  Linkedin,
  Code,
  Globe,
  Link
} from "lucide-react";
import AnalysisDisplay from "./components/AnalysisDisplay";

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showDevInfo, setShowDevInfo] = useState(true);

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle job description input
  const handleJobDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };

  // Handle resume upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a resume file.");
      return;
    }
    if (!jobDescription) {
      setError("Please enter a job description.");
      return;
    }

    setError(""); // Clear previous errors
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("job_description", jobDescription);

    try {
      const response = await fetch("https://ai-resume-screening-1.onrender.com/upload_resume/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Backend Response:", result);

      if (result.error) {
        setError(result.error);
      } else {
        setAnalysis(result.ai_analysis);
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 3000);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to upload resume. Please try again.");
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

  // Toggle developer info
  const toggleDevInfo = () => {
    setShowDevInfo(!showDevInfo);
  };

  // Floating 3D icons effect
  const FloatingIcon = ({ icon: Icon, delay, x, y }) => {
    return (
      <motion.div
        className="absolute text-indigo-400 opacity-30"
        initial={{ x, y, scale: 0.5, opacity: 0 }}
        animate={{ 
          y: y - 15,
          opacity: 0.3,
          scale: 0.7,
          rotateY: [0, 180, 360],
          rotateZ: [-10, 10, -10],
        }}
        transition={{
          duration: 12,
          delay,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <Icon size={32} />
      </motion.div>
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 24
      }
    }
  };

  const floatingIcons = [
    { icon: FileText, delay: 0, x: -100, y: 100 },
    { icon: BarChart, delay: 2, x: 150, y: 50 },
    { icon: Award, delay: 4, x: -150, y: 200 },
    { icon: Star, delay: 1, x: 120, y: 180 },
    { icon: ThumbsUp, delay: 3, x: -80, y: 300 },
    { icon: User, delay: 5, x: 200, y: 250 },
    { icon: Clock, delay: 2.5, x: -200, y: 150 },
    { icon: TrendingUp, delay: 0.5, x: 180, y: 120 },
    { icon: Settings, delay: 4.5, x: -120, y: 220 },
  ];

  // Developer information from GitHub
  const devInfo = {
    name: "Sai Kumar",
    github: "https://github.com/SAIKUMAR039",
    img: "https://github.com/SAIKUMAR039.png",
    email: "saikumarthota2004@gmail.com",
    linkedin: "https://www.linkedin.com/in/sai-kumar-thota-101764252/",
    portfolio: "https://www.saikumarthota.live",
    bio: "Software Developer passionate about building innovative solutions.",
    skills: ["Python", "React", "Machine Learning", "Full Stack Development", "Data Science"],
    projects: [
      {
        name: "File Share Web App",
        description: "Web application for sharing files securely.",
        
        link:"https://file-shar-e.vercel.app/"
      },
      {
        name: "Portfolio Website",
        description: "Personal portfolio showcasing projects and skills.",
        link:"https://www.saikumarthota.live"
      },
      {
        name: "ML Image Recognition",
        description: "Machine learning model for image recognition and classification.",
        link:"https://imagine-id.vercel.app/"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Background floating icons */}
      {floatingIcons.map((iconProps, index) => (
        <FloatingIcon key={index} {...iconProps} />
      ))}
      
      <motion.div 
        className="max-w-4xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Developer Info Card */}
        <motion.div
          className="mt-8 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          >
          <motion.button
            onClick={toggleDevInfo}
            className="w-full bg-gradient-to-r from-gray-800 to-indigo-900 text-white py-3 px-4 rounded-lg shadow-md flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Code size={20} />
            </motion.div>
            <span>
              {showDevInfo ? "Hide Developer Info" : "Show Developer Info"}
            </span>
          </motion.button>

          <AnimatePresence>
            {showDevInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="mt-4 bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-800 to-purple-800 px-6 py-6 relative overflow-hidden">
                  {/* Animated background elements */}
                  <motion.div 
                    className="absolute top-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full"
                    initial={{ x: -50, y: -50 }}
                    animate={{ x: -30, y: -30 }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      repeatType: "reverse" 
                    }}
                  />
                  <motion.div 
                    className="absolute bottom-0 right-0 w-60 h-60 bg-white opacity-5 rounded-full"
                    initial={{ x: 30, y: 30 }}
                    animate={{ x: 50, y: 50 }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity, 
                      repeatType: "reverse" 
                    }}
                  />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start">
                    <motion.div 
                      className="flex-shrink-0 mb-4 md:mb-0 md:mr-6"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {devInfo.img ? (
                            <img src={devInfo.img} alt="Developer" className="rounded-full" />
                          ) : (
                            devInfo.name[0].toUpperCase()
                          )}
                        </div>
                        
                      </div>
                    </motion.div>
                    
                    <div className="text-center md:text-left">
                      <motion.h2 
                        className="text-2xl font-bold text-white"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      >
                        {devInfo.name}
                      </motion.h2>
                      <motion.p 
                        className="text-indigo-200 mt-1"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        {devInfo.bio}
                      </motion.p>
                      
                      <motion.div 
                        className="flex mt-4 justify-center md:justify-start space-x-3"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <motion.a 
                          href={devInfo.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-all duration-300"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Github size={20} className="text-black" />
                        </motion.a>
                        <motion.a 
                          href={`mailto:${devInfo.email}`}
                          className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-all duration-300"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Mail size={20} className="text-black" />
                        </motion.a>
                        <motion.a 
                          href={devInfo.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-all duration-300"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Linkedin size={20} className="text-black" />
                        </motion.a>
                        <motion.a 
                          href={devInfo.portfolio}
                          target="_blank"
                          className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-all duration-300"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Globe size={20} className="text-black" />
                        </motion.a>
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Skills Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {devInfo.skills.map((skill, index) => (
                        <motion.span
                          key={index}
                          className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ 
                            scale: 1.05, 
                            backgroundColor: "#c7d2fe", 
                            boxShadow: "0 2px 5px rgba(99, 102, 241, 0.2)" 
                          }}
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Projects Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Featured Projects</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-center justify-center">
                      {devInfo.projects.map((project, index) => (
                        <motion.div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 * index }}
                          whileHover={{ 
                            y: -5,
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                          }}
                        >
                          <a href={project.link} target="_blank" rel="noopener noreferrer">
                            <Link size={20} className="text-indigo-700" />
                          
                          <h4 className="font-medium text-indigo-700">{project.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                          </a>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <motion.div 
                  className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 text-center text-sm text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p>© 2025 Sai Kumar | AI Resume Screening Tool</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        {/* Success Animation Overlay */}
        <AnimatePresence>
          {showSuccessAnimation && (
            <motion.div 
              className="fixed inset-0 flex items-center justify-center bg-indigo-900 bg-opacity-70 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-full p-10"
                initial={{ scale: 0.5 }}
                animate={{ 
                  scale: [0.5, 1.2, 1],
                  rotate: [0, 10, 0] 
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: 2,
                    repeatType: "reverse"
                  }}
                >
                  <CheckCircle size={80} className="text-green-500" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm bg-opacity-95 mt-8">
          <div className="p-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="text-center">
                <div className="flex justify-center mb-4 relative">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ 
                      scale: [0.8, 1.2, 1],
                      rotate: [0, 15, 0],
                      y: [0, -10, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    className="text-indigo-600 relative z-10"
                  >
                    <Zap size={50} className="inline-block" />
                  </motion.div>
                  
                  {/* Glow effect */}
                  <motion.div
                    className="absolute w-20 h-20 bg-indigo-300 rounded-full filter blur-xl opacity-50"
                    initial={{ scale: 0.8 }}
                    animate={{ 
                      scale: [0.8, 1.5, 0.8],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </div>
                
                <motion.h1 
                  className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{ 
                    duration: 15, 
                    repeat: Infinity,
                    ease: "linear" 
                  }}
                  style={{ backgroundSize: "200% auto" }}
                >
                  AI Resume Screening
                </motion.h1>
                
                <motion.p 
                  className="mt-2 text-gray-600"
                  variants={itemVariants}
                >
                  Upload your resume and job description for intelligent analysis
                </motion.p>
              </motion.div>

              {/* File Upload Area */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <label 
                  htmlFor="file-upload"
                  className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${
                    dragActive 
                      ? "border-indigo-500 bg-indigo-50" 
                      : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <motion.div
                      className="relative"
                    >
                      <motion.div
                        initial={{ rotateY: 0, rotateX: 0 }}
                        animate={{ 
                          rotateY: [0, 360],
                          rotateX: [0, 15, 0, -15, 0]
                        }}
                        transition={{ 
                          rotateY: { duration: 5, repeat: Infinity, ease: "linear" },
                          rotateX: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="mb-3 text-indigo-500"
                        style={{ perspective: 1000 }}
                      >
                        <Upload size={60} />
                      </motion.div>
                      
                      {/* Subtle pulsing shadow */}
                      <motion.div
                        className="absolute -inset-2 rounded-full bg-indigo-300 -z-10 filter blur-md"
                        animate={{ 
                          opacity: [0.1, 0.3, 0.1],
                          scale: [0.8, 1.1, 0.8]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                    </motion.div>
                    
                    <p className="mb-2 text-sm text-gray-600 font-medium">
                      <motion.span 
                        className="font-semibold text-indigo-600"
                        animate={{ color: ["#4f46e5", "#818cf8", "#4f46e5"] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        Click to upload
                      </motion.span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF files only</p>
                    {selectedFile && (
                      <motion.div 
                        className="mt-3 flex items-center text-indigo-500 bg-indigo-50 px-3 py-2 rounded-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FileText size={16} className="mr-2" />
                        <span className="text-sm font-medium truncate max-w-xs">
                          {selectedFile.name}
                        </span>
                      </motion.div>
                    )}
                  </div>
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept=".pdf" 
                  />
                </label>
              </motion.div>
              
              {/* Job Description */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <div className="flex items-center mb-2">
                  <motion.div
                    animate={{ 
                      rotateZ: [0, 10, 0, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="mr-2 text-indigo-600"
                  >
                    <Briefcase size={24} />
                  </motion.div>
                  <label htmlFor="job-description" className="block text-sm font-medium text-gray-700">
                    Job Description
                  </label>
                </div>
                <textarea
                  id="job-description"
                  placeholder="Enter the job description here..."
                  value={jobDescription}
                  onChange={handleJobDescriptionChange}
                  className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
              </motion.div>

              {/* Upload Button */}
              <motion.div variants={itemVariants}>
                <motion.button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)"
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Button background animation */}
                  <motion.div 
                    className="absolute inset-0 w-full h-full"
                    style={{ 
                      backgroundImage: "linear-gradient(to right, #4f46e5, #8b5cf6, #4f46e5)",
                      backgroundSize: "200% 100%"
                    }}
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  {/* Button content */}
                  <span className="relative flex items-center justify-center">
                    {loading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Loader size={24} />
                        </motion.span>
                        <span className="text-lg">Analyzing Resume...</span>
                      </>
                    ) : (
                      <>
                        <motion.span
                          animate={{ 
                            scale: [1, 1.15, 1],
                            rotate: [0, 5, 0, -5, 0]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                          className="mr-3"
                        >
                          <FileText size={24} />
                        </motion.span>
                        <span className="text-lg">Analyze Resume</span>
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>

              {/* Display Errors */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    variants={itemVariants}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div className="flex">
                      <motion.div
                        animate={{ rotate: [0, 10, 0, -10, 0] }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: 3,
                          repeatType: "reverse"
                        }}
                        className="text-red-500 mr-2 flex-shrink-0"
                      >
                        <AlertCircle size={20} />
                      </motion.div>
                      <p className="text-red-600">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Display AI Analysis with text formatting */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                delay: 0.2
              }}
              className="mt-8"
            >
              <AnalysisDisplay analysis={analysis} />
            </motion.div>
          )}
        </AnimatePresence>

        
      </motion.div>
    </div>
  );
};

export default App;