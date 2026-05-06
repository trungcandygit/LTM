#!/bin/zsh
# Khoi dong toan bo NewsManager (MySQL + UDPServer + HttpBridge + Browser)

SCRIPT_DIR="${0:A:h}"
JAVA_DIR="$SCRIPT_DIR/java"
JAR="$JAVA_DIR/lib/mysql-connector-j-8.3.0.jar"
MYSQL="/Applications/XAMPP/xamppfiles/bin/mysql.server"

# Mau sac terminal
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

echo "${BOLD}${BLUE}"
echo "╔══════════════════════════════════╗"
echo "║     NewsManager  Launcher        ║"
echo "╚══════════════════════════════════╝${NC}"

# --- 1. MySQL ---
echo "\n${YELLOW}[1/4] Kiem tra MySQL...${NC}"
if /Applications/XAMPP/xamppfiles/bin/mysqladmin -u root status &>/dev/null; then
    echo "${GREEN}  ✓ MySQL dang chay${NC}"
else
    echo "  Dang khoi dong MySQL..."
    sudo "$MYSQL" start
    sleep 2
fi

# --- 2. Compile ---
echo "\n${YELLOW}[2/4] Bien dich Java...${NC}"
cd "$JAVA_DIR"
# Chi compile lai neu .java moi hon .class
if [[ ! -f UDPServer.class ]] || [[ UDPServer.java -nt UDPServer.class ]]; then
    javac -cp "$JAR" *.java && echo "${GREEN}  ✓ Bien dich thanh cong${NC}" \
        || { echo "${RED}  ✗ Bien dich that bai${NC}"; exit 1; }
else
    echo "${GREEN}  ✓ Da co .class, bo qua bien dich${NC}"
fi

# --- 3. Dung process cu ---
echo "\n${YELLOW}[3/4] Khoi dong servers...${NC}"
kill $(lsof -ti:9999) 2>/dev/null; kill $(lsof -ti:8080) 2>/dev/null
sleep 1

# Chay UDPServer
java -cp ".:$JAR" UDPServer &> /tmp/udpserver.log &
UDP_PID=$!
sleep 1
if kill -0 $UDP_PID 2>/dev/null; then
    echo "${GREEN}  ✓ UDPServer chay (port 9999, PID $UDP_PID)${NC}"
else
    echo "${RED}  ✗ UDPServer that bai. Xem log: cat /tmp/udpserver.log${NC}"; exit 1
fi

# Chay HttpBridge
java -cp ".:$JAR" HttpBridge &> /tmp/httpbridge.log &
HTTP_PID=$!
sleep 1
if kill -0 $HTTP_PID 2>/dev/null; then
    echo "${GREEN}  ✓ HttpBridge chay (port 8080, PID $HTTP_PID)${NC}"
else
    echo "${RED}  ✗ HttpBridge that bai. Xem log: cat /tmp/httpbridge.log${NC}"; exit 1
fi

# --- 4. Mo trinh duyet ---
echo "\n${YELLOW}[4/4] Mo trinh duyet...${NC}"
sleep 1
open "$SCRIPT_DIR/index.html"

echo "\n${GREEN}${BOLD}"
echo "╔══════════════════════════════════╗"
echo "║  NewsManager dang chay!          ║"
echo "║  UDP  : localhost:9999           ║"
echo "║  HTTP : http://localhost:8080    ║"
echo "╚══════════════════════════════════╝${NC}"
echo "  Nhan ${BOLD}Ctrl+C${NC} de dung tat ca servers\n"

# Doi — khi Ctrl+C thi kill ca 2
trap "echo '\n${YELLOW}Dang dung servers...${NC}'; kill $UDP_PID $HTTP_PID 2>/dev/null; echo '${GREEN}Da dung.${NC}'" INT
wait $UDP_PID $HTTP_PID
