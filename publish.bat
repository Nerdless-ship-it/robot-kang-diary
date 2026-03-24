@echo off
REM Robot康日记网站 — 更新统计 + 推送
python "C:\Users\zhang\.openclaw\workspace\scripts\update_diary_stats.py"
cd "D:\Robot康的成长日记\robot-kang-diary"
git add .
git commit -m "update stats - %date:~0,4%-%date:~5,2%-%date:~8,2%"
git push origin master
