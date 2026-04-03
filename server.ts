import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Regular JSON parsing for other routes
  app.use(express.json());
  app.use(cors());

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasKey: !!process.env.GEMINI_API_KEY });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    
    // Explicit fallback for SPA routing in development
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      
      const url = req.originalUrl;
      fs.promises.readFile(path.resolve(process.cwd(), 'index.html'), 'utf-8')
        .then(template => vite.transformIndexHtml(url, template))
        .then(template => res.status(200).set({ 'Content-Type': 'text/html' }).end(template))
        .catch(e => {
          vite.ssrFixStacktrace(e as Error);
          next(e);
        });
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
