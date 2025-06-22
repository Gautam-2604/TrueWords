'use client'
import React from 'react';

import { StepsTimeline } from '@/components/Steps';
import HeroSection from '@/components/HeroSection';
import Testimonials from '@/components/Testimonials';
import { useAuth } from '@/context/authContext';

export default function HomePage() {
  const user = useAuth()
  console.log(user);
  
  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-gray-900">
      
      <HeroSection />
      <StepsTimeline />
      <Testimonials />


    </div>
  );
}