import React from 'react';

export const GitHubLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const LeetCodeLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.823.662l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.536.553-1.387.039-1.901l-2.609-2.636a5.27 5.27 0 00-3.85-1.428c-1.494 0-2.906.592-3.974 1.661l-4.32 4.381A5.62 5.62 0 001.68 14.34c0 1.516.591 2.94 1.66 4.01l4.332 4.363c1.069 1.069 2.502 1.661 4.017 1.661 1.516 0 2.949-.592 4.018-1.661l2.608-2.636c.514-.514.496-1.365-.039-1.9-.535-.536-1.386-.554-1.9-.039z" fill="#FFA116" />
    <path d="M10.802 14.34c0 .762.618 1.38 1.38 1.38h9.638c.762 0 1.38-.618 1.38-1.38s-.618-1.38-1.38-1.38h-9.638c-.762 0-1.38.618-1.38 1.38z" fill="#000000" className="dark:fill-white" />
  </svg>
);

export const VSCodeLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M17.5 2L5.8 11.2l4.8 3.7L17.5 2z" fill="#0065A9" />
    <path d="M17.5 22L5.8 12.8l4.8-3.7L17.5 22z" fill="#007ACC" />
    <path d="M17.5 2l5 2.5v15l-5 2.5L7.5 12 17.5 2z" fill="#1F9CF0" />
    <path d="M3.5 12l2.3-1.8L3.5 8.4a1 1 0 00-1.5.8v5.6a1 1 0 001.5.8l2.3-1.8L3.5 12z" fill="#0065A9" />
  </svg>
);

export const LinkedInLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

export const GeminiAILogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 2C12 7.523 7.523 12 2 12C7.523 12 12 16.477 12 22C12 16.477 16.477 12 22 12C16.477 12 12 7.523 12 2Z" fill="url(#gemini_grad)" />
    <defs>
      <linearGradient id="gemini_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4E75FF" />
        <stop offset="0.5" stopColor="#B372CE" />
        <stop offset="1" stopColor="#FF7387" />
      </linearGradient>
    </defs>
  </svg>
);

export const GlobalDevBadge: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <div className={`relative flex items-center justify-center font-bold text-white rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-md ${className}`}>
    <span className="text-[10px] tracking-tighter">DP</span>
  </div>
);

// Convenient alias exports
export const GitHubIcon = GitHubLogo;
export const LeetCodeIcon = LeetCodeLogo;
export const VSCodeIcon = VSCodeLogo;
export const LinkedInIcon = LinkedInLogo;
export const GeminiIcon = GeminiAILogo;
export const GlobalBadge = GlobalDevBadge;
