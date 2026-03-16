'use client';

import { motion } from "framer-motion";

export default function MeshBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <motion.div 
        className="mesh-gradient-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2 }}
      />
      {/* Dynamic Floating Orbs for extra "Wow" */}
      <motion.div 
        animate={{ 
          x: [0, 100, 0], 
          y: [0, -100, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ 
          x: [0, -150, 0], 
          y: [0, 150, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-100/20 rounded-full blur-3xl"
      />
    </div>
  );
}
