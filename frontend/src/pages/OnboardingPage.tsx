import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Key,
  Download,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { api } from '../api/client';

export const OnboardingPage: React.FC = () => {
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [connectingLc, setConnectingLc] = useState(false);
  const [lcStatus, setLcStatus] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleConnectLeetcode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leetcodeUsername.trim()) return;
    try {
      setConnectingLc(true);
      setLcStatus(null);
      await api.connectLeetCode(leetcodeUsername.trim());
      setLcStatus(`Successfully connected LeetCode profile for @${leetcodeUsername}!`);
    } catch (err: any) {
      setLcStatus(`Error: ${err.message}`);
    } finally {
      setConnectingLc(false);
    }
  };

  const handleGenerateKey = async () => {
    try {
      setGeneratingKey(true);
      const res = await api.regenerateApiKey();
      setApiKey(res.apiKey);
    } catch (err: any) {
      console.error(err);
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleCopyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span>Student Onboarding &amp; Extension Setup (Section 8)</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Complete these 3 steps to connect your LeetCode profile, generate your editor key, and track daily coding sessions.
        </p>
      </div>

      <div className="space-y-4">
        {/* Step 1: Connect LeetCode */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <div>
              <h3 className="font-bold text-sm text-white">Connect LeetCode Public Profile</h3>
              <p className="text-xs text-gray-400">No passwords or session cookies needed (Section 3.2).</p>
            </div>
          </div>

          <form onSubmit={handleConnectLeetcode} className="flex gap-3 max-w-md">
            <input
              type="text"
              value={leetcodeUsername}
              onChange={(e) => setLeetcodeUsername(e.target.value)}
              placeholder="e.g. niharikaporwal"
              className="flex-1 px-3.5 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={connectingLc}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              {connectingLc ? 'Verifying...' : 'Connect'}
            </button>
          </form>

          {lcStatus && (
            <div className={`mt-3 text-xs flex items-center gap-2 ${lcStatus.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{lcStatus}</span>
            </div>
          )}
        </div>

        {/* Step 2: VS Code Personal API Key */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <div>
              <h3 className="font-bold text-sm text-white">Generate VS Code Extension API Key</h3>
              <p className="text-xs text-gray-400">Stored hashed on server and shown once for maximum security (Section 9).</p>
            </div>
          </div>

          {apiKey ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-gray-950 border border-indigo-500/30 flex items-center justify-between font-mono text-xs text-indigo-300">
                <span>{apiKey}</span>
                <button
                  onClick={handleCopyKey}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-amber-400">
                ⚠️ Store this key safely; it will not be displayed again. You can regenerate anytime.
              </p>
            </div>
          ) : (
            <button
              onClick={handleGenerateKey}
              disabled={generatingKey}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold border border-gray-700 transition"
            >
              {generatingKey ? 'Generating...' : 'Generate Personal API Key'}
            </button>
          )}
        </div>

        {/* Step 3: Install Extension Instructions */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </span>
            <div>
              <h3 className="font-bold text-sm text-white">Install and Configure the Extension</h3>
              <p className="text-xs text-gray-400">Companion extension located in repository /extension folder.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="p-3.5 rounded-xl bg-gray-950 font-mono text-gray-300 border border-gray-800 space-y-2">
              <div className="text-gray-500"># 1. Package or load extension folder in VS Code:</div>
              <div className="text-indigo-400">cd extension && npm run compile</div>
              <div className="text-gray-500 mt-2"># 2. Press F5 in VS Code to launch Extension Host, or install vsix.</div>
              <div className="text-gray-500 mt-2"># 3. Open Settings (Cmd+,) and search "DevProfile":</div>
              <div className="text-emerald-400">DevProfile: Api Key &rarr; [Paste your generated key]</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-800">
                <span className="font-bold text-white block mb-1">Commands Available:</span>
                <ul className="space-y-1 text-gray-400 text-[11px]">
                  <li>• <span className="font-mono text-gray-300">DevProfile: Start Problem</span> (Start LeetCode timer)</li>
                  <li>• <span className="font-mono text-gray-300">DevProfile: Mark Solved</span> (Record solve &amp; struggle)</li>
                  <li>• <span className="font-mono text-gray-300">DevProfile: Pomodoro Start/Stop</span> (25m focus)</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-800">
                <span className="font-bold text-white block mb-1">Privacy Guarantee:</span>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Source code content is <strong className="text-white">never</strong> read or sent. Only project name, language ID, and session elapsed minutes are recorded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
