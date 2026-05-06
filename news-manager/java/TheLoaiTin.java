public class TheLoaiTin {
    public String ma;
    public String ten;
    public String icon;
    public String mauBadge;

    public TheLoaiTin() {}

    public TheLoaiTin(String ma, String ten, String icon, String mauBadge) {
        this.ma = ma;
        this.ten = ten;
        this.icon = icon;
        this.mauBadge = mauBadge;
    }

    public String toJson() {
        return String.format(
            "{\"ma\":\"%s\",\"ten\":\"%s\",\"icon\":\"%s\",\"mauBadge\":\"%s\"}",
            escapeJson(ma),
            escapeJson(ten),
            escapeJson(icon),
            escapeJson(mauBadge)
        );
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}
