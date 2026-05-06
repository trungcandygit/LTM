import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class HttpBridge {
    static final int HTTP_PORT = 8080;
    static final String UDP_HOST = "localhost";
    static final int UDP_PORT = 9999;
    static final int UDP_TIMEOUT = 5000;

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(HTTP_PORT), 0);
        server.createContext("/api/loai", new ApiHandler());
        server.createContext("/api/tin", new ApiHandler());
        server.start();
        System.out.println("[HttpBridge] Dang chay tren port " + HTTP_PORT);
    }

    static String sendUDP(String message) throws Exception {
        DatagramSocket socket = new DatagramSocket();
        socket.setSoTimeout(UDP_TIMEOUT);
        byte[] buf = message.getBytes(StandardCharsets.UTF_8);
        InetAddress addr = InetAddress.getByName(UDP_HOST);
        DatagramPacket pkt = new DatagramPacket(buf, buf.length, addr, UDP_PORT);
        socket.send(pkt);
        byte[] respBuf = new byte[65507];
        DatagramPacket resp = new DatagramPacket(respBuf, respBuf.length);
        socket.receive(resp);
        socket.close();
        return new String(resp.getData(), 0, resp.getLength(), StandardCharsets.UTF_8);
    }

    static class ApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange ex) throws IOException {
            String method = ex.getRequestMethod();
            String path = ex.getRequestURI().getPath();
            String query = ex.getRequestURI().getQuery();

            ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            ex.getResponseHeaders().add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            ex.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
            ex.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");

            if ("OPTIONS".equals(method)) {
                ex.sendResponseHeaders(204, -1);
                return;
            }

            try {
                String response = route(method, path, query, ex);
                byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
                ex.sendResponseHeaders(200, bytes.length);
                try (OutputStream os = ex.getResponseBody()) {
                    os.write(bytes);
                }
            } catch (Exception e) {
                String err = "{\"error\":\"" + e.getMessage() + "\"}";
                byte[] bytes = err.getBytes(StandardCharsets.UTF_8);
                ex.sendResponseHeaders(500, bytes.length);
                try (OutputStream os = ex.getResponseBody()) {
                    os.write(bytes);
                }
            }
        }

        String route(String method, String path, String query, HttpExchange ex) throws Exception {
            String body = "";
            if (!"GET".equals(method) && !"DELETE".equals(method)) {
                body = new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            }

            // /api/loai
            if (path.equals("/api/loai")) {
                if ("GET".equals(method)) return sendUDP("GET_LOAI");
                if ("POST".equals(method)) {
                    Map<String, String> d = parseJson(body);
                    String icon = d.getOrDefault("icon", "tag");
                    String mau = d.getOrDefault("mauBadge", "blue");
                    return sendUDP("THEM_LOAI|" + d.get("ma") + "|" + d.get("ten") + "|" + icon + "|" + mau);
                }
            }

            // /api/loai/{ma}
            if (path.startsWith("/api/loai/")) {
                String ma = path.substring("/api/loai/".length());
                if ("PUT".equals(method)) {
                    Map<String, String> d = parseJson(body);
                    String icon = d.getOrDefault("icon", "tag");
                    String mau = d.getOrDefault("mauBadge", "blue");
                    return sendUDP("SUA_LOAI|" + ma + "|" + d.get("ten") + "|" + icon + "|" + mau);
                }
                if ("DELETE".equals(method)) return sendUDP("XOA_LOAI|" + ma);
            }

            // /api/tin
            if (path.equals("/api/tin")) {
                if ("GET".equals(method)) {
                    if (query != null && query.startsWith("loai=")) {
                        return sendUDP("GET_TIN_THEO_LOAI|" + query.substring(5));
                    }
                    if (query != null && query.startsWith("ngay=")) {
                        return sendUDP("GET_TIN_THEO_NGAY|" + query.substring(5));
                    }
                    return sendUDP("GET_TIN");
                }
                if ("POST".equals(method)) {
                    Map<String, String> d = parseJson(body);
                    return sendUDP("THEM_TIN|" + d.get("tieuDe") + "|" + d.get("noiDung") + "|"
                            + d.get("linkAnh") + "|" + d.get("ngayDang") + "|" + d.get("maLoai"));
                }
            }

            // /api/tin/{ma}
            if (path.startsWith("/api/tin/")) {
                String ma = path.substring("/api/tin/".length());
                if ("PUT".equals(method)) {
                    Map<String, String> d = parseJson(body);
                    return sendUDP("SUA_TIN|" + ma + "|" + d.get("tieuDe") + "|" + d.get("noiDung") + "|"
                            + d.get("linkAnh") + "|" + d.get("ngayDang") + "|" + d.get("maLoai"));
                }
                if ("DELETE".equals(method)) return sendUDP("XOA_TIN|" + ma);
            }

            return "{\"error\":\"Route khong ton tai\"}";
        }

        // Minimal JSON parser for simple flat objects
        Map<String, String> parseJson(String json) {
            Map<String, String> map = new LinkedHashMap<>();
            if (json == null || json.isBlank()) return map;
            json = json.trim();
            if (json.startsWith("{")) json = json.substring(1);
            if (json.endsWith("}")) json = json.substring(0, json.length() - 1);
            // split by , but not inside strings — simple approach for flat objects
            int i = 0;
            while (i < json.length()) {
                // skip whitespace
                while (i < json.length() && Character.isWhitespace(json.charAt(i))) i++;
                if (i >= json.length()) break;
                // read key
                String key = readJsonString(json, i);
                i += key.length() + 2; // skip quotes
                while (i < json.length() && (json.charAt(i) == ':' || Character.isWhitespace(json.charAt(i)))) i++;
                // read value
                String val;
                if (i < json.length() && json.charAt(i) == '"') {
                    val = readJsonString(json, i);
                    i += val.length() + 2;
                } else {
                    int end = json.indexOf(',', i);
                    if (end == -1) end = json.length();
                    val = json.substring(i, end).trim();
                    i = end;
                }
                map.put(key, val);
                while (i < json.length() && (json.charAt(i) == ',' || Character.isWhitespace(json.charAt(i)))) i++;
            }
            return map;
        }

        String readJsonString(String json, int start) {
            if (json.charAt(start) != '"') return "";
            StringBuilder sb = new StringBuilder();
            int i = start + 1;
            while (i < json.length()) {
                char c = json.charAt(i);
                if (c == '\\' && i + 1 < json.length()) {
                    i++;
                    char esc = json.charAt(i);
                    switch (esc) {
                        case '"': sb.append('"'); break;
                        case '\\': sb.append('\\'); break;
                        case 'n': sb.append('\n'); break;
                        case 'r': sb.append('\r'); break;
                        case 't': sb.append('\t'); break;
                        default: sb.append(esc);
                    }
                } else if (c == '"') {
                    break;
                } else {
                    sb.append(c);
                }
                i++;
            }
            return sb.toString();
        }
    }
}
