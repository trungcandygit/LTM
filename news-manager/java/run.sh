#!/bin/bash
# Script chay News Manager UDP Backend
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Bien dich Java sources ==="
javac TinTuc.java TheLoaiTin.java UDPServer.java HttpBridge.java

echo "=== Dung cac process cu (neu co) ==="
pkill -f "UDPServer" 2>/dev/null || true
pkill -f "HttpBridge" 2>/dev/null || true
sleep 1

echo "=== Khoi dong UDPServer (port 9999) ==="
java UDPServer &
UDP_PID=$!
sleep 1

echo "=== Khoi dong HttpBridge (port 8080) ==="
java HttpBridge &
HTTP_PID=$!
sleep 1

echo ""
echo "====================================="
echo "  NewsManager Backend da chay!"
echo "====================================="
echo "  UDP Server : localhost:9999 (PID $UDP_PID)"
echo "  HTTP Bridge: http://localhost:8080  (PID $HTTP_PID)"
echo "====================================="
echo ""
echo "Mo trinh duyet va vao: news-manager/index.html"
echo "Nhan Ctrl+C de dung servers"
echo ""

# Wait for both
wait $UDP_PID $HTTP_PID
