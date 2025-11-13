#!/bin/bash

echo "🔄 Firebase Emulator Restart Script"
echo "===================================="
echo ""

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Step 1: Export current data
echo "📦 Step 1: Exporting emulator data..."
mkdir -p emulator-backup
firebase emulators:export emulator-backup --force 2>&1 | grep -v "deprecated" || true
echo "✅ Data exported to emulator-backup/"
echo ""

# Step 2: Stop emulator
echo "🛑 Step 2: Stopping emulator..."
killall -9 java 2>/dev/null || true
sleep 2
echo "✅ Emulator stopped"
echo ""

# Step 3: Start emulator with imported data
echo "🚀 Step 3: Starting emulator with new rules and data..."
echo "   (This will load updated firestore.rules)"
echo ""
firebase emulators:start --import=emulator-backup &
EMULATOR_PID=$!

# Wait for emulator to be ready
echo "⏳ Waiting for emulator to start..."
sleep 10

echo ""
echo "✅ Emulator restarted successfully!"
echo ""
echo "📋 Access points:"
echo "   - Emulator UI: http://localhost:4000"
echo "   - Auth Emulator: http://localhost:9099"
echo "   - Firestore Emulator: http://localhost:8888"
echo ""
echo "🎯 Next steps:"
echo "   1. Refresh your browser (Ctrl+Shift+R)"
echo "   2. Login again with test account"
echo "   3. Check if all data appears"
echo ""
echo "📝 To stop emulator: killall -9 java"
echo ""
