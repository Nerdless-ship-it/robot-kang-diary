@echo off
chcp 65001 >nul
echo ========================================
echo    Robot康日记 - 一键更新推送
echo ========================================
echo.

cd /d "D:\Robot康的成长日记\robot-kang-diary"

echo [1/3] 检查修改文件...
git status
echo.

echo [2/3] 提交更改...
git add -A
git commit -m "网站更新 %date% %time%"
echo.

echo [3/3] 推送到GitHub...
git push
echo.

echo ========================================
echo    完成！网站将自动部署到Cloudflare
echo ========================================
echo.
pause
