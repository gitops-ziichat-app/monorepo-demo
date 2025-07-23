import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { formatDate, generateId, capitalize, isEmpty } from '@gitops-ziichat-app/utils';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: formatDate(new Date()),
    version: process.env.npm_package_version || '0.0.0'
  });
});

// Root endpoint
app.get('/api/v1', (c) => {
  return c.json({
    message: 'Welcome to Monorepo Demo API',
    timestamp: formatDate(new Date()),
    endpoints: [
      'GET /health - Health check',
      'GET /utils/id - Generate random ID',
      'POST /utils/capitalize - Capitalize text',
      'POST /utils/validate - Check if value is empty'
    ]
  });
});
app.get('/api/v2/api-test', (c) => {
  return c.json({
    message: 'Welcome to Monorepo Demo API',
    timestamp: formatDate(new Date()),
    endpoints: [
      'GET /health - Health check',
      'GET /utils/id - Generate random ID',
      'POST /utils/capitalize - Capitalize text',
      'POST /utils/validate - Check if value is empty'
    ]
  });
});
// Utility endpoints
app.get('/utils/id', (c) => {
  return c.json({
    id: generateId(),
    timestamp: formatDate(new Date())
  });
});

app.post('/utils/capitalize', async (c) => {
  const body = await c.req.json();
  const { text } = body;
  
  if (!text || typeof text !== 'string') {
    return c.json({ error: 'Text is required and must be a string' }, 400);
  }
  
  return c.json({
    original: text,
    capitalized: capitalize(text),
    timestamp: formatDate(new Date())
  });
});

app.post('/utils/validate', async (c) => {
  const body = await c.req.json();
  const { value } = body;
  
  return c.json({
    value,
    isEmpty: isEmpty(value),
    timestamp: formatDate(new Date())
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const port = parseInt(process.env.PORT || '3000');

export default {
  port,
  fetch: app.fetch,
};

// Start server if this file is run directly
console.log(`🚀 Server is running on http://0.0.0.0:${port}`);


