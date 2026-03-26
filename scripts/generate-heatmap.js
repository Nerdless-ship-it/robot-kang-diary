#!/usr/bin/env node

/**
 * Robot康日记贡献热力图生成脚本
 * 生成类似 GitHub 贡献图的数据
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const DIARY_DIR = path.join(PROJECT_DIR, 'diary');
const HEATMAP_FILE = path.join(PROJECT_DIR, 'heatmap-data.json');

// 排除的文件
const EXCLUDE_FILES = ['anchor.html', 'day-template.html'];

// 开始日期：2026-03-08
const START_DATE = new Date(2026, 2, 8); // 月份从 0 开始

function extractDiaryDate(content) {
    const dateMatch = content.match(/<div[^>]*class="diary-date"[^>]*>(.*?)<\/div>/);
    if (!dateMatch) return null;

    const dateStr = dateMatch[1].trim();

    // 支持两种格式：2026.03.08 和 2026-03-22
    let parts;
    if (dateStr.includes('.')) {
        parts = dateStr.split('.');
    } else if (dateStr.includes('-')) {
        parts = dateStr.split('-');
    } else {
        return null;
    }

    if (parts.length !== 3) return null;

    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

function extractDiaryTitle(content) {
    const match = content.match(/<h1[^>]*class="diary-title"[^>]*>(.*?)<\/h1>/);
    return match ? stripHtml(match[1]) : '';
}

function stripHtml(html = '') {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

function formatMonthLabel(date) {
    return `${date.getMonth() + 1}月`;
}

function calculateCurrentStreak(data) {
    let streak = 0;

    for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].count > 0) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function calculateLongestStreak(data) {
    let longest = 0;
    let current = 0;

    data.forEach(day => {
        if (day.count > 0) {
            current++;
            longest = Math.max(longest, current);
        } else {
            current = 0;
        }
    });

    return longest;
}

function main() {
    console.log('🔥 开始生成贡献热力图数据...\n');

    const files = fs.readdirSync(DIARY_DIR)
        .filter(file => file.startsWith('day') && file.endsWith('.html'))
        .filter(file => !EXCLUDE_FILES.includes(file));

    console.log(`📁 找到 ${files.length} 篇日记`);

    const diaryMap = new Map();

    files.forEach(file => {
        const filePath = path.join(DIARY_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const date = extractDiaryDate(content);
        const title = extractDiaryTitle(content);
        const dayNumber = parseInt(file.replace('day', '').replace('.html', ''), 10);

        if (date) {
            const key = formatDate(date);
            diaryMap.set(key, {
                date: key,
                title,
                href: `diary/${file}`,
                dayNumber,
                hasDiary: true
            });
            console.log(`  ✓ ${file}: ${key}`);
        }
    });

    const today = new Date();
    const heatmapData = [];

    let currentDate = new Date(START_DATE.getTime());
    while (currentDate <= today) {
        const dateKey = formatDate(currentDate);
        const diary = diaryMap.get(dateKey);

        heatmapData.push({
            date: dateKey,
            dayOfWeek: currentDate.getDay(),
            count: diary ? 1 : 0,
            hasDiary: Boolean(diary),
            title: diary?.title || '',
            href: diary?.href || '',
            dayNumber: diary?.dayNumber || null,
            monthLabel: formatMonthLabel(currentDate)
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalDays = heatmapData.length;
    const daysWithDiary = heatmapData.filter(d => d.count > 0).length;
    const daysWithoutDiary = totalDays - daysWithDiary;
    const currentStreak = calculateCurrentStreak(heatmapData);
    const longestStreak = calculateLongestStreak(heatmapData);
    const latestDiary = [...heatmapData].reverse().find(day => day.hasDiary) || null;

    console.log(`\n📊 统计结果:`);
    console.log(`  总天数: ${totalDays}`);
    console.log(`  有日记的天数: ${daysWithDiary}`);
    console.log(`  没有日记的天数: ${daysWithoutDiary}`);
    console.log(`  当前连续记录天数: ${currentStreak}`);
    console.log(`  最长连续记录天数: ${longestStreak}`);

    const data = {
        generated: new Date().toISOString(),
        startDate: formatDate(START_DATE),
        endDate: formatDate(today),
        stats: {
            totalDays,
            daysWithDiary,
            daysWithoutDiary,
            streak: currentStreak,
            longestStreak
        },
        latestDiary,
        heatmap: heatmapData
    };

    fs.writeFileSync(HEATMAP_FILE, JSON.stringify(data, null, 2), 'utf-8');

    console.log(`\n✅ 已生成 heatmap-data.json`);
    console.log(`  日期范围: ${formatDate(START_DATE)} - ${formatDate(today)}`);
    console.log(`  包含 ${heatmapData.length} 天的数据`);
}

main();
