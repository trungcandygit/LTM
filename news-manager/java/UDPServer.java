import java.net.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

public class UDPServer {
    static final int PORT = 9999;
    static final int BUFFER_SIZE = 65507;

    static Map<String, TheLoaiTin> dsLoai = new ConcurrentHashMap<>();
    static Map<Integer, TinTuc> dsTin = new ConcurrentHashMap<>();
    static AtomicInteger nextMaTin = new AtomicInteger(9);

    public static void main(String[] args) throws Exception {
        khoiTaoDuLieuMau();
        DatagramSocket socket = new DatagramSocket(PORT);
        System.out.println("[UDPServer] Dang lang nghe tren port " + PORT);
        byte[] buf = new byte[BUFFER_SIZE];
        while (true) {
            DatagramPacket packet = new DatagramPacket(buf, buf.length);
            socket.receive(packet);
            String msg = new String(packet.getData(), 0, packet.getLength(), "UTF-8").trim();
            String response = xuLyLenh(msg);
            byte[] respBytes = response.getBytes("UTF-8");
            DatagramPacket resp = new DatagramPacket(respBytes, respBytes.length,
                    packet.getAddress(), packet.getPort());
            socket.send(resp);
        }
    }

    static void khoiTaoDuLieuMau() {
        dsLoai.put("CN", new TheLoaiTin("CN", "Cong nghe", "laptop", "blue"));
        dsLoai.put("TT", new TheLoaiTin("TT", "The thao", "ball-football", "green"));
        dsLoai.put("KT", new TheLoaiTin("KT", "Kinh te", "trending-up", "yellow"));
        dsLoai.put("GT", new TheLoaiTin("GT", "Giai tri", "device-tv", "red"));

        dsTin.put(1, new TinTuc(1, "AI tao ra dot pha moi trong y te", "Cac nha khoa hoc su dung AI de chan doan benh sow mai hieu qua hon.", "https://picsum.photos/seed/ai1/400/200", "2026-05-01", "CN"));
        dsTin.put(2, new TinTuc(2, "ChatGPT cap nhat phien ban 5.0", "OpenAI chinh thuc ra mat ChatGPT 5.0 voi nhieu tinh nang vuot troi.", "https://picsum.photos/seed/ai2/400/200", "2026-05-02", "CN"));
        dsTin.put(3, new TinTuc(3, "Viet Nam vo dich SEA Games bong da", "Doi tuyen Viet Nam gianh huy chuong vang tai SEA Games 35.", "https://picsum.photos/seed/sport1/400/200", "2026-05-01", "TT"));
        dsTin.put(4, new TinTuc(4, "Giai Ngoai hang Anh vao hoi ket", "Manchester City dan dau bang xep hang voi 5 vong dau con lai.", "https://picsum.photos/seed/sport2/400/200", "2026-05-03", "TT"));
        dsTin.put(5, new TinTuc(5, "Lam phat giam xuong 2.1% trong thang 4", "Ngan hang nha nuoc cong bo bao cao lam phat thang 4 giam manh.", "https://picsum.photos/seed/eco1/400/200", "2026-05-02", "KT"));
        dsTin.put(6, new TinTuc(6, "Chung khoan tang manh, VN-Index vuot 1500", "Thi truong chung khoan Viet Nam ghi nhan phien tang an tuong.", "https://picsum.photos/seed/eco2/400/200", "2026-05-04", "KT"));
        dsTin.put(7, new TinTuc(7, "Phim bom tan Marvel cong pha phong ve", "Avengers Secret Wars thu ve 200 trieu USD trong ngay dau cong chieu.", "https://picsum.photos/seed/ent1/400/200", "2026-05-03", "GT"));
        dsTin.put(8, new TinTuc(8, "Ca si V-Pop vua len top Billboard", "Mot nghe si tre Viet Nam lan dau len duoc top 50 Billboard.", "https://picsum.photos/seed/ent2/400/200", "2026-05-05", "GT"));
    }

    static String xuLyLenh(String lenh) {
        String[] parts = lenh.split("\\|", -1);
        String cmd = parts[0].trim();

        try {
            switch (cmd) {
                case "GET_LOAI": return getLoai();
                case "THEM_LOAI": return themLoai(parts);
                case "SUA_LOAI": return suaLoai(parts);
                case "XOA_LOAI": return xoaLoai(parts);
                case "GET_TIN": return getTin();
                case "GET_TIN_THEO_LOAI": return getTinTheoLoai(parts);
                case "GET_TIN_THEO_NGAY": return getTinTheoNgay(parts);
                case "THEM_TIN": return themTin(parts);
                case "SUA_TIN": return suaTin(parts);
                case "XOA_TIN": return xoaTin(parts);
                default: return "{\"error\":\"Lenh khong hop le\"}";
            }
        } catch (Exception e) {
            return "{\"error\":\"" + e.getMessage() + "\"}";
        }
    }

    static String getLoai() {
        String json = dsLoai.values().stream()
            .map(l -> l.toJson())
            .collect(Collectors.joining(",", "[", "]"));
        return json;
    }

    static String themLoai(String[] parts) {
        if (parts.length < 4) return "{\"error\":\"Thieu tham so\"}";
        String ma = parts[1].trim();
        String ten = parts[2].trim();
        String icon = parts[3].trim();
        String mau = parts.length > 4 ? parts[4].trim() : "blue";
        if (dsLoai.containsKey(ma)) return "{\"error\":\"Ma loai da ton tai\"}";
        TheLoaiTin loai = new TheLoaiTin(ma, ten, icon, mau);
        dsLoai.put(ma, loai);
        return loai.toJson();
    }

    static String suaLoai(String[] parts) {
        if (parts.length < 3) return "{\"error\":\"Thieu tham so\"}";
        String ma = parts[1].trim();
        String ten = parts[2].trim();
        String icon = parts.length > 3 ? parts[3].trim() : "";
        String mau = parts.length > 4 ? parts[4].trim() : "blue";
        TheLoaiTin loai = dsLoai.get(ma);
        if (loai == null) return "{\"error\":\"Khong tim thay the loai\"}";
        loai.ten = ten;
        if (!icon.isEmpty()) loai.icon = icon;
        if (!mau.isEmpty()) loai.mauBadge = mau;
        dsLoai.put(ma, loai);
        return loai.toJson();
    }

    static String xoaLoai(String[] parts) {
        if (parts.length < 2) return "{\"error\":\"Thieu tham so\"}";
        String ma = parts[1].trim();
        boolean conTin = dsTin.values().stream().anyMatch(t -> ma.equals(t.maLoai));
        if (conTin) return "{\"error\":\"Con tin thuoc loai nay, khong the xoa\"}";
        TheLoaiTin removed = dsLoai.remove(ma);
        if (removed == null) return "{\"error\":\"Khong tim thay the loai\"}";
        return "{\"success\":true,\"ma\":\"" + ma + "\"}";
    }

    static String getTin() {
        String json = dsTin.values().stream()
            .sorted(Comparator.comparing((TinTuc t) -> t.ngayDang).reversed())
            .map(t -> t.toJson())
            .collect(Collectors.joining(",", "[", "]"));
        return json;
    }

    static String getTinTheoLoai(String[] parts) {
        if (parts.length < 2) return "{\"error\":\"Thieu tham so\"}";
        String maLoai = parts[1].trim();
        String json = dsTin.values().stream()
            .filter(t -> maLoai.equals(t.maLoai))
            .sorted(Comparator.comparing((TinTuc t) -> t.ngayDang).reversed())
            .map(t -> t.toJson())
            .collect(Collectors.joining(",", "[", "]"));
        return json;
    }

    static String getTinTheoNgay(String[] parts) {
        if (parts.length < 2) return "{\"error\":\"Thieu tham so\"}";
        String ngay = parts[1].trim();
        String json = dsTin.values().stream()
            .filter(t -> ngay.equals(t.ngayDang))
            .map(t -> t.toJson())
            .collect(Collectors.joining(",", "[", "]"));
        return json;
    }

    static String themTin(String[] parts) {
        if (parts.length < 6) return "{\"error\":\"Thieu tham so\"}";
        int ma = nextMaTin.getAndIncrement();
        TinTuc tin = new TinTuc(ma, parts[1].trim(), parts[2].trim(),
                parts[3].trim(), parts[4].trim(), parts[5].trim());
        dsTin.put(ma, tin);
        return tin.toJson();
    }

    static String suaTin(String[] parts) {
        if (parts.length < 7) return "{\"error\":\"Thieu tham so\"}";
        int ma;
        try { ma = Integer.parseInt(parts[1].trim()); }
        catch (NumberFormatException e) { return "{\"error\":\"Ma tin khong hop le\"}"; }
        TinTuc tin = dsTin.get(ma);
        if (tin == null) return "{\"error\":\"Khong tim thay tin tuc\"}";
        tin.tieuDe = parts[2].trim();
        tin.noiDung = parts[3].trim();
        tin.linkAnh = parts[4].trim();
        tin.ngayDang = parts[5].trim();
        tin.maLoai = parts[6].trim();
        dsTin.put(ma, tin);
        return tin.toJson();
    }

    static String xoaTin(String[] parts) {
        if (parts.length < 2) return "{\"error\":\"Thieu tham so\"}";
        int ma;
        try { ma = Integer.parseInt(parts[1].trim()); }
        catch (NumberFormatException e) { return "{\"error\":\"Ma tin khong hop le\"}"; }
        TinTuc removed = dsTin.remove(ma);
        if (removed == null) return "{\"error\":\"Khong tim thay tin tuc\"}";
        return "{\"success\":true,\"ma\":" + ma + "}";
    }
}
