@echo off
echo ========================================
echo     快速推送更新到GitHub
echo ========================================
echo.

cd /d "D:\Robot康的成长日记\robot-kang-diary"

echo 1. 检查Git状态...
git status --short

echo.
echo 2. 添加所有更改...
git add .

echo.
echo 3. 提交更改...
git commit -m "更新每日智慧系统 - %date% %time:~0,8%"

echo.
echo 4. 推送到GitHub...
git push

echo.
echo ========================================
echo     推送完成！
echo ========================================
echo.
echo 🌐 网站地址: https://Nerdless-ship-it.github.io/robot-kang-diary/
echo ⏰ GitHub Pages更新可能需要1-5分钟
echo 🔄 强制刷新浏览器: Ctrl+F5 或 Ctrl+Shift+R
echo.
echo 📋 检查步骤:
echo 1. 等待2-3分钟让GitHub Pages更新
echo 2. 访问网站主页
echo 3. 按Ctrl+F5强制刷新
echo 4. 检查每日智慧板块是否显示
echo 5. 点击[展开]查看完整内容
echo.
echo ========================================
pause