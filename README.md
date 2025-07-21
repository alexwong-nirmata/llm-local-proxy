# Chat Service

A simple Node.js Express service with a `/chat` endpoint for handling chat messages.

## Features

- ✅ POST `/chat` endpoint for sending messages (simulates LLM with 1-minute delay)
- ✅ WebSocket streaming for "in progress" data (The Scientist - Coldplay lyrics)
- ✅ GET `/health` endpoint for health checks
- ✅ CORS enabled for cross-origin requests
- ✅ Security headers with Helmet
- ✅ Request logging with Morgan
- ✅ JSON body parsing
- ✅ Error handling middleware
- ✅ Input validation
- ✅ Static file serving for test page

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

## API Endpoints

### POST /chat

Send a chat message to the service. This endpoint simulates an LLM response with:
1. **WebSocket streaming** of "in progress" data (The Scientist - Coldplay lyrics)
2. **15-second delay** before final response (Never Let Me Down Again - Depeche Mode lyrics)

**Request Body:**
```json
{
  "message": "Hello, world!",
  "userId": "user123",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Required Fields:**
- `message` (string) - The chat message content

**Optional Fields:**
- `userId` (string) - User identifier (defaults to "anonymous")
- `timestamp` (string) - Message timestamp (defaults to current time)

**WebSocket Events:**
- `streaming` - Emitted every second with streaming data
  - `type: 'in_progress'` - Contains lyrics from The Scientist
  - `type: 'streaming_complete'` - Indicates streaming is finished

**Final Response (after 15 seconds):**
```json
{
  "id": "1704067200000",
  "message": "Never Let Me Down Again - Depeche Mode\n\nI'm taking a ride with my best friend...",
  "userId": "user123",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "status": "completed",
  "streamingCompleted": true
}
```

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

### Test Page
Visit `http://localhost:3000/test.html` to see the LLM simulation in action with real-time streaming!

### Using curl

```bash
# Send a simple message (will wait 15 seconds for response)
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

### Using JavaScript (fetch + WebSocket)

```javascript
// Connect to WebSocket for streaming
const socket = io('http://localhost:3000');

// Listen for streaming data
socket.on('streaming', (data) => {
  if (data.type === 'in_progress') {
    console.log('Streaming:', data.data);
  } else if (data.type === 'streaming_complete') {
    console.log('Streaming complete');
  }
});

// Send a chat message (will wait 15 seconds for response)
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
console.log('Final response:', result);
```

### Using Python (requests + websocket-client)

```python
import requests
import websocket
import json

# Connect to WebSocket for streaming
ws = websocket.WebSocket()
ws.connect("ws://localhost:3000")

# Listen for streaming data
def on_message(ws, message):
    data = json.loads(message)
    if data.get('type') == 'in_progress':
        print(f"Streaming: {data['data']}")
    elif data.get('type') == 'streaming_complete':
        print("Streaming complete")

ws.on_message = on_message

# Send a chat message (will wait 15 seconds for response)
response = requests.post('http://localhost:3000/chat', json={
    'message': 'Hello from Python!',
    'userId': 'user456'
})

print('Final response:', response.json())
```

## Error Handling

The service includes comprehensive error handling:

- **400 Bad Request**: Missing required fields
- **404 Not Found**: Invalid endpoints
- **500 Internal Server Error**: Server errors

All error responses include an `error` field with a description.

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

### Environment Variables

- `PORT` - Server port (default: 3000)

## Dependencies

- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **morgan** - HTTP request logger
- **socket.io** - WebSocket support for real-time streaming
- **nodemon** - Development auto-restart (dev dependency)

## License

MIT 