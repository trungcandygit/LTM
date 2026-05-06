public class TinTuc {
    public int ma;
    public String tieuDe;
    public String noiDung;
    public String linkAnh;
    public String ngayDang;
    public String maLoai;

    public TinTuc() {}

    public TinTuc(int ma, String tieuDe, String noiDung, String linkAnh, String ngayDang, String maLoai) {
        this.ma = ma;
        this.tieuDe = tieuDe;
        this.noiDung = noiDung;
        this.linkAnh = linkAnh;
        this.ngayDang = ngayDang;
        this.maLoai = maLoai;
    }

    public String toJson() {
        return String.format(
            "{\"ma\":%d,\"tieuDe\":\"%s\",\"noiDung\":\"%s\",\"linkAnh\":\"%s\",\"ngayDang\":\"%s\",\"maLoai\":\"%s\"}",
            ma,
            escapeJson(tieuDe),
            escapeJson(noiDung),
            escapeJson(linkAnh),
            escapeJson(ngayDang),
            escapeJson(maLoai)
        );
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
