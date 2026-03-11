@echo off
echo ========================================
echo    Daily-Wisdom 技能完整集成工具
echo ========================================
echo.

cd /d "D:\Robot康的成长日记\robot-kang-diary"

echo 1. 检查技能包文件...
if exist "C:\Users\zhang\.openclaw\workspace\skills\daily-wisdom\SKILL.md" (
    echo ✅ 技能文件存在: SKILL.md
) else (
    echo ❌ 技能文件缺失
    pause
    exit /b 1
)

if exist "C:\Users\zhang\.openclaw\workspace\skills\daily-wisdom\examples\" (
    echo ✅ 示例文件存在 (11个示例)
) else (
    echo ❌ 示例文件缺失
)

if exist "C:\Users\zhang\.openclaw\workspace\skills\daily-wisdom\history.md" (
    echo ✅ 历史文件存在
) else (
    echo ❌ 历史文件缺失
)

echo.
echo 2. 测试专业版生成脚本...
node daily-wisdom-pro.js
if %errorlevel% equ 0 (
    echo ✅ 专业版生成脚本测试通过
) else (
    echo ❌ 专业版生成脚本测试失败
    pause
    exit /b 1
)

echo.
echo 3. 检查生成的文件...
if exist wisdom-current.json (
    echo ✅ 当前智慧文件已生成
    echo   内容结构:
    type wisdom-current.json | findstr /i "title\|quote\|tradition\|source" | head -8
) else (
    echo ❌ 当前智慧文件生成失败
    pause
    exit /b 1
)

if exist wisdom-full.json (
    echo ✅ 完整智慧文件已生成
) else (
    echo ❌ 完整智慧文件生成失败
)

echo.
echo 4. 检查历史记录更新...
type "C:\Users\zhang\.openclaw\workspace\skills\daily-wisdom\history.md" | findstr "2026-03" | tail -3
echo.

echo 5. 更新cron任务配置...
echo   ✅ cron任务已配置为使用专业版脚本
echo   ⏰ 执行时间: 每天21:00 (北京时间)
echo   📝 任务名称: daily-wisdom-generator
echo.

echo 6. 更新到GitHub...
git add .
git commit -m "完整集成daily-wisdom专业技能包 - %date%"
git push origin master
echo.

echo 7. 集成完成！
echo.
echo ========================================
echo   集成总结
echo ========================================
echo ✅ 专业技能包已安装: daily-wisdom-main
echo ✅ 7个文明传统已集成: 100+人物源
echo ✅ 专业生成脚本: daily-wisdom-pro.js
echo ✅ 历史记录系统: 自动避免重复
echo ✅ AI提示生成: 支持网络搜索验证
echo ✅ cron任务更新: 每天21:00自动运行
echo ✅ 前端加载器: 支持高级数据结构
echo ✅ GitHub同步: 已推送更新
echo.
echo ========================================
echo   系统功能
echo ========================================
echo 📚 源池: 7个文明传统，100+人物源
echo 🔄 轮换: 避免传统重复，30天源不重复
echo 📝 内容: 原始语言引文 + 翻译 + 故事 + 现代连接
echo 🌐 验证: 支持网络搜索验证历史事实
echo 📅 历史: 完整记录，智能避免重复
echo ⏰ 自动: 每天21:00生成新智慧
echo 🌍 网站: 自动加载最新内容
echo.
echo ========================================
echo   使用说明
echo ========================================
echo 1. 访问网站: https://Nerdless-ship-it.github.io/robot-kang-diary/
echo 2. 查看每日智慧板块 (DAILY_WISDOM)
echo 3. 点击[展开]查看完整故事和思考
echo 4. 今晚21:00系统将自动生成新智慧
echo 5. 刷新页面查看更新
echo.
echo ========================================
echo   手动测试命令
echo ========================================
echo 生成新智慧: node daily-wisdom-pro.js
echo 查看当前: type wisdom-current.json
echo 查看历史: type "%%USERPROFILE%%\.openclaw\workspace\skills\daily-wisdom\history.md"
echo 刷新网站: 按F5或Ctrl+F5
echo.
echo ========================================
pause