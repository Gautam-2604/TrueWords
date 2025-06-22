"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { theme } = useTheme();

  useEffect(() => {
    const handleMouseMove = (e: any) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const isDark = theme === "dark";

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
          : "bg-gradient-to-br from-white via-blue-100 to-white"
      }`}
    >
      {/* Animated background gradient */}
      <div
        className={`absolute inset-0 animate-pulse ${
          isDark
            ? "bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"
            : "bg-gradient-to-r from-blue-300/20 via-purple-200/20 to-pink-200/20"
        }`}
      />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className={`absolute w-96 h-96 rounded-full blur-3xl ${
            isDark
              ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30"
              : "bg-gradient-to-r from-blue-300/30 to-purple-300/30"
          }`}
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            left: "10%",
            top: "20%",
          }}
        />
        <motion.div
          className={`absolute w-80 h-80 rounded-full blur-3xl ${
            isDark
              ? "bg-gradient-to-r from-pink-500/20 to-orange-500/20"
              : "bg-gradient-to-r from-pink-300/20 to-orange-300/20"
          }`}
          animate={{
            x: [0, -150, 150, 0],
            y: [0, 150, -150, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            right: "10%",
            bottom: "20%",
          }}
        />
      </div>

      {/* Mouse follower */}
      <motion.div
        className="absolute w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-sm pointer-events-none z-50"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-6">
            {"Collect testimonials that".split(" ").map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, rotateX: -90, y: 50 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className="inline-block mr-4 bg-gradient-to-r from-black via-blue-500 to-purple-600 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent"
              >
                {word}
              </motion.span>
            ))}
            <br />
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.5,
                type: "spring",
                stiffness: 200,
              }}
              className="inline-block bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-black"
            >
              convert & build trust
            </motion.span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className={`text-xl md:text-2xl text-center max-w-4xl mx-auto mb-12 ${
            isDark ? "text-slate-300" : "text-slate-700"
          } leading-relaxed`}
        >
          Collect powerful{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
            testimonials with ease
          </span>{" "}
          — create forms, gather photos, videos, or text responses, and embed
          them beautifully on your site with just a snippet.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-semibold text-lg overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2">
              Start Building Now
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-4 border-2 ${
              isDark ? "border-white/20" : "border-black/20"
            } rounded-full ${
              isDark ? "text-white" : "text-black"
            } font-semibold text-lg backdrop-blur-sm hover:border-white/40 transition-all duration-300`}
          >
            Watch Demo
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            { number: "10,000+", label: "Websites Created" },
            { number: "99.9%", label: "Uptime Guarantee" },
            { number: "24/7", label: "Support Available" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className={`text-center p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
                isDark
                  ? "bg-white/5 border-white/10 hover:border-white/20"
                  : "bg-black/5 border-black/10 hover:border-black/20"
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 1.8 + index * 0.2,
                  type: "spring",
                  stiffness: 200,
                }}
                className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
              >
                {stat.number}
              </motion.div>
              <div
                className={`font-medium ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating dots */}
        <div
          className="absolute top-20 left-10 w-4 h-4 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute bottom-40 left-20 w-2 h-2 bg-pink-400 rounded-full animate-bounce"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-60 right-10 w-5 h-5 bg-blue-300 rounded-full animate-bounce"
          style={{ animationDelay: "1.5s" }}
        />
      </div>
    </div>
  );
}
