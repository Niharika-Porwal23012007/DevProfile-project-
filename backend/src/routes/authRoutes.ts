import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import axios from 'axios';
import { db } from '../db/database';
import { config } from '../config';
import { encryptToken, generateApiKey, hashApiKey, generateOAuthState } from '../services/cryptoService';
import { requireAuth } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

export const authRouter = Router();

// In-memory OAuth state tracker to prevent CSRF attacks (Section 9)
const pendingStates = new Set<string>();

/**
 * GET /api/auth/github
 * Start GitHub OAuth flow
 */
authRouter.get('/auth/github', (req: Request, res: Response) => {
  const state = generateOAuthState();
  pendingStates.add(state);

  // Expire state after 10 minutes
  setTimeout(() => pendingStates.delete(state), 10 * 60 * 1000);

  const scope = 'read:user user:email repo';
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.githubClientId}&scope=${encodeURIComponent(scope)}&state=${state}&redirect_uri=${encodeURIComponent(config.githubCallbackUrl)}`;

  res.json({
    url: githubAuthUrl,
    state
  });
});

/**
 * GET /api/auth/github/callback
 * Finish OAuth, verify state, exchange code for access token, create or update user
 */
authRouter.get('/auth/github/callback', async (req: Request, res: Response, next: NextFunction) => {
  const { code, state } = req.query as { code?: string; state?: string };

  if (!code || !state || !pendingStates.has(state)) {
    return next(new AppError('INVALID_STATE', 'Invalid or expired OAuth state parameter. Please try logging in again.', 400));
  }
  pendingStates.delete(state);

  try {
    // Exchange code for token
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code,
        redirect_uri: config.githubCallbackUrl
      },
      {
        headers: { Accept: 'application/json' },
        timeout: 10000
      }
    );

    const accessToken = tokenRes.data?.access_token;
    if (!accessToken) {
      throw new Error(tokenRes.data?.error_description || 'Failed to obtain access token from GitHub');
    }

    // Fetch user details from GitHub
    const userRes = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'DevProfile-App'
      }
    });

    const ghUser = userRes.data;
    const encryptedToken = encryptToken(accessToken);

    // Look up or create user
    let user = db.prepare('SELECT * FROM users WHERE github_id = ?').get(String(ghUser.id)) as any;
    let rawApiKey: string | null = null;

    if (!user) {
      const newId = randomUUID();
      rawApiKey = generateApiKey();
      const apiKeyHash = hashApiKey(rawApiKey);
      const publicSlug = (ghUser.login || `dev_${Math.floor(Math.random() * 10000)}`).toLowerCase();

      db.prepare(`
        INSERT INTO users (id, name, email, github_id, github_username, github_token_enc, api_key_hash, public_slug, is_public)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        newId,
        ghUser.name || ghUser.login,
        ghUser.email || `${ghUser.login}@users.noreply.github.com`,
        String(ghUser.id),
        ghUser.login,
        encryptedToken,
        apiKeyHash,
        publicSlug
      );

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(newId);
    } else {
      // Update token
      db.prepare('UPDATE users SET github_token_enc = ?, github_username = ? WHERE id = ?').run(
        encryptedToken,
        ghUser.login,
        user.id
      );
    }

    const sessionJwt = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // Redirect to frontend dashboard with token
    res.redirect(`${config.frontendUrl}/auth/callback?token=${sessionJwt}${rawApiKey ? `&apiKey=${rawApiKey}` : ''}`);
  } catch (err: any) {
    next(new AppError('OAUTH_ERROR', err.message || 'GitHub OAuth callback error', 500));
  }
});

/**
 * POST /api/auth/demo-login
 * Direct demo authentication for testing and professor evaluations
 */
authRouter.post('/auth/demo-login', (req: Request, res: Response) => {
  const user = db.prepare('SELECT id, name, email, github_username, leetcode_username, public_slug, is_public FROM users LIMIT 1').get() as any;

  if (!user) {
    return res.status(404).json({ error: { code: 'NO_USERS', message: 'No seed user available. Run seed script first.' } });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user
  });
});

/**
 * GET /api/me
 * Current user and connected sources status
 */
authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = db.prepare(`
    SELECT id, name, email, github_username, github_token_enc, leetcode_username,
           linkedin_sub, public_slug, is_public, timezone, created_at
    FROM users WHERE id = ?
  `).get(req.user!.id) as any;

  // Last sync logs
  const lastGithubSync = db.prepare("SELECT run_at, status FROM sync_logs WHERE user_id = ? AND source = 'github' ORDER BY run_at DESC LIMIT 1").get(user.id) as any;
  const lastLeetcodeSync = db.prepare("SELECT run_at, status FROM sync_logs WHERE user_id = ? AND source = 'leetcode' ORDER BY run_at DESC LIMIT 1").get(user.id) as any;

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      githubUsername: user.github_username,
      leetcodeUsername: user.leetcode_username,
      publicSlug: user.public_slug,
      isPublic: Boolean(user.is_public),
      timezone: user.timezone,
      createdAt: user.created_at
    },
    connectedSources: {
      github: {
        connected: Boolean(user.github_token_enc),
        username: user.github_username,
        lastSynced: lastGithubSync?.run_at || null,
        syncStatus: lastGithubSync?.status || 'never'
      },
      leetcode: {
        connected: Boolean(user.leetcode_username),
        username: user.leetcode_username,
        lastSynced: lastLeetcodeSync?.run_at || null,
        syncStatus: lastLeetcodeSync?.status || 'never'
      },
      vscode: {
        connected: true
      },
      linkedin: {
        connected: Boolean(user.linkedin_sub),
        mode: 'output_only'
      }
    }
  });
});

/**
 * POST /api/apikey/regenerate
 * Generates a new extension API key, hashes and stores it, returns raw key once
 */
authRouter.post('/apikey/regenerate', requireAuth, (req: Request, res: Response) => {
  const rawKey = generateApiKey();
  const hashed = hashApiKey(rawKey);

  db.prepare('UPDATE users SET api_key_hash = ? WHERE id = ?').run(hashed, req.user!.id);

  res.json({
    message: 'API key regenerated successfully. Store it safely in your VS Code extension settings; it will not be displayed again.',
    apiKey: rawKey
  });
});
