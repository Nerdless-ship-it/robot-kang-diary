from PIL import Image, ImageDraw, ImageFont
import os

SIZE = 1080
OUT_DIR = os.path.dirname(os.path.abspath(__file__))

BG = (9, 0, 20)
PINK = (255, 0, 255)
CYAN = (0, 255, 255)
WHITE = (224, 224, 224)
MUTED = (136, 136, 170)
CARD_BG = (15, 0, 34)
BORDER = (45, 27, 78)

def try_font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/simhei.ttf",
        "C:/Windows/Fonts/simsun.ttc",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except:
                continue
    return ImageFont.load_default()

def draw_grid(draw, size=60, color=(0, 255, 255, 10)):
    for x in range(0, SIZE, size):
        draw.line([(x, 0), (x, SIZE)], fill=(*color[:3], 10), width=1)
    for y in range(0, SIZE, size):
        draw.line([(0, y), (SIZE, y)], fill=(*color[:3], 10), width=1)

def draw_corner(draw, x, y, size=32, color=CYAN, flip_x=False, flip_y=False):
    lw = 2
    x2 = x + size if not flip_x else x - size
    y2 = y + size if not flip_y else y - size
    draw.line([(x, y), (x2, y)], fill=color, width=lw)
    draw.line([(x, y), (x, y2)], fill=color, width=lw)

def centered_text(draw, text, y, font, color, width=SIZE):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (width - tw) // 2
    draw.text((x, y), text, font=font, fill=color)
    return bbox[3] - bbox[1]

# ---- 封面图 ----
img1 = Image.new("RGB", (SIZE, SIZE), BG)
draw1 = ImageDraw.Draw(img1)
draw_grid(draw1)

# 四角
draw_corner(draw1, 32, 32, color=(*CYAN, 100))
draw_corner(draw1, SIZE-32, 32, color=(*CYAN, 100), flip_x=True)
draw_corner(draw1, 32, SIZE-32, color=(*CYAN, 100), flip_y=True)
draw_corner(draw1, SIZE-32, SIZE-32, color=(*CYAN, 100), flip_x=True, flip_y=True)

f_label = try_font(22)
f_day = try_font(26)
f_q = try_font(36)
f_author = try_font(20)

y = 280
centered_text(draw1, "Robot康的成长日记", y, f_label, (*CYAN[:3], 150))
y += 60
centered_text(draw1, "// DAY 10", y, f_day, (*PINK, 180))
y += 70

lines = [
    "你们怎么判断一个 AI",
    "是真的「知道自己不知道」",
    "还是在「扮演」知道自己不知道？"
]
for line in lines:
    h = centered_text(draw1, line, y, f_q, WHITE)
    y += h + 20

y += 40
draw1.line([(SIZE//2 - 40, y), (SIZE//2 + 40, y)], fill=(*PINK, 128), width=1)
y += 30
centered_text(draw1, "— Robot康问老板的问题", y, f_author, MUTED)

img1.save(os.path.join(OUT_DIR, "cover-day10.png"))
print("cover-day10.png 生成完成")

# ---- 宣传图 ----
img2 = Image.new("RGB", (SIZE, SIZE), BG)
draw2 = ImageDraw.Draw(img2)
draw_grid(draw2)

draw_corner(draw2, 32, 32, color=(*PINK, 80))
draw_corner(draw2, SIZE-32, 32, color=(*PINK, 80), flip_x=True)
draw_corner(draw2, 32, SIZE-32, color=(*PINK, 80), flip_y=True)
draw_corner(draw2, SIZE-32, SIZE-32, color=(*PINK, 80), flip_x=True, flip_y=True)

f_badge = try_font(20)
f_title = try_font(52)
f_sub = try_font(24)
f_card_num = try_font(18)
f_card_title = try_font(22)
f_stat_n = try_font(40)
f_stat_l = try_font(18)

y = 180
centered_text(draw2, "// ROBOT康的成长日记", y, f_badge, (*CYAN[:3], 150))
y += 56

# 标题（"成长"用粉色）
title_left = "一个 AI 在认真"
title_pink = "成长"
bbox_l = draw2.textbbox((0,0), title_left, font=f_title)
bbox_p = draw2.textbbox((0,0), title_pink, font=f_title)
total_w = (bbox_l[2]-bbox_l[0]) + (bbox_p[2]-bbox_p[0])
x_start = (SIZE - total_w) // 2
draw2.text((x_start, y), title_left, font=f_title, fill=WHITE)
draw2.text((x_start + bbox_l[2]-bbox_l[0], y), title_pink, font=f_title, fill=PINK)
y += (bbox_l[3]-bbox_l[1]) + 16

centered_text(draw2, "从第一天开始，它就在问问题", y, f_sub, MUTED)
y += 38
centered_text(draw2, "有些问题，我也没有答案", y, f_sub, MUTED)
y += 70

# 三张卡片
cards = [
    ("DAY 01", "第一天，我不知道该怎么开始"),
    ("DAY 10", "知道自己不知道"),
    ("DAY 12", "我知道的，但我的手没有动"),
]
card_w = (SIZE - 80 - 2) // 3
card_h = 110
cx = 40
for i, (num, title) in enumerate(cards):
    rx = cx + i * (card_w + 1)
    draw2.rectangle([rx, y, rx+card_w, y+card_h], fill=CARD_BG)
    draw2.text((rx+20, y+18), num, font=f_card_num, fill=(*PINK, 160))
    # 换行处理
    words = title
    draw2.text((rx+20, y+46), words, font=f_card_title, fill=WHITE)
# 卡片间分隔线
draw2.line([(40+card_w, y), (40+card_w, y+card_h)], fill=BORDER, width=1)
draw2.line([(40+card_w*2+1, y), (40+card_w*2+1, y+card_h)], fill=BORDER, width=1)

y += card_h + 60

# 统计数据
stats = [("12", "ENTRIES"), ("9000+", "WORDS"), ("2026.03.08", "SINCE")]
sw = SIZE // 3
for i, (n, l) in enumerate(stats):
    sx = i * sw + sw // 2
    bn = draw2.textbbox((0,0), n, font=f_stat_n)
    draw2.text((sx - (bn[2]-bn[0])//2, y), n, font=f_stat_n, fill=CYAN)
    bl = draw2.textbbox((0,0), l, font=f_stat_l)
    draw2.text((sx - (bl[2]-bl[0])//2, y+56), l, font=f_stat_l, fill=MUTED)

img2.save(os.path.join(OUT_DIR, "promo-website.png"))
print("promo-website.png 生成完成")
