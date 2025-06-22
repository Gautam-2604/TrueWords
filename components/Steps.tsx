"use client";

import { Timeline } from "@/components/ui/timeline";
import { Users, Code, Zap } from "lucide-react";

export function StepsTimeline() {
  const steps = [
    {
      title: "Step 1: Smart Collection Forms",
      content: (
        <div>
          <p className="mb-4 text-sm text-neutral-800 dark:text-neutral-200">
            Create beautiful forms to collect text, image, and video testimonials. Customize them to fit your brand perfectly.
          </p>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-neutral-600 dark:text-neutral-300">User-friendly & responsive design</span>
          </div>
        </div>
      ),
    },
    {
      title: "Step 2: One-Click Embed",
      content: (
        <div>
          <p className="mb-4 text-sm text-neutral-800 dark:text-neutral-200">
            Easily embed testimonials using our auto-generated code snippets. Works with any website or platform.
          </p>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Copy. Paste. Done.</span>
          </div>
        </div>
      ),
    },
    {
      title: "Step 3: Instant Setup",
      content: (
        <div>
          <p className="mb-4 text-sm text-neutral-800 dark:text-neutral-200">
            Set up your organization, design the form, and start collecting testimonials in minutes.
          </p>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-neutral-600 dark:text-neutral-300">No tech skills needed</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="steps" className="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How to Start Collecting Testimonials
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A simple, three-step process to gather and showcase testimonials effortlessly.
          </p>
        </div>
        <Timeline data={steps} />
      </div>
    </section>
  );
}
