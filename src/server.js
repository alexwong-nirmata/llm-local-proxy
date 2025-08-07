const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Function to proxy request to copilot endpoint
function proxyToCopilot(req, res) {
  const postData = JSON.stringify(req.body);

  const options = {
    hostname: '127.0.0.1',
    port: 8443,
    path: '/copilot?chunked=true',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      // Forward Authorization header if present
      ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
      // Forward other headers you might need
      ...(req.headers['user-agent'] && { 'User-Agent': req.headers['user-agent'] }),
      ...(req.headers['accept'] && { 'Accept': req.headers['accept'] }),
      ...(req.headers['accept-language'] && { 'Accept-Language': req.headers['accept-language'] })
    },
    rejectUnauthorized: false // This is equivalent to -k flag in curl
  };

  const proxyReq = https.request(options, (proxyRes) => {
    // Forward status code
    res.status(proxyRes.statusCode);
    
    // Forward headers
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });

    // Pipe the response directly
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    console.error('Error proxying to copilot:', error);
    res.status(500).json({
      error: 'Failed to connect to copilot service',
      message: error.message
    });
  });

  proxyReq.write(postData);
  proxyReq.end();
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
})); // Security headers with custom CSP
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static('public')); // Serve static files



// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Chat endpoint - reverse proxy to copilot
app.post('/chat', (req, res) => {
  // Log the incoming request
  console.log('Proxying request to copilot:', {
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Proxy the request directly to copilot
  proxyToCopilot(req, res);
});

app.post('/copilot', (req, res) => {
  // Log the incoming request
  console.log('Proxying request to copilot:', {
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Proxy the request directly to copilot
  proxyToCopilot(req, res);
});

// Catch-all route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: {
      'GET /health': 'Health check',
      'POST /chat': 'Send a chat message (proxies to copilot service)'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Reverse proxy running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/chat -> https://127.0.0.1:8443/copilot?chunked=true`);
});

module.exports = app; 