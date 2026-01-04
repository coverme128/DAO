#!/usr/bin/env node

/**
 * 自动执行 Supabase 数据库迁移脚本
 * 
 * 使用方法:
 *   1. 使用 psql (推荐): npm run migrate
 *   2. 需要设置 SUPABASE_DB_PASSWORD 环境变量
 * 
 * 或者手动执行:
 *   在 Supabase Dashboard > SQL Editor 中执行 supabase/migrations/001_initial_schema.sql
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 加载环境变量
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

function checkPsql() {
  try {
    execSync('which psql', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getConnectionString() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!supabaseUrl) {
    console.error('❌ 错误: 缺少 SUPABASE_URL 环境变量');
    return null;
  }

  if (!dbPassword) {
    console.error('❌ 错误: 缺少 SUPABASE_DB_PASSWORD 环境变量');
    console.error('');
    console.error('📋 如何获取数据库密码:');
    console.error('   1. 访问 Supabase Dashboard: https://app.supabase.com');
    console.error('   2. 进入你的项目 > Settings > Database');
    console.error('   3. 在 "Connection string" 部分找到密码');
    console.error('   4. 或者在项目创建时设置的数据库密码');
    console.error('');
    console.error('   在 .env.local 中添加:');
    console.error('   SUPABASE_DB_PASSWORD="your-database-password"');
    return null;
  }

  // 从 URL 提取项目引用
  // URL 格式: https://xxxxx.supabase.co
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  
  // Supabase 连接字符串格式
  // 使用连接池: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
  // 或者直接连接: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
  
  // 尝试使用连接池（更稳定）
  const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
  
  return connectionString;
}

async function runMigration() {
  console.log('🔄 Supabase 数据库迁移工具');
  console.log('');

  // 检查 psql
  if (!checkPsql()) {
    console.error('❌ 未找到 psql 命令');
    console.error('');
    console.error('📋 请安装 PostgreSQL 客户端:');
    console.error('   macOS: brew install postgresql');
    console.error('   Ubuntu: sudo apt-get install postgresql-client');
    console.error('   Windows: 下载并安装 PostgreSQL');
    console.error('');
    console.error('或者手动执行 SQL:');
    console.error('   1. 访问 Supabase Dashboard > SQL Editor');
    console.error('   2. 执行文件: supabase/migrations/001_initial_schema.sql');
    process.exit(1);
  }

  // 获取连接字符串
  const connectionString = getConnectionString();
  if (!connectionString) {
    process.exit(1);
  }

  // 读取 SQL 文件
  const sqlPath = path.resolve(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ 错误: 找不到迁移文件: ${sqlPath}`);
    process.exit(1);
  }

  console.log('📄 迁移文件:', sqlPath);
  console.log('📡 连接到 Supabase 数据库...');
  console.log('');

  try {
    // 使用 psql 执行 SQL 文件
    execSync(`psql "${connectionString}" -f "${sqlPath}"`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        PGPASSWORD: process.env.SUPABASE_DB_PASSWORD,
      },
    });
    
    console.log('');
    console.log('✅ 迁移执行成功！');
    console.log('');
    console.log('📋 验证:');
    console.log('   1. 访问 Supabase Dashboard > Table Editor');
    console.log('   2. 应该能看到以下表: users, sessions, messages, memories, usages');
    
  } catch (error) {
    console.error('');
    console.error('❌ 迁移执行失败');
    console.error('');
    console.error('可能的原因:');
    console.error('   1. 数据库密码不正确');
    console.error('   2. 网络连接问题');
    console.error('   3. SQL 语法错误');
    console.error('');
    console.error('📋 请手动执行 SQL:');
    console.error('   1. 访问 Supabase Dashboard > SQL Editor');
    console.error('   2. 复制以下文件内容并执行:');
    console.error(`      ${sqlPath}`);
    console.error('');
    
    // 显示 SQL 内容
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    console.log('SQL 内容:');
    console.log('---');
    console.log(sql);
    console.log('---');
    
    process.exit(1);
  }
}

runMigration();
