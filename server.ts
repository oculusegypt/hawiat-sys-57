import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure default session secret for dev environment
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'cleanflow-hawiat-secret-key-2026-studio';

// Import existing API Express application
import apiApp from './artifacts/api-server/src/app.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Allow iframe embedding in AI Studio and remove any frame blocking headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.removeHeader("X-Frame-Options");
    next();
  });

  // Serve static assets (images, uploads, favicon, icons)
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/images', express.static(path.join(__dirname, 'public/images')));
  app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
  app.use('/uploads', express.static(path.join(__dirname, 'build_php/uploads')));
  app.use('/uploads', express.static(path.join(__dirname, 'attached_assets')));

  // Mount API server router and middlewares
  app.use(apiApp);

  if (!isProd) {
    // Create Vite server in middleware mode
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      // Don't intercept API or upload requests
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
        return next();
      }

      const url = req.originalUrl;
      try {
        const indexHtmlPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexHtmlPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Production: serve built static files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CleanFlow server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CleanFlow server:', err);
  process.exit(1);
});
