import React, { useState } from 'react';
import {
  Code,
  Flame,
  Brain,
  Linkedin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';
import { api } from '../api/client';

interface LandingPageProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    try {
      setLoadingDemo(true);
      setError(null);
      const res = await api.demoLogin();
      localStorage.setItem('devprofile_token', res.token);
      onLoginSuccess(res.token, res.user);
    } catch (err: any) {
      setError(err.message || 'Demo login failed. Make sure the backend server is running and seeded.');
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setError(null);
      const res = await api.getGithubAuthUrl();
      window.location.href = res.url;
    } catch (err: any) {
      setError('GitHub OAuth app not configured in local environment. Use Demo Mode for testing.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col justify-between">
      {/* Navigation */}
      <header className="border-b border-gray-800/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-mono font-bold text-white text-lg shadow-lg shadow-indigo-500/20">
            DP
          </div>
          <div>
            <span className="font-bold text-lg text-white">DevProfile</span>
            <span className="text-xs text-indigo-400 ml-2 font-mono">v1.0</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDemoLogin}
            disabled={loadingDemo}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loadingDemo ? 'Logging in...' : 'Demo Login (Instant)'}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center flex flex-col items-center">
        {error && (
          <div className="mb-6 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Core Loop: Activity → Insight → Action → Visibility</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
          Stop scattering your developer progress. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Unify and elevate it.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
          Aggregators only display static counts. DevProfile actively finds your weak topics, detects study vs build imbalances, recommends daily actions, and writes verified LinkedIn posts.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={handleDemoLogin}
            disabled={loadingDemo}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
          >
            <span>Launch Interactive Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleGithubLogin}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <Code className="w-4 h-4 text-gray-400" />
            <span>Login with GitHub</span>
          </button>
        </div>

        {/* 4 Pillars Feature Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-4 w-full text-left">
          <div className="bg-gray-900/60 border border-gray-800 p-5 rounded-2xl hover:border-gray-700 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Unified Heatmap</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Merges GitHub commits, LeetCode solves, and VS Code active coding hours into one truthful matrix.
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 p-5 rounded-2xl hover:border-gray-700 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Weakness & Spaced Repetition</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Detects under-practiced topics and automatically queues struggled problems for 3, 7, and 21 day reviews.
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 p-5 rounded-2xl hover:border-gray-700 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">AI Daily Planner</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Generates 3 prioritized tasks each morning with clear factual explanations and rule-based safeguards.
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 p-5 rounded-2xl hover:border-gray-700 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <Linkedin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Verified LinkedIn Drafts</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Anti-fabrication post generator using strictly verified database counts with 1-click clipboard copy.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 py-8 px-6 text-center text-xs text-gray-500 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          Medi-Caps University Final Year Project (2026) • Team: Niharika Porwal, Shruti Sunil Choudhary, Somya Gupta
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>AES-256 Encrypted Tokens • Privacy-First Metadata Only</span>
        </div>
      </footer>
    </div>
  );
};
