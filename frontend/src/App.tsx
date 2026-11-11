import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { InsightsPage } from './pages/InsightsPage';
import { PlannerPage } from './pages/PlannerPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { DraftsPage } from './pages/DraftsPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './api/client';
import { UserProfile, ConnectedSources } from './types';

export function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sources, setSources] = useState<ConnectedSources | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('devprofile_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('devprofile_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Check URL pathname for direct public portfolio navigation
  const path = window.location.pathname;
  if (path.startsWith('/portfolio/')) {
    const slug = path.replace('/portfolio/', '').split('/')[0];
    return <PortfolioPage publicSlug={slug} />;
  }

  // Handle OAuth callback token from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('devprofile_token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadUserProfile = async () => {
    const token = localStorage.getItem('devprofile_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.getMe();
      setUser(res.user);
      setSources(res.connectedSources);

      // Also get review count
      const rev = await api.getTodayReviews();
      setReviewCount((rev.dueToday || []).length);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      localStorage.removeItem('devprofile_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('devprofile_token');
    setUser(null);
    setSources(null);
  };

  const handleLoginSuccess = (token: string, userData: any) => {
    loadUserProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-gray-100 flex items-center justify-center text-sm font-medium">
        <div className="animate-spin mr-3 w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
        <span>Synchronizing your engineering footprint...</span>
      </div>
    );
  }

  if (!user || !sources) {
    return (
      <LandingPage
        theme={theme}
        onToggleTheme={toggleTheme}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-gray-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors">
      <Navbar
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        onSyncComplete={loadUserProfile}
        onSwitchProfile={() => loadUserProfile()}
      />

      <div className="flex flex-1">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          reviewCount={reviewCount}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {currentTab === 'dashboard' && <DashboardPage onNavigateTab={setCurrentTab} />}
          {currentTab === 'insights' && <InsightsPage />}
          {currentTab === 'planner' && <PlannerPage />}
          {currentTab === 'reviews' && <ReviewsPage />}
          {currentTab === 'drafts' && <DraftsPage />}
          {currentTab === 'onboarding' && <OnboardingPage />}
          {currentTab === 'settings' && (
            <SettingsPage
              user={user}
              connectedSources={sources}
              onUserUpdated={loadUserProfile}
              onLogout={handleLogout}
              theme={theme}
              onSetTheme={setTheme}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
