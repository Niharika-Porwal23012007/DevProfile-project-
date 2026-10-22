import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../app';
import { runSeed } from '../db/seed';

let authToken = '';
const apiKey = 'devprof_seed_secret_key_123';

before(() => {
  runSeed();
});

describe('DevProfile Backend Integration Tests (Section 4 & 11)', () => {
  it('POST /api/auth/demo-login authenticates and returns JWT', async () => {
    const res = await request(app).post('/api/auth/demo-login');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.name, 'Niharika Porwal');
    authToken = res.body.token;
  });

  it('GET /api/me returns user profile and connected sources', async () => {
    const res = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.githubUsername, 'niharikaporwal');
    assert.strictEqual(res.body.connectedSources.github.connected, true);
    assert.strictEqual(res.body.connectedSources.leetcode.connected, true);
  });

  it('POST /api/sessions accepts VS Code session batches with extension API key', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${apiKey}`)
      .send({
        sessions: [
          {
            project: 'devprofile',
            repoUrl: 'https://github.com/niharikaporwal/devprofile',
            language: 'TypeScript',
            file: 'src/components/Planner.tsx',
            start: new Date().toISOString(),
            durationSec: 1800
          }
        ]
      });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.message.includes('Successfully ingested'));
  });

  it('POST /api/problem-times records timer and schedules review on struggle', async () => {
    const res = await request(app)
      .post('/api/problem-times')
      .set('Authorization', `Bearer ${apiKey}`)
      .send({
        problem: 'word-break',
        durationSec: 2500, // > 2400s triggers struggled
        difficultyFeeling: 'Struggled'
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.spacedRepetitionScheduled, true);
  });

  it('GET /api/dashboard returns merged metrics, heatmap, and goals', async () => {
    const res = await request(app)
      .get('/api/dashboard?range=30d')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.today);
    assert.ok(res.body.streak.currentStreak >= 0);
    assert.ok(res.body.heatmap.length > 0);
    assert.ok(res.body.recentRepositories.length > 0);
  });

  it('GET /api/insights returns weakness analysis and balance status', async () => {
    const res = await request(app)
      .get('/api/insights')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.weaknesses.weakestTopics);
    assert.ok(res.body.balance.message);
    assert.ok(res.body.interviewReadiness.overallScore > 0);
  });

  it('GET /api/reviews/today and POST /api/reviews/:id/done handles spaced repetition', async () => {
    const listRes = await request(app)
      .get('/api/reviews/today')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(listRes.status, 200);
    assert.ok(listRes.body.dueToday.length > 0);

    const firstReview = listRes.body.dueToday[0];
    const doneRes = await request(app)
      .post(`/api/reviews/${firstReview.id}/done`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ passed: true });

    assert.strictEqual(doneRes.status, 200);
    assert.ok(doneRes.body.nextInterval !== undefined);
  });

  it('GET /api/plan/today returns 3 tasks with explicit reasons', async () => {
    const res = await request(app)
      .get('/api/plan/today')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.tasks.length, 3);
    assert.strictEqual(res.body.tasks[0].type, 'practice');
    assert.strictEqual(res.body.tasks[1].type, 'project');
    assert.ok(res.body.tasks[0].reason);
  });

  it('POST /api/drafts generates verified LinkedIn progress post without fabrication', async () => {
    const res = await request(app)
      .post('/api/drafts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ type: 'weekly' });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.text.includes('Weekly Dev & DSA Progress Update'));
    assert.ok(res.body.text.includes('devprofile'));
  });

  it('GET /api/portfolio/:publicSlug serves public portfolio without auth', async () => {
    const res = await request(app).get('/api/portfolio/niharika');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.name, 'Niharika Porwal');
    assert.ok(res.body.verifiedStats.totalSolves > 0);
  });

  it('GET /api/export downloads all user records as JSON', async () => {
    const res = await request(app)
      .get('/api/export')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.name, 'Niharika Porwal');
    assert.ok(res.body.githubDaily.length > 0);
    assert.ok(res.body.leetcodeSnapshots.length > 0);
  });
});
