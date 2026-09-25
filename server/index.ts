import express from 'express';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { config } from './config.js';
import { apiErrorHandler, createApiRouter } from './api.js';

const app = express();
const httpServer = createServer(app);
const production = process.argv.includes('--production');
app.disable('x-powered-by');

// This is a local-only server. Reject foreign hosts and cross-origin mutations.
app.use((req, res, next) => {
  const allowedHosts = [`localhost:${config.port}`, `127.0.0.1:${config.port}`];
  if (!allowedHosts.includes(req.headers.host ?? '')) {
    res.status(403).json({ message: 'Local requests only.' });
    return;
  }
  if (req.path.startsWith('/api') && !['GET', 'HEAD'].includes(req.method)) {
    if (
      req.headers.origin !== `http://${req.headers.host}` ||
      !req.is('application/json')
    ) {
      res
        .status(403)
        .json({ message: 'A same-origin JSON request is required.' });
      return;
    }
  }
  next();
});
app.use(
  '/api',
  express.json({ limit: '10kb' }),
  createApiRouter(),
  apiErrorHandler,
);

if (production) {
  app.use(express.static(resolve('dist')));
  app.get('/{*path}', (_req, res) => {
    res.sendFile(resolve('dist/index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: { server: httpServer } },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

httpServer.on('error', (error: NodeJS.ErrnoException) => {
  console.error(
    error.code === 'EADDRINUSE'
      ? `Port ${config.port} is in use. Stop the other server or change PORT in .env.`
      : 'Could not start the local server.',
  );
  process.exit(1);
});
httpServer.listen(config.port, '127.0.0.1', () => {
  console.log(`\n  Storefront: http://localhost:${config.port}\n`);
});
