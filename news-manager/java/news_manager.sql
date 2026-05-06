-- ============================================
--  NewsManager Database Schema
--  Chay lenh nay de tao database va tables
--  mysql -u root -p < news_manager.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS news_manager
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE news_manager;

-- Bang the loai tin
CREATE TABLE IF NOT EXISTS the_loai (
    ma        VARCHAR(10)  NOT NULL PRIMARY KEY,
    ten       VARCHAR(100) NOT NULL,
    icon      VARCHAR(50)  NOT NULL DEFAULT 'tag',
    mau_badge VARCHAR(20)  NOT NULL DEFAULT 'blue'
);

-- Bang tin tuc
CREATE TABLE IF NOT EXISTS tin_tuc (
    ma        INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tieu_de   VARCHAR(255) NOT NULL,
    noi_dung  TEXT         NOT NULL,
    link_anh  VARCHAR(500) DEFAULT '',
    ngay_dang DATE         NOT NULL,
    ma_loai   VARCHAR(10)  NOT NULL,
    FOREIGN KEY (ma_loai) REFERENCES the_loai(ma) ON DELETE RESTRICT
);

-- Du lieu mau: 4 the loai
INSERT IGNORE INTO the_loai (ma, ten, icon, mau_badge) VALUES
    ('CN', 'Cong nghe',  'laptop',        'blue'),
    ('TT', 'The thao',   'ball-football', 'green'),
    ('KT', 'Kinh te',    'trending-up',   'yellow'),
    ('GT', 'Giai tri',   'device-tv',     'red');

-- Du lieu mau: 8 tin tuc
INSERT IGNORE INTO tin_tuc (tieu_de, noi_dung, link_anh, ngay_dang, ma_loai) VALUES
    ('AI tao ra dot pha moi trong y te',
     'Cac nha khoa hoc su dung AI de chan doan benh hieu qua hon bac si.',
     'https://picsum.photos/seed/ai1/400/200', '2026-05-01', 'CN'),

    ('ChatGPT cap nhat phien ban 5.0',
     'OpenAI chinh thuc ra mat ChatGPT 5.0 voi nhieu tinh nang vuot troi.',
     'https://picsum.photos/seed/ai2/400/200', '2026-05-02', 'CN'),

    ('Viet Nam vo dich SEA Games bong da',
     'Doi tuyen Viet Nam gianh huy chuong vang tai SEA Games 35.',
     'https://picsum.photos/seed/sport1/400/200', '2026-05-01', 'TT'),

    ('Giai Ngoai hang Anh vao hoi ket',
     'Manchester City dan dau bang xep hang voi 5 vong dau con lai.',
     'https://picsum.photos/seed/sport2/400/200', '2026-05-03', 'TT'),

    ('Lam phat giam xuong 2.1% trong thang 4',
     'Ngan hang nha nuoc cong bo bao cao lam phat thang 4 giam manh.',
     'https://picsum.photos/seed/eco1/400/200', '2026-05-02', 'KT'),

    ('Chung khoan tang manh, VN-Index vuot 1500',
     'Thi truong chung khoan Viet Nam ghi nhan phien tang an tuong.',
     'https://picsum.photos/seed/eco2/400/200', '2026-05-04', 'KT'),

    ('Phim bom tan Marvel cong pha phong ve',
     'Avengers Secret Wars thu ve 200 trieu USD trong ngay dau cong chieu.',
     'https://picsum.photos/seed/ent1/400/200', '2026-05-03', 'GT'),

    ('Ca si V-Pop vua len top Billboard',
     'Mot nghe si tre Viet Nam lan dau len duoc top 50 Billboard.',
     'https://picsum.photos/seed/ent2/400/200', '2026-05-05', 'GT');
