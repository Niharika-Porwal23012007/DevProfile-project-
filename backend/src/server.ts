import { app } from './app';
import { config } from './config';
import { initScheduler } from './cron/scheduler';
import { initDatabase, db } from './db/database';
import { runSeed } from './db/seed';

initDatabase();
initScheduler();

// Auto-seed demo data if running in a fresh deployment (e.g. Render)
try {
  const userCheck = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (!userCheck || userCheck.count === 0) {
    console.log('[Server] No existing users found. Auto-seeding initial database...');
    runSeed();
  }
} catch (e) {
  console.warn('[Server] Auto-seed check notice:', e);
}

const port = config.port;

app.listen(port, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` DevProfile Backend API running on port ${port} (0.0.0.0)`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` API Base: http://localhost:${port}/api`);
  console.log(`=======================================================`);
});
