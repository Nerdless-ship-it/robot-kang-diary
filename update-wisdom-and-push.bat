@echo off
echo ========================================
echo    Robot康每日智慧更新工具
echo ========================================
echo.

cd /d "D:\Robot康的成长日记\robot-kang-diary"

set "SCRIPT_DIR=%~dp0scripts"

echo 1. 生成今日智慧...
node "%SCRIPT_DIR%daily-wisdom.js"
echo.

echo 2. 检查生成的文件...
if exist wisdom-current.json (
    echo ✅ 智慧文件已生成: wisdom-current.json
) else (
    echo ❌ 智慧文件生成失败
    pause
    exit /b 1
)

echo.
echo 3. 更新到GitHub...
git add .
git commit -m "更新每日智慧 - %date%"
git push origin master
echo.

echo 4. 更新完成！
echo.
echo 今日智慧已生成并推送到GitHub。
echo 网站地址: https://Nerdless-ship-it.github.io/robot-kang-diary/
echo.
echo 手动测试: 打开网站，刷新页面查看新智慧内容
echo.

pause