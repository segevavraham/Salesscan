#!/bin/bash

# Sales Coach AI - Demo Server Startup Script

echo "🚀 Starting Sales Coach AI Demo Server..."
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEMO_DIR="$SCRIPT_DIR/demo"

# Check if demo directory exists
if [ ! -d "$DEMO_DIR" ]; then
    echo "❌ Error: Demo directory not found at $DEMO_DIR"
    exit 1
fi

# Check if port 8080 is already in use
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 8080 is already in use. Killing existing process..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Start the server
cd "$DEMO_DIR"
echo "📂 Serving from: $DEMO_DIR"
echo "🌐 Server starting on http://localhost:8080"
echo ""
echo "✅ Demo is ready!"
echo ""
echo "📋 Next steps:"
echo "   1. Open http://localhost:8080 in Chrome"
echo "   2. Make sure the extension is loaded (chrome://extensions/)"
echo "   3. Configure your API key in extension settings"
echo "   4. Click 'התחל הקלטה' in the demo"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start Python HTTP server
python3 -m http.server 8080

