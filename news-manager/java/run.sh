#!/bin/bash
# Script chay News Manager - MySQL Backend
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

JAR="lib/mysql-connector-j-8.3.0.jar"

if [ ! -f "$JAR" ]; then
    echo "[ERROR] Khong tim thay $JAR"
    echo "        Tai ve: https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.3.0/mysql-connector-j-8.3.0.jar"
    exit 1
fi

echo "=== Bien dich Java sources ==="
javac -cp "$JAR" TinTuc.java TheLoaiTin.java UDPServer.java HttpBridge.java

echo "=== Dung cac process cu (neu co) ==="
kill $(pgrep -f "UDPServer") 2>/dev/null || true
kill $(pgrep -f "HttpBridge") 2>/dev/null || true
sleep 1

echo "=== Khoi dong UDPServer (port 9999) ==="
java -cp ".:$JAR" UDPServer &
UDP_PID=$!
sleep 2

echo "=== Khoi dong HttpBridge (port 8080) ==="
java -cp ".:$JAR" HttpBridge &
HTTP_PID=$!
sleep 1

echo ""
echo "====================================="
echo "  NewsManager Backend da chay!"
echo "====================================="
echo "  Database : MySQL news_manager"
echo "  UDP Server : localhost:9999  (PID $UDP_PID)"
echo "  HTTP Bridge: http://localhost:8080  (PID $HTTP_PID)"
echo "====================================="
echo ""
echo "Mo index.html trong trinh duyet"
echo "Nhan Ctrl+C de dung"
echo ""

wait $UDP_PID $HTTP_PID
