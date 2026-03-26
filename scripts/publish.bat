@echo off
REM Robot康日记网站 — 更新统计 + 推送
cd /d "%~dp0.."
python "%~dp0update_diary_stats.py"
git add .
git commit -m "update stats - %date:~0,4%-%date:~5,2%-%date:~8,2%"
git push origin master
