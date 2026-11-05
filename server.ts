import http from 'http';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { clinicRouter } from './server/clinicRoutes.js';
import { videoRouter } from './server/videoRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  
  // Parse CLI args (e.g. tsx server.ts --port 3000 --host 0.0.0.0) or fallback to env
  const args = process.argv.slice(2);
  let portStr = process.env.PORT || '3000';
  let hostStr = '0.0.0.0';
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--port' || args[i] === '-p') && args[i + 1]) {
      portStr = args[i + 1];
    }
    if ((args[i] === '--host' || args[i] === '-h') && args[i + 1]) {
      hostStr = args[i + 1];
    }
  }
  const PORT = parseInt(portStr, 10);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes
  app.use('/api', clinicRouter);
  app.use('/api', videoRouter);

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = http.createServer(app);

  server.listen(PORT, hostStr, () => {
    console.log(`🏥 AI Clinic Server running on http://${hostStr}:${PORT}`);
  });
}

process.on('uncaughtException', (err) => {
  console.error('[Server Uncaught Exception]:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Server Unhandled Rejection]:', reason);
});

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
