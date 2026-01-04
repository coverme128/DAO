#!/bin/bash

# Supabase CLI 迁移脚本
# 使用方法: npm run migrate:supabase

echo "🔄 使用 Supabase CLI 执行数据库迁移"
echo ""

# 检查 Supabase CLI 是否安装
if ! command -v supabase &> /dev/null; then
    echo "❌ 未找到 Supabase CLI"
    echo ""
    echo "📋 安装 Supabase CLI:"
    echo "  macOS: brew install supabase/tap/supabase"
    echo "  其他: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI 版本:"
supabase --version
echo ""

# 检查迁移文件
MIGRATION_FILE="supabase/migrations/001_initial_schema.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ 错误: 找不到迁移文件: $MIGRATION_FILE"
    exit 1
fi

echo "📄 迁移文件: $MIGRATION_FILE"
echo ""

# 检查是否已链接项目
if [ ! -f "supabase/.temp/project-ref" ] && [ ! -f ".supabase/project-ref" ]; then
    echo "📋 需要先链接到 Supabase 项目"
    echo ""
    echo "请运行以下命令链接项目:"
    echo "  supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "或者使用交互式链接:"
    echo "  supabase link"
    echo ""
    echo "获取 PROJECT_REF:"
    echo "  从 Supabase URL: https://YOUR_PROJECT_REF.supabase.co"
    echo ""
    read -p "是否现在链接项目? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        supabase link
        if [ $? -ne 0 ]; then
            echo "❌ 链接失败，请手动运行 'supabase link'"
            exit 1
        fi
    else
        echo "请先运行 'supabase link' 后再执行迁移"
        exit 1
    fi
fi

echo "🚀 开始执行迁移..."
echo ""

# 使用 Supabase CLI 推送迁移
# db push 会将 migrations 目录中的所有 SQL 文件推送到远程数据库
supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 迁移执行成功！"
    echo ""
    echo "📋 验证:"
    echo "   1. 访问 Supabase Dashboard > Table Editor"
    echo "   2. 应该能看到以下表: users, sessions, messages, memories, usages"
else
    echo ""
    echo "❌ 迁移执行失败"
    echo ""
    echo "可能的原因:"
    echo "   1. 项目未正确链接 - 运行 'supabase link'"
    echo "   2. 网络连接问题"
    echo "   3. SQL 语法错误"
    echo "   4. 表已存在（可以忽略或先删除旧表）"
    echo ""
    exit 1
fi
