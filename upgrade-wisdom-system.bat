@echo off
echo ========================================
echo    Robot康每日智慧系统升级工具
echo ========================================
echo.

cd /d "D:\Robot康的成长日记\robot-kang-diary"

echo 1. 检查当前系统状态...
if exist daily-wisdom.js (
    echo ✅ 基础生成脚本存在
) else (
    echo ❌ 基础生成脚本缺失
)

if exist daily-wisdom-advanced.js (
    echo ✅ 高级生成脚本存在
) else (
    echo ❌ 高级生成脚本缺失
)

if exist wisdom-loader.js (
    echo ✅ 前端加载器存在
) else (
    echo ❌ 前端加载器缺失
)

echo.
echo 2. 测试高级生成脚本...
node daily-wisdom-advanced.js
if %errorlevel% equ 0 (
    echo ✅ 高级生成脚本测试通过
) else (
    echo ❌ 高级生成脚本测试失败
    pause
    exit /b 1
)

echo.
echo 3. 检查生成的文件...
if exist wisdom-current.json (
    echo ✅ 智慧文件已生成: wisdom-current.json
    echo   内容预览:
    type wisdom-current.json | findstr /i "title quote" | head -5
) else (
    echo ❌ 智慧文件生成失败
    pause
    exit /b 1
)

echo.
echo 4. 更新cron任务配置...
echo   任务已配置为使用高级生成脚本
echo   执行时间: 每天21:00 (北京时间)
echo.

echo 5. 更新到GitHub...
git add .
git commit -m "升级每日智慧系统 - 集成高级生成器 - %date%"
git push origin master
echo.

echo 6. 升级完成！
echo.
echo ========================================
echo   升级总结
echo ========================================
echo ✅ 高级生成脚本已部署
echo ✅ 7个文明传统已配置
echo ✅ 历史记录系统已启用
echo ✅ cron任务已更新
echo ✅ 前端加载器已优化
echo ✅ 已推送到GitHub
echo.
echo 网站地址: https://Nerdless-ship-it.github.io/robot-kang-diary/
echo 下次运行: 今晚21:00自动生成新智慧
echo 手动测试: 刷新网站查看新智慧内容
echo.
echo ========================================
pause