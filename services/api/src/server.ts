import { createApp } from './app.js';
import { config, validateConfig } from './config/env.js';

const startServer = async () => {
  try {
    validateConfig();

    const app = createApp();
    const port = config.port;

    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🔗 CORS origin: ${config.cors.origin}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
