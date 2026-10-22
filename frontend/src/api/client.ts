const API_BASE = '/api';

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('devprofile_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const contentType = res.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMsg = data?.error?.message || res.statusText || 'Request failed';
    const errorCode = data?.error?.code || 'API_ERROR';
    throw new ApiError(errorCode, errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  getGithubAuthUrl: () => apiRequest<{ url: string; state: string }>('/auth/github'),
  demoLogin: () => apiRequest<{ token: string; user: any }>('/auth/demo-login', { method: 'POST' }),
  getMe: () => apiRequest<{ user: any; connectedSources: any }>('/me'),
  regenerateApiKey: () => apiRequest<{ apiKey: string; message: string }>('/apikey/regenerate', { method: 'POST' }),

  // Sync
  connectLeetCode: (username: string) => apiRequest('/connect/leetcode', { method: 'POST', body: JSON.stringify({ username }) }),
  syncNow: () => apiRequest('/sync', { method: 'POST' }),

  // Dashboard & Insights
  getDashboard: (range = '30d') => apiRequest(`/dashboard?range=${range}`),
  getInsights: () => apiRequest('/insights'),
  updateGoal: (type: string, targetValue: number, period: string) =>
    apiRequest('/goals', { method: 'POST', body: JSON.stringify({ type, targetValue, period }) }),

  // Spaced Repetition Reviews & Notes
  getTodayReviews: () => apiRequest('/reviews/today'),
  completeReview: (id: string, passed: boolean) =>
    apiRequest(`/reviews/${id}/done`, { method: 'POST', body: JSON.stringify({ passed }) }),
  getProblemNote: (slug: string) => apiRequest(`/notes/${slug}`),
  saveProblemNote: (slug: string, noteText: string, patternTag: string) =>
    apiRequest(`/notes/${slug}`, { method: 'POST', body: JSON.stringify({ noteText, patternTag }) }),

  // AI Planner
  getDailyPlan: (refresh = false) => apiRequest(`/plan/today${refresh ? '?refresh=true' : ''}`),
  togglePlanTask: (index: number) => apiRequest(`/plan/task/${index}/toggle`, { method: 'POST' }),

  // LinkedIn Drafts & Reports
  generateDraft: (type: 'weekly' | 'project' | 'profile', repoName?: string) =>
    apiRequest('/drafts', { method: 'POST', body: JSON.stringify({ type, repoName }) }),
  markDraftPosted: (id: string) => apiRequest(`/drafts/${id}/mark-posted`, { method: 'POST' }),
  getWeeklyReport: () => apiRequest('/report/weekly'),

  // Portfolio
  getPublicPortfolio: (slug: string) => apiRequest(`/portfolio/${slug}`),

  // Account & Export
  downloadExportUrl: '/api/export',
  updatePrivacy: (isPublic: boolean) => apiRequest('/account/privacy', { method: 'PATCH', body: JSON.stringify({ isPublic }) }),
  deleteAccount: () => apiRequest('/account', { method: 'DELETE' })
};
