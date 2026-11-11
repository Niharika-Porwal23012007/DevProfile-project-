import React, { useState, useEffect } from 'react';
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
  Clock,
  UserPlus,
  LogIn,
  Sun,
  Moon,
  Github,
  Award
} from 'lucide-react';
import { api } from '../api/client';
import { GitHubLogo, LeetCodeLogo, VSCodeLogo, LinkedInLogo, GeminiAILogo, GlobalBadge } from '../components/BrandIcons';

interface LandingPageProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLoginSuccess: (token: string, user: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  theme,
  onToggleTheme,
  onLoginSuccess
}) => {
  const [authMode, setAuthMode] = useState<'quick' | 'custom'>('custom');
  const [profiles, setProfiles] = useState<any[]>([]);

  // Form states for registering / logging in any ID
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getProfiles().then(res => setProfiles(res.profiles || [])).catch(() => {});
  }, []);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!githubUsername.trim() && !leetcodeUsername.trim() && !email.trim()) {
      setError('Please provide at least a GitHub username, LeetCode username, or Email.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.registerOrLogin({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        githubUsername: githubUsername.trim() || undefined,
        leetcodeUsername: leetcodeUsername.trim() || undefined
      });

      localStorage.setItem('devprofile_token', res.token);
      onLoginSuccess(res.token, res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (p: any) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.registerOrLogin({
        email: p.email,
        githubUsername: p.github_username,
        leetcodeUsername: p.leetcode_username
      });
      localStorage.setItem('devprofile_token', res.token);
      onLoginSuccess(res.token, res.user);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-gray-100 flex flex-col justify-between transition-colors">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-gray-800/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full bg-white/80 dark:bg-transparent backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center font-mono font-bold text-white text-lg shadow-lg shadow-indigo-500/25">
            DP
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              DevProfile
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                v2.0
              </span>
            </span>
            <span className="text-xs text-slate-500 dark:text-gray-400 hidden sm:block">Unified Engineering Analytics &amp; Growth Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-700/60 transition shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Quick Demo Button */}
          <button
            onClick={() => handleQuickSelect(profiles[0] || { email: 'developer@devprofile.io', name: 'Niharika Porwal' })}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo</span>
          </button>
        </div>
      </header>

      {/* Hero & Login Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Value Proposition & Visual Showcase */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            <GeminiAILogo className="w-4 h-4" />
            <span>Powered by Google Gemini 1.5 Flash + Rule-Based Diagnostics</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Unified analytics for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
              ambitious student developers.
            </span>
          </h1>

          <p className="text-base text-slate-600 dark:text-gray-300 max-w-xl leading-relaxed">
            Stop guessing your interview readiness. DevProfile continuously gathers real activity from <strong>GitHub</strong>, <strong>LeetCode</strong>, and <strong>VS Code</strong>, diagnoses weak algorithmic topics, detects study vs. build imbalances, and prescribes daily AI action plans.
          </p>

          {/* Integrated Platform Badges */}
          <div className="pt-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-500 block mb-3">
              Automated Synchronizations Across:
            </span>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-sm text-xs font-bold text-slate-800 dark:text-gray-200">
                <GitHubLogo className="w-4 h-4" />
                <span>GitHub Repos &amp; Commits</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-sm text-xs font-bold text-slate-800 dark:text-gray-200">
                <LeetCodeLogo className="w-4 h-4" />
                <span>LeetCode Solves &amp; Topics</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-sm text-xs font-bold text-slate-800 dark:text-gray-200">
                <VSCodeLogo className="w-4 h-4" />
                <span>VS Code Active Minutes</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-sm text-xs font-bold text-slate-800 dark:text-gray-200">
                <LinkedInLogo className="w-4 h-4" />
                <span>LinkedIn Verified Posts</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Guarantee */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-gray-800">
            <div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">100%</div>
              <div className="text-xs text-slate-500 dark:text-gray-400">Privacy &bull; No code read</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">&lt; 120ms</div>
              <div className="text-xs text-slate-500 dark:text-gray-400">Cached fast response</div>
            </div>
            <div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">Ebbinghaus</div>
              <div className="text-xs text-slate-500 dark:text-gray-400">Spaced repetition queue</div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Login / Registration Card for ANY User */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-7 shadow-2xl space-y-5 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-800">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Access Your DevProfile</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">Log in or connect any developer ID</p>
              </div>
              <GlobalBadge className="w-7 h-7" />
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 dark:bg-gray-800/80 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode('custom')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  authMode === 'custom'
                    ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Enter Any ID</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('quick')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  authMode === 'quick'
                    ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Team Profiles ({profiles.length})</span>
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Tab 1: Form to enter ANY ID */}
            {authMode === 'custom' && (
              <form onSubmit={handleCustomLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-gray-300 block mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-gray-300 block mb-1">
                    GitHub Username <span className="text-slate-400 font-normal">(for repo &amp; commit sync)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <GitHubLogo className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="e.g. niharikaporwal"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-gray-300 block mb-1">
                    LeetCode Username <span className="text-slate-400 font-normal">(for DSA solves sync)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LeetCodeLogo className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={leetcodeUsername}
                      onChange={(e) => setLeetcodeUsername(e.target.value)}
                      placeholder="e.g. niharikaporwal"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-gray-300 block mb-1">
                    Email Address <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. developer@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Connecting & Syncing Platforms...' : 'Start Tracking My Progress'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Tab 2: Quick Profile Switcher for existing students */}
            {authMode === 'quick' && (
              <div className="space-y-2">
                <span className="text-xs text-slate-500 dark:text-gray-400 block mb-2">
                  Click on any team member or registered student ID to log in immediately:
                </span>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleQuickSelect(p)}
                      disabled={loading}
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-gray-800/60 hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-700/80 transition text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white uppercase">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white">{p.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-gray-400">
                            gh: @{p.github_username || 'none'} &bull; lc: @{p.leetcode_username || 'none'}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 text-center text-[11px] text-slate-400 dark:text-gray-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero passwords or LeetCode cookies requested. Metadata only.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-gray-800/80 py-6 px-6 text-center text-xs text-slate-500 dark:text-gray-400 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          DevProfile &bull; Autonomous Developer Portfolio &amp; Engineering Intelligence Platform
        </div>
        <div className="flex items-center gap-4">
          <a href="/terms" className="hover:text-slate-900 dark:hover:text-white transition">Privacy Policy</a>
          <span>&bull;</span>
          <a href="/docs" className="hover:text-slate-900 dark:hover:text-white transition">Documentation</a>
          <span>&bull;</span>
          <span>&copy; {new Date().getFullYear()} DevProfile Inc.</span>
        </div>
      </footer>
    </div>
  );
};
