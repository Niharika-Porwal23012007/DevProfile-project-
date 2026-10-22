import { app } from './app';
import { config } from './config';
import { initScheduler } from './cron/scheduler';
import { initDatabase } from './db/database';

initDatabase();
initScheduler();

const port = config.port;

app.listen(port, () => {
  console.log(`=======================================================`);
  console.log(` DevProfile Backend API running on port ${port}`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` API Base: http://localhost:${port}/api`);
  console.log(`=======================================================`);
});
