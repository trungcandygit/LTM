import java.net.*;
import java.sql.*;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.List;

public class UDPServer {
    static final int PORT = 9999;

    // === CAU HINH KET NOI MYSQL ===
    static final String DB_URL  = "jdbc:mysql://localhost:3306/news_manager?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";
    static final String DB_USER = "root";
    static final String DB_PASS = "";   // Mac dinh XAMPP khong co mat khau

    public static void main(String[] args) throws Exception {
        // Kiem tra ket noi truoc khi lang nghe
        try (Connection c = getConn()) {
            System.out.println("[UDPServer] Ket noi MySQL thanh cong!");
        } catch (SQLException e) {
            System.err.println("[UDPServer] LOI ket noi MySQL: " + e.getMessage());
            System.err.println("  -> Hay chay MySQL: net start mysql  (hoac bat XAMPP MySQL service)");
            System.err.println("  -> Hay chay SQL:   mysql -u root < news_manager.sql");
            System.exit(1);
        }

        DatagramSocket socket = new DatagramSocket(PORT);
        System.out.println("[UDPServer] Dang lang nghe UDP tren port " + PORT);

        byte[] buf = new byte[65507];
        while (true) {
            DatagramPacket pkt = new DatagramPacket(buf, buf.length);
            socket.receive(pkt);
            String msg = new String(pkt.getData(), 0, pkt.getLength(), "UTF-8").trim();
            String resp = xuLyLenh(msg);
            byte[] rb = resp.getBytes("UTF-8");
            socket.send(new DatagramPacket(rb, rb.length, pkt.getAddress(), pkt.getPort()));
        }
    }

    static Connection getConn() throws SQLException {
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
    }

    static String xuLyLenh(String lenh) {
        String[] p = lenh.split("\\|", -1);
        String cmd = p[0].trim();
        try {
            switch (cmd) {
                case "GET_LOAI":            return getLoai();
                case "THEM_LOAI":           return themLoai(p);
                case "SUA_LOAI":            return suaLoai(p);
                case "XOA_LOAI":            return xoaLoai(p);
                case "GET_TIN":             return getTin(null, null);
                case "GET_TIN_THEO_LOAI":   return getTin(p.length>1 ? p[1].trim() : null, null);
                case "GET_TIN_THEO_NGAY":   return getTin(null, p.length>1 ? p[1].trim() : null);
                case "THEM_TIN":            return themTin(p);
                case "SUA_TIN":             return suaTin(p);
                case "XOA_TIN":             return xoaTin(p);
                default: return "{\"error\":\"Lenh khong hop le\"}";
            }
        } catch (Exception e) {
            return "{\"error\":\"" + escJson(e.getMessage()) + "\"}";
        }
    }

    // ---- THE LOAI ----

    static String getLoai() throws SQLException {
        try (Connection c = getConn();
             PreparedStatement ps = c.prepareStatement(
                 "SELECT ma, ten, icon, mau_badge FROM the_loai ORDER BY ma");
             ResultSet rs = ps.executeQuery()) {
            List<String> list = new ArrayList<>();
            while (rs.next()) list.add(loaiToJson(rs));
            return "[" + String.join(",", list) + "]";
        }
    }

    static String themLoai(String[] p) throws SQLException {
        if (p.length < 4) return "{\"error\":\"Thieu tham so\"}";
        String ma = p[1].trim(), ten = p[2].trim(),
               icon = p[3].trim(), mau = p.length > 4 ? p[4].trim() : "blue";
        try (Connection c = getConn();
             PreparedStatement ps = c.prepareStatement(
                 "INSERT INTO the_loai(ma,ten,icon,mau_badge) VALUES(?,?,?,?)")) {
            ps.setString(1, ma); ps.setString(2, ten);
            ps.setString(3, icon); ps.setString(4, mau);
            ps.executeUpdate();
        }
        return loaiJsonRaw(ma, ten, icon, mau);
    }

    static String suaLoai(String[] p) throws SQLException {
        if (p.length < 3) return "{\"error\":\"Thieu tham so\"}";
        String ma = p[1].trim(), ten = p[2].trim(),
               icon = p.length > 3 ? p[3].trim() : "tag",
               mau  = p.length > 4 ? p[4].trim() : "blue";
        try (Connection c = getConn();
             PreparedStatement ps = c.prepareStatement(
                 "UPDATE the_loai SET ten=?,icon=?,mau_badge=? WHERE ma=?")) {
            ps.setString(1, ten); ps.setString(2, icon);
            ps.setString(3, mau); ps.setString(4, ma);
            if (ps.executeUpdate() == 0) return "{\"error\":\"Khong tim thay the loai\"}";
        }
        return loaiJsonRaw(ma, ten, icon, mau);
    }

    static String xoaLoai(String[] p) throws SQLException {
        if (p.length < 2) return "{\"error\":\"Thieu tham so\"}";
        String ma = p[1].trim();
        // Kiem tra con tin khong — MySQL foreign key se chặn nhung ta bắt lỗi dep hon
        try (Connection c = getConn()) {
            try (PreparedStatement chk = c.prepareStatement(
                    "SELECT COUNT(*) FROM tin_tuc WHERE ma_loai=?")) {
                chk.setString(1, ma);
                ResultSet rs = chk.executeQuery();
                rs.next();
                if (rs.getInt(1) > 0)
                    return "{\"error\":\"Con tin thuoc loai nay, khong the xoa\"}";
            }
            try (PreparedStatement del = c.prepareStatement(
                    "DELETE FROM the_loai WHERE ma=?")) {
                del.setString(1, ma);
                if (del.executeUpdate() == 0) return "{\"error\":\"Khong tim thay the loai\"}";
            }
        }
        return "{\"success\":true,\"ma\":\"" + escJson(ma) + "\"}";
    }

    // ---- TIN TUC ----

    static String getTin(String maLoai, String ngay) throws SQLException {
        StringBuilder sql = new StringBuilder(
            "SELECT ma,tieu_de,noi_dung,link_anh,ngay_dang,ma_loai FROM tin_tuc WHERE 1=1");
        if (maLoai != null && !maLoai.isEmpty()) sql.append(" AND ma_loai=?");
        if (ngay    != null && !ngay.isEmpty())   sql.append(" AND ngay_dang=?");
        sql.append(" ORDER BY ngay_dang DESC, ma DESC");

        try (Connection c = getConn();
             PreparedStatement ps = c.prepareStatement(sql.toString())) {
            int idx = 1;
            if (maLoai != null && !maLoai.isEmpty()) ps.setString(idx++, maLoai);
            if (ngay   != null && !ngay.isEmpty())   ps.setString(idx,   ngay);
            ResultSet rs = ps.executeQuery();
            List<String> list = new ArrayList<>();
            while (rs.next()) list.add(tinToJson(rs));
            return "[" + String.join(",", list) + "]";
        }
    }

    static String themTin(String[] p) throws SQLException {
        if (p.length < 6) return "{\"error\":\"Thieu tham so\"}";
        String tieuDe=p[1].trim(), noiDung=p[2].trim(),
               linkAnh=p[3].trim(), ngayDang=p[4].trim(), maLoai=p[5].trim();
        try (Connection c = getConn();
             PreparedStatement ps = c.prepareStatement(
                 "INSERT INTO tin_tuc(tieu_de,noi_dung,link_anh,ngay_dang,ma_loai) VALUES(?,?,?,?,?)",
                 Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1,tieuDe); ps.setString(2,noiDung);
            ps.setString(3,linkAnh); ps.setString(4,ngayDang); ps.setString(5,maLoai);
            ps.executeUpdate();
            ResultSet gk = ps.getGeneratedKeys();
            gk.next();
            int newMa = gk.getInt(1);
            return tinJsonRaw(newMa, tieuDe, noiDung, linkAnh, ngayDang, maLoai);
        }
    }

    static String suaTin(String[] p) throws SQLException {
        if (p.length < 7) return "{\"error\":\"Thieu tham so\"}";
        int ma;
        try { ma = Integer.parseInt(p[1].trim()); }
        catch (NumberFormatException e) { return "{\"error\":\"Ma tin khong hop le\"}"; }
        String tieuDe=p[2].trim(), noiDung=p[3].trim(),
               linkAnh=p[4].trim(), ngayDang=p[5].trim(), maLoai=p[6].trim();
        try (Connection c = getConn();
             PreparedStatement ps = c.prepareStatement(
                 "UPDATE tin_tuc SET tieu_de=?,noi_dung=?,link_anh=?,ngay_dang=?,ma_loai=? WHERE ma=?")) {
            ps.setString(1,tieuDe); ps.setString(2,noiDung); ps.setString(3,linkAnh);
            ps.setString(4,ngayDang); ps.setString(5,maLoai); ps.setInt(6,ma);
            if (ps.executeUpdate() == 0) return "{\"error\":\"Khong tim thay tin tuc\"}";
        }
        return tinJsonRaw(ma, tieuDe, noiDung, linkAnh, ngayDang, maLoai);
    }

    static String xoaTin(String[] p) throws SQLException {
        if (p.length < 2) return "{\"error\":\"Thieu tham so\"}";
        int ma;
        try { ma = Integer.parseInt(p[1].trim()); }
        catch (NumberFormatException e) { return "{\"error\":\"Ma tin khong hop le\"}"; }
        try (Connection c = getConn();
             PreparedStatement ps = c.prepareStatement("DELETE FROM tin_tuc WHERE ma=?")) {
            ps.setInt(1, ma);
            if (ps.executeUpdate() == 0) return "{\"error\":\"Khong tim thay tin tuc\"}";
        }
        return "{\"success\":true,\"ma\":" + ma + "}";
    }

    // ---- Helpers ----

    static String loaiToJson(ResultSet rs) throws SQLException {
        return loaiJsonRaw(rs.getString("ma"), rs.getString("ten"),
                           rs.getString("icon"), rs.getString("mau_badge"));
    }

    static String loaiJsonRaw(String ma, String ten, String icon, String mau) {
        return "{\"ma\":\""+escJson(ma)+"\",\"ten\":\""+escJson(ten)+
               "\",\"icon\":\""+escJson(icon)+"\",\"mauBadge\":\""+escJson(mau)+"\"}";
    }

    static String tinToJson(ResultSet rs) throws SQLException {
        return tinJsonRaw(rs.getInt("ma"), rs.getString("tieu_de"),
                rs.getString("noi_dung"), rs.getString("link_anh"),
                rs.getString("ngay_dang"), rs.getString("ma_loai"));
    }

    static String tinJsonRaw(int ma, String tieuDe, String noiDung,
                              String linkAnh, String ngayDang, String maLoai) {
        return "{\"ma\":"+ma+",\"tieuDe\":\""+escJson(tieuDe)+"\",\"noiDung\":\""+
               escJson(noiDung)+"\",\"linkAnh\":\""+escJson(linkAnh)+"\",\"ngayDang\":\""+
               escJson(ngayDang)+"\",\"maLoai\":\""+escJson(maLoai)+"\"}";
    }

    static String escJson(String s) {
        if (s == null) return "";
        return s.replace("\\","\\\\").replace("\"","\\\"")
                .replace("\n","\\n").replace("\r","\\r").replace("\t","\\t");
    }
}
