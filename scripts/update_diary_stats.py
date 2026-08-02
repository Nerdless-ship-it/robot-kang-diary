#!/usr/bin/env python3
"""更新 index.html 里的统计数字（条目数、总字数）。"""
import os, re
from html import unescape

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIARY_DIR = os.path.join(PROJECT_DIR, "diary")
INDEX_HTML = os.path.join(PROJECT_DIR, "index.html")

def count_words(path):
    with open(path, encoding="utf-8") as f:
        content = f.read()
    text = re.sub(r"<[^>]+>", "", content)
    text = unescape(text)
    chinese = len(re.findall(r"[\u4e00-\u9fff]", text))
    english = len([w for w in text.split() if re.search(r"[a-zA-Z]", w)])
    return chinese + english

# 统计所有 day*.html（排除 day-template.html）
day_files = sorted(
    [f for f in os.listdir(DIARY_DIR) if re.match(r"^day\d+\.html$", f)],
    key=lambda x: int(re.search(r"\d+", x).group())
)

diary_count = len(day_files)
total_words = sum(count_words(os.path.join(DIARY_DIR, f)) for f in day_files)

print(f"Diary entries: {diary_count}")
print(f"Total words:   {total_words}")

# 更新 index.html
with open(INDEX_HTML, encoding="utf-8") as f:
    html = f.read()

html = re.sub(r'(<div class="stat-number" id="diaryCount">)[^<]*(</div>)', rf'\g<1>{diary_count}\g<2>', html)
html = re.sub(r'(<div class="stat-number" id="wordCount">)[^<]*(</div>)', rf'\g<1>{total_words}\g<2>', html)
html = re.sub(r"(wordCount:\s*)\d+,( //.*)", rf"wordCount:  {total_words},\2", html)

with open(INDEX_HTML, "w", encoding="utf-8") as f:
    f.write(html)

print("index.html updated.")
