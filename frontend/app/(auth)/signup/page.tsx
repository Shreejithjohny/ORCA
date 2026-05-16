'use client';

import React from 'react';
import Link from 'next/link';
import { WebGLShader } from '@/components/ui/web-gl-shader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      <WebGLShader />
      
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl text-white">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-zinc-400">
            Join the ORCA network and start monitoring systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-zinc-300">First Name</Label>
              <Input 
                id="firstName" 
                placeholder="John" 
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-zinc-300">Last Name</Label>
              <Input 
                id="lastName" 
                placeholder="Doe" 
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-zinc-300">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-zinc-300">Password</Label>
            <Input 
              id="password" 
              type="password" 
              className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20"
            />
          </div>
          <Link href="/dashboard" className="w-full">
            <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-6 transition-all duration-300 group mt-2">
              Create Account
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-white/5">
          <div className="text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
      
      {/* Branding Overlay */}
      <div className="fixed bottom-8 left-8 hidden lg:block">
        <h1 className="text-4xl font-bold text-white tracking-tighter flex items-center gap-2">
          ORCA <span className="text-purple-500 text-lg font-normal tracking-normal border-l border-white/20 pl-2">V2.0</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Operations & Reliability Command Assistant</p>
      </div>
    </div>
  );
}
