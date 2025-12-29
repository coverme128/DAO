# Supabase 数据库设置指南

## 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 记录项目 URL 和 API keys

## 步骤 2: 运行数据库迁移

1. 打开 Supabase Dashboard
2. 进入 **SQL Editor**
3. 复制 `supabase/migrations/001_initial_schema.sql` 的内容
4. 粘贴到 SQL Editor 中
5. 点击 **Run** 执行

这将创建以下表：
- `users` - 用户表
- `sessions` - 会话表
- `messages` - 消息表
- `memories` - 记忆表
- `usages` - 使用量表

## 步骤 3: 获取 API Keys

1. 进入 **Settings** > **API**
2. 复制以下信息：
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
   - **anon public key** → `SUPABASE_ANON_KEY`

## 步骤 4: 配置环境变量

在 `.env.local` 文件中添加：

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_ANON_KEY="your-anon-key"
```

## 验证设置

运行以下命令测试连接：

```bash
npm run dev:backend
```

如果看到 "🚀 Backend server running"，说明连接成功！

## 数据库结构

### users
- `id` (TEXT, PRIMARY KEY)
- `email` (TEXT, UNIQUE, nullable)
- `plan` (plan_type: FREE | PRO)
- `created_at` (TIMESTAMPTZ)

### sessions
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY → users.id)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### messages
- `id` (TEXT, PRIMARY KEY)
- `session_id` (TEXT, FOREIGN KEY → sessions.id)
- `role` (role_type: USER | ASSISTANT)
- `content` (TEXT)
- `created_at` (TIMESTAMPTZ)

### memories
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY → users.id)
- `summary` (TEXT)
- `updated_at` (TIMESTAMPTZ)
- `expires_at` (TIMESTAMPTZ)

### usages
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY → users.id)
- `date` (TEXT, format: YYYY-MM-DD)
- `voice_count` (INTEGER)
- UNIQUE constraint on (user_id, date)


