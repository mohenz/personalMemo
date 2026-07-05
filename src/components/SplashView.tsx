import React, { useEffect } from 'react';
import { FileText, Tablet } from 'lucide-react';

interface SplashViewProps {
  onComplete: () => void;
}

export default function SplashView({ onComplete }: SplashViewProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2400); // 2.4 seconds for smooth loading bar showcase
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <main className="relative w-full h-screen flex flex-col items-center justify-center bg-white overflow-hidden select-none">
      {/* Subtle Paper Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#0058be 0.5px, transparent 0.5px)', 
          backgroundSize: '24px 24px' 
        }}
      />
      
      {/* Center Branding Content */}
      <div className="relative z-10 flex flex-col items-center animate-fade-in-scale">
        {/* Minimalist Notebook Icon Logo */}
        <div className="relative w-24 h-24 mb-8 group cursor-pointer">
          {/* Outer Canvas / Notebook Cover */}
          <div className="absolute inset-0 bg-primary rounded-xl notebook-shadow transform rotate-[-2deg] transition-transform group-hover:rotate-[-6deg]" />
          <div className="absolute inset-0 bg-white border border-outline-variant rounded-xl flex items-center justify-center transform transition-transform group-hover:rotate-[2deg] shadow-sm">
            <FileText className="text-primary w-12 h-12 stroke-[1.5]" />
            
            {/* Tactile Detail: S-Pen Element */}
            <div className="absolute -right-2 top-4 w-1.5 h-12 bg-primary-fixed-dim rounded-full shadow-sm" />
          </div>
        </div>
        
        {/* Brand Name */}
        <h1 className="font-sans text-3xl font-bold text-primary tracking-tight mb-2">
          Personal Notes
        </h1>
        <p className="font-sans text-xs text-text-secondary tracking-widest uppercase font-semibold">
          Digital Stationery
        </p>
      </div>

      {/* Bottom Loading Section */}
      <div className="absolute bottom-24 w-64 flex flex-col items-center">
        {/* Smooth Progress Track */}
        <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden mb-4">
          <div className="loading-bar h-full w-full" />
        </div>
        
        {/* Platform Identity */}
        <div className="flex items-center gap-2 opacity-40">
          <Tablet className="w-4.5 h-4.5 text-on-surface" />
          <span className="font-sans text-sm font-medium">Galaxy Tab Optimized</span>
        </div>
      </div>

      {/* Background Atmospheric Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-fixed opacity-10 rounded-full blur-[120px]" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-primary opacity-5 rounded-full blur-[100px]" />
    </main>
  );
}
