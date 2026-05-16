'use client';

import React from 'react';
import Link from 'next/link';
import { WebGLShader } from '@/components/ui/web-gl-shader';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Zap, Activity, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      <WebGLShader />
      
      {/* Navigation Header */}
      <nav className="absolute top-0 w-full px-8 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tighter">ORCA</span>
        </div>
        <Link href="/login">
          <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/5 font-medium">
            Login
          </Button>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 text-center px-4 max-w-5xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Zap className="h-3 w-3" />
          <span>Next-Gen System Monitoring</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          Operations & Reliability <br />
          <span className="text-blue-500 italic">Command Assistant</span>
        </h1>
        
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Real-time telemetry, anomaly detection, and AI-powered incident analysis 
          for complex distributed systems.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-7 text-lg font-bold rounded-2xl group transition-all duration-300 shadow-[0_0_40px_rgba(37,99,235,0.3)]">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white px-8 py-7 text-lg font-semibold rounded-2xl backdrop-blur-sm">
              Request Demo
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-blue-500/50 transition-colors">
            <Activity className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Live Telemetry</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Visualize real-time data streams from every corner of your infrastructure with sub-second latency.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-blue-500/50 transition-colors">
            <ShieldCheck className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Smart Anomaly</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Advanced machine learning models identify patterns and detect issues before they impact your users.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-blue-500/50 transition-colors">
            <BarChart3 className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Incident Analysis</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              AI-driven root cause analysis that connects the dots across your dependency graph automatically.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-zinc-600 text-xs font-medium uppercase tracking-[0.2em] z-10">
        Trusted by Enterprise Teams Worldwide
      </div>
    </div>
  );
}
