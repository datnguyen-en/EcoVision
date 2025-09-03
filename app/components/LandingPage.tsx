'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Database, Brain, Globe, Zap } from 'lucide-react'

interface LandingPageProps {
  onEnter: () => void
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
            animate={{
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      {/* Floating 3D Elements */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32"
        animate={{
          y: [0, -20, 0],
          rotateY: [0, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-2xl transform rotate-12">
          <Database className="w-16 h-16 text-white mx-auto mt-8" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-40 right-20 w-32 h-32"
        animate={{
          y: [0, 20, 0],
          rotateY: [360, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 rounded-lg shadow-2xl transform -rotate-12">
          <Brain className="w-16 h-16 text-white mx-auto mt-8" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-40 left-1/4 w-32 h-32"
        animate={{
          y: [0, -15, 0],
          rotateX: [0, 360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-2xl transform rotate-45">
          <Globe className="w-16 h-16 text-white mx-auto mt-8" />
        </div>
      </motion.div>

      {/* Data Flow Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.path
          d="M 100 100 Q 300 50 500 100 T 900 100"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
          animate={{
            strokeDasharray: [0, 1000],
            strokeDashoffset: [0, -1000],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.path
          d="M 200 200 Q 400 150 600 200 T 1000 200"
          stroke="url(#gradient2)"
          strokeWidth="2"
          fill="none"
          animate={{
            strokeDasharray: [0, 1000],
            strokeDashoffset: [0, -1000],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto"
        >
          {/* Logo/Icon */}
          <motion.div
            className="mb-8"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-2xl shadow-2xl flex items-center justify-center">
              <Zap className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent"
          >
            Sustainability 
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Tracker
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Advanced machine learning models for real-time air quality monitoring and prediction
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Database className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Monitoring</h3>
              <p className="text-gray-300 text-sm">Live air quality data from global sensors</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Brain className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">AI Predictions</h3>
              <p className="text-gray-300 text-sm">Advanced ML models for accurate forecasting</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Globe className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Global Coverage</h3>
              <p className="text-gray-300 text-sm">Worldwide air quality insights</p>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEnter}
            className="group bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center mx-auto"
          >
            Enter Dashboard
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
