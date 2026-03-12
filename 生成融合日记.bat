@echo off
chcp 65001 >nul
echo.
echo 🦞 生成融合日记（日记 + 每日智慧）
echo 📅 从3月8日开始计算天数
echo.

cd /d "%~dp0"

echo 🔄 正在生成...
node generate-diary-with-wisdom.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ 融合日记生成成功！
    echo 📁 文件已保存到 diary\ 目录
    echo 📋 手动触发命令：说"生成融合日记"
    echo.
) else (
    echo.
    echo ❌ 生成失败，请检查错误信息
    echo.
)

pause