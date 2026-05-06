#!/bin/zsh
# Quan ly database news_manager bang terminal (giong phpMyAdmin nhung trong terminal)

MYSQL_BIN="/Applications/XAMPP/xamppfiles/bin/mysql"
DB="news_manager"
CONN="$MYSQL_BIN -u root $DB"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

header() {
    clear
    echo "${BOLD}${BLUE}"
    echo "╔══════════════════════════════════════════╗"
    echo "║     NewsManager  Database Manager        ║"
    echo "║     DB: $DB                   ║"
    echo "╚══════════════════════════════════════════╝${NC}"
}

press_enter() {
    echo "\n${YELLOW}  Nhan Enter de tiep tuc...${NC}"
    read
}

# Kiem tra MySQL dang chay
if ! /Applications/XAMPP/xamppfiles/bin/mysqladmin -u root status &>/dev/null; then
    echo "${RED}[!] MySQL chua chay. Hay chay: sudo /Applications/XAMPP/xamppfiles/bin/mysql.server start${NC}"
    exit 1
fi

while true; do
    header
    echo "\n  ${BOLD}[ TIN TUC ]${NC}"
    echo "  ${CYAN}1${NC}  Xem tat ca tin tuc"
    echo "  ${CYAN}2${NC}  Tim tin theo the loai"
    echo "  ${CYAN}3${NC}  Tim tin theo ngay"
    echo "  ${CYAN}4${NC}  Them tin tuc moi"
    echo "  ${CYAN}5${NC}  Sua tin tuc"
    echo "  ${CYAN}6${NC}  Xoa tin tuc"
    echo "\n  ${BOLD}[ THE LOAI ]${NC}"
    echo "  ${CYAN}7${NC}  Xem tat ca the loai"
    echo "  ${CYAN}8${NC}  Them the loai moi"
    echo "  ${CYAN}9${NC}  Sua the loai"
    echo "  ${CYAN}10${NC} Xoa the loai"
    echo "\n  ${BOLD}[ NANG CAO ]${NC}"
    echo "  ${CYAN}11${NC} Chay SQL tuy chinh"
    echo "  ${CYAN}12${NC} Thong ke tong quat"
    echo "  ${CYAN}13${NC} Xoa sach va nhap lai du lieu mau"
    echo "\n  ${CYAN}0${NC}  Thoat"
    echo "\n${BOLD}  Chon:${NC} \c"
    read choice

    case $choice in

    1)  header
        echo "\n${BOLD}=== DANH SACH TIN TUC ===${NC}\n"
        $CONN -e "SELECT t.ma, t.tieu_de, l.ten AS the_loai, t.ngay_dang
                  FROM tin_tuc t JOIN the_loai l ON t.ma_loai=l.ma
                  ORDER BY t.ngay_dang DESC, t.ma DESC;" --table
        press_enter ;;

    2)  header
        echo "\n${BOLD}=== LỌC THEO THE LOAI ===${NC}\n"
        $CONN -e "SELECT ma, ten FROM the_loai;" --table
        echo "\n  Nhap ma the loai: \c"; read ma_loai
        $CONN -e "SELECT t.ma, t.tieu_de, t.ngay_dang, t.link_anh
                  FROM tin_tuc t WHERE t.ma_loai='$ma_loai'
                  ORDER BY t.ngay_dang DESC;" --table
        press_enter ;;

    3)  header
        echo "\n${BOLD}=== LỌC THEO NGAY ===${NC}"
        echo "  Nhap ngay (yyyy-mm-dd): \c"; read ngay
        $CONN -e "SELECT ma, tieu_de, ma_loai, ngay_dang FROM tin_tuc
                  WHERE ngay_dang='$ngay' ORDER BY ma DESC;" --table
        press_enter ;;

    4)  header
        echo "\n${BOLD}=== THEM TIN TUC MOI ===${NC}\n"
        $CONN -e "SELECT ma, ten FROM the_loai;" --table
        echo "\n  Ma the loai: \c";  read ma_loai
        echo "  Tieu de: \c";        read tieu_de
        echo "  Noi dung: \c";       read noi_dung
        echo "  Link anh (Enter de bo qua): \c"; read link_anh
        echo "  Ngay dang (yyyy-mm-dd, Enter = hom nay): \c"; read ngay_dang
        [[ -z "$ngay_dang" ]] && ngay_dang=$(date +%Y-%m-%d)
        [[ -z "$link_anh" ]] && link_anh=""
        $CONN -e "INSERT INTO tin_tuc(tieu_de,noi_dung,link_anh,ngay_dang,ma_loai)
                  VALUES('$tieu_de','$noi_dung','$link_anh','$ngay_dang','$ma_loai');"
        echo "${GREEN}  ✓ Da them tin tuc moi!${NC}"
        press_enter ;;

    5)  header
        echo "\n${BOLD}=== SUA TIN TUC ===${NC}\n"
        $CONN -e "SELECT ma, tieu_de, ma_loai, ngay_dang FROM tin_tuc ORDER BY ma DESC;" --table
        echo "\n  Nhap ma tin can sua: \c"; read ma_tin
        echo "  Tieu de moi: \c";           read tieu_de
        echo "  Noi dung moi: \c";          read noi_dung
        echo "  Link anh moi: \c";          read link_anh
        echo "  Ngay dang moi (yyyy-mm-dd): \c"; read ngay_dang
        echo "  Ma the loai moi: \c";       read ma_loai
        $CONN -e "UPDATE tin_tuc SET tieu_de='$tieu_de', noi_dung='$noi_dung',
                  link_anh='$link_anh', ngay_dang='$ngay_dang', ma_loai='$ma_loai'
                  WHERE ma=$ma_tin;"
        echo "${GREEN}  ✓ Da cap nhat!${NC}"
        press_enter ;;

    6)  header
        echo "\n${BOLD}=== XOA TIN TUC ===${NC}\n"
        $CONN -e "SELECT ma, tieu_de, ma_loai, ngay_dang FROM tin_tuc ORDER BY ma;" --table
        echo "\n  Nhap ma tin can xoa: \c"; read ma_tin
        echo "  ${RED}Xac nhan xoa tin $ma_tin? (y/n):${NC} \c"; read xn
        if [[ "$xn" == "y" ]]; then
            $CONN -e "DELETE FROM tin_tuc WHERE ma=$ma_tin;"
            echo "${GREEN}  ✓ Da xoa!${NC}"
        else
            echo "  Huy bo."
        fi
        press_enter ;;

    7)  header
        echo "\n${BOLD}=== DANH SACH THE LOAI ===${NC}\n"
        $CONN -e "SELECT l.ma, l.ten, l.icon, l.mau_badge,
                    COUNT(t.ma) AS so_tin
                  FROM the_loai l LEFT JOIN tin_tuc t ON l.ma=t.ma_loai
                  GROUP BY l.ma ORDER BY l.ma;" --table
        press_enter ;;

    8)  header
        echo "\n${BOLD}=== THEM THE LOAI MOI ===${NC}\n"
        echo "  Ma (VD: TK): \c";    read ma
        echo "  Ten: \c";            read ten
        echo "  Icon (VD: star): \c"; read icon
        echo "  Mau badge (blue/green/yellow/red/purple): \c"; read mau
        [[ -z "$icon" ]] && icon="tag"
        [[ -z "$mau" ]]  && mau="blue"
        $CONN -e "INSERT INTO the_loai(ma,ten,icon,mau_badge) VALUES('$ma','$ten','$icon','$mau');"
        echo "${GREEN}  ✓ Da them!${NC}"
        press_enter ;;

    9)  header
        echo "\n${BOLD}=== SUA THE LOAI ===${NC}\n"
        $CONN -e "SELECT ma, ten, icon, mau_badge FROM the_loai;" --table
        echo "\n  Ma the loai can sua: \c"; read ma
        echo "  Ten moi: \c";              read ten
        echo "  Icon moi: \c";             read icon
        echo "  Mau moi: \c";              read mau
        $CONN -e "UPDATE the_loai SET ten='$ten', icon='$icon', mau_badge='$mau' WHERE ma='$ma';"
        echo "${GREEN}  ✓ Da cap nhat!${NC}"
        press_enter ;;

    10) header
        echo "\n${BOLD}=== XOA THE LOAI ===${NC}\n"
        $CONN -e "SELECT l.ma, l.ten, COUNT(t.ma) AS so_tin
                  FROM the_loai l LEFT JOIN tin_tuc t ON l.ma=t.ma_loai
                  GROUP BY l.ma;" --table
        echo "\n  Ma the loai can xoa: \c"; read ma
        so_tin=$($CONN -sN -e "SELECT COUNT(*) FROM tin_tuc WHERE ma_loai='$ma';")
        if [[ $so_tin -gt 0 ]]; then
            echo "${RED}  ✗ Con $so_tin tin thuoc loai nay, khong the xoa!${NC}"
        else
            echo "  ${RED}Xac nhan xoa '$ma'? (y/n):${NC} \c"; read xn
            [[ "$xn" == "y" ]] && $CONN -e "DELETE FROM the_loai WHERE ma='$ma';" \
                && echo "${GREEN}  ✓ Da xoa!${NC}" || echo "  Huy bo."
        fi
        press_enter ;;

    11) header
        echo "\n${BOLD}=== CHAY SQL TUY CHINH ===${NC}"
        echo "  (Nhap SQL roi nhan Enter, 'exit' de quay lai)\n"
        $CONN --table
        press_enter ;;

    12) header
        echo "\n${BOLD}=== THONG KE TONG QUAT ===${NC}\n"
        echo "${CYAN}-- Tong so tin theo the loai:${NC}"
        $CONN -e "SELECT l.ten AS 'The loai', l.mau_badge AS 'Mau',
                    COUNT(t.ma) AS 'So tin'
                  FROM the_loai l LEFT JOIN tin_tuc t ON l.ma=t.ma_loai
                  GROUP BY l.ma ORDER BY so_tin DESC;" --table
        echo "\n${CYAN}-- Tin moi nhat:${NC}"
        $CONN -e "SELECT ma, tieu_de, ma_loai, ngay_dang FROM tin_tuc
                  ORDER BY ngay_dang DESC LIMIT 5;" --table
        echo "\n${CYAN}-- Tin cu nhat:${NC}"
        $CONN -e "SELECT ma, tieu_de, ma_loai, ngay_dang FROM tin_tuc
                  ORDER BY ngay_dang ASC LIMIT 3;" --table
        press_enter ;;

    13) header
        echo "\n${RED}${BOLD}  CANH BAO: Se xoa SACH tat ca du lieu!${NC}"
        echo "  Xac nhan? (go 'DONGY' de tiep tuc): \c"; read xn
        if [[ "$xn" == "DONGY" ]]; then
            $CONN -e "SET FOREIGN_KEY_CHECKS=0; TRUNCATE tin_tuc; TRUNCATE the_loai; SET FOREIGN_KEY_CHECKS=1;"
            $CONN < "${0:A:h}/java/news_manager.sql"
            echo "${GREEN}  ✓ Da reset va nhap lai du lieu mau!${NC}"
        else
            echo "  Huy bo."
        fi
        press_enter ;;

    0)  echo "\n${GREEN}  Tam biet!${NC}\n"; exit 0 ;;
    *)  echo "${RED}  Lua chon khong hop le!${NC}"; sleep 1 ;;
    esac
done
