# LLM Local Proxy

A Node.js reverse proxy server that forwards chat requests to a local copilot service running on port 8443.

## Features

- ✅ POST `/chat` endpoint that proxies to local copilot service
- ✅ GET `/health` endpoint for health checks
- ✅ CORS enabled for cross-origin requests
- ✅ Security headers with Helmet
- ✅ Request logging with Morgan
- ✅ JSON body parsing
- ✅ Error handling middleware
- ✅ Static file serving

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

**Note:** This server requires a copilot service to be running on `https://127.0.0.1:8443/copilot?chunked=true` for the `/chat` endpoint to work properly.

## API Endpoints

### POST /chat

Proxies chat requests to the local copilot service. This endpoint forwards the request body directly to `https://127.0.0.1:8443/copilot?chunked=true`.

**Request Body:**
```json
{
  "message": "Hello, world!",
  "userId": "user123",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response:** The response from the copilot service is forwarded directly back to the client, including:
- Status code
- Headers
- Response body

**Error Handling:**
- If the copilot service is not running, returns a 500 error with connection details
- All other errors are logged and returned as appropriate HTTP status codes

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Usage Examples

### Using curl

```bash
# Send a chat message (proxied to copilot service)
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from curl!"}'

# Send a message with user ID
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "userId": "alice"}'

# Check health
curl http://localhost:3000/health
```

### Using JavaScript (fetch)

```javascript
// Send a chat message (proxied to copilot service)
const response = await fetch('http://localhost:3000/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Hello from JavaScript!',
    userId: 'user123'
  })
});

const result = await response.json();
console.log('Response from copilot:', result);
```

### Using Python (requests)

```python
import requests

# Send a chat message (proxied to copilot service)
response = requests.post('http://localhost:3000/chat', json={
    'message': 'Hello from Python!',
    'userId': 'user456'
})

print('Response from copilot:', response.json())
```

## Error Handling

The service includes comprehensive error handling:

- **404 Not Found**: Invalid endpoints
- **500 Internal Server Error**: Server errors or copilot service connection failures

All error responses include an `error` field with a description.

## Configuration

### Copilot Service

The server expects a copilot service to be running at:
- **URL**: `https://127.0.0.1:8443/copilot?chunked=true`
- **Method**: POST
- **Content-Type**: application/json

The server will forward all requests to this endpoint and return the response directly.

### Environment Variables

- `PORT` - Server port (default: 3000)

## Development

### Project Structure

```
├── src/
│   └── server.js          # Main server file
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

### Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-restart
- `npm test` - Run tests (not implemented yet)

## Dependencies

- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **morgan** - HTTP request logger
- **nodemon** - Development auto-restart (dev dependency)

## Troubleshooting

### Socket.IO Connection Errors

If you see repeated Socket.IO connection attempts in the server logs like:
```
GET /socket.io/?EIO=4&transport=websocket HTTP/1.1" 404
```

This is normal behavior. The server is designed as a simple HTTP reverse proxy and does not support WebSocket connections. Any client attempting to connect via Socket.IO will receive a proper 404 JSON response. These errors do not affect the server's functionality.

### Copilot Service Connection

If the `/chat` endpoint returns a 500 error, ensure that:
1. Your copilot service is running on `https://127.0.0.1:8443`
2. The service accepts POST requests at `/copilot?chunked=true`
3. The service is configured to accept JSON content

## License

MIT 