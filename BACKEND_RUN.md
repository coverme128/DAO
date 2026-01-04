# 后端运行指南

## 🚀 快速开始

### 方式一：开发模式（推荐）

```bash
# 启动后端开发服务器（自动热重载）
npm run dev:backend
```

后端将在 `http://localhost:3001` 启动，支持代码修改自动重启。

---

### 方式二：同时启动前后端

```bash
# 同时启动前端和后端
npm run dev
```

这会启动：
- 前端：`http://localhost:3000`
- 后端：`http://localhost:3001`

---

### 方式三：生产模式

```bash
# 1. 构建后端
npm run build:backend

# 2. 启动后端
npm run start:backend
```

---

## 📋 运行前准备

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件（在项目根目录）：

```bash
cp env.example .env.local
```

编辑 `.env.local`，填入必需的环境变量：
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AZURE_SPEECH_KEY`
- `AZURE_SPEECH_REGION`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_DEPLOYMENT_NAME`
- `PORT`（可选，默认 3001）
- `FRONTEND_URL`（可选，默认 http://localhost:3000）

详细配置说明请参考 `ENV_CONFIG.md`

### 3. 初始化数据库

在 Supabase Dashboard > SQL Editor 中运行：
```sql
-- 运行 supabase/migrations/001_initial_schema.sql
```

---

## ✅ 验证后端运行

### 1. 检查启动日志

成功启动后，你应该看到：
```
🚀 Backend server running on http://localhost:3001
📡 API endpoints available at http://localhost:3001/api
```

### 2. 健康检查

在浏览器或使用 curl 访问：
```bash
curl http://localhost:3001/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 3. 测试 API 端点

```bash
# 测试用户创建
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{}'

# 测试健康检查
curl http://localhost:3001/health
```

---

## 🔧 开发模式说明

### 使用 tsx（TypeScript 直接运行）

开发模式使用 `tsx watch`，它会：
- ✅ 自动检测文件变化
- ✅ 自动重启服务器
- ✅ 无需手动编译 TypeScript
- ✅ 显示清晰的错误信息

### 文件监听

`tsx watch` 会监听以下文件变化：
- `server/**/*.ts` - 所有 TypeScript 文件
- `.env.local` - 环境变量文件

修改代码后，服务器会自动重启。

---

## 🐛 常见问题

### Q: 端口 3001 已被占用？

**解决方案**：
```bash
# 方法1：修改环境变量
PORT=3002 npm run dev:backend

# 方法2：杀死占用端口的进程（macOS/Linux）
lsof -ti:3001 | xargs kill -9

# 方法3：使用其他端口
# 编辑 .env.local，设置 PORT=3002
```

### Q: 环境变量不生效？

**检查清单**：
1. ✅ 确保 `.env.local` 文件在项目根目录
2. ✅ 确保变量名拼写正确（区分大小写）
3. ✅ 重启开发服务器
4. ✅ 检查是否有语法错误（多余空格、引号等）

### Q: TypeScript 编译错误？

**解决方案**：
```bash
# 检查 TypeScript 配置
npx tsc --project server/tsconfig.json --noEmit

# 查看详细错误信息
npm run dev:backend
```

### Q: 模块找不到（Module not found）？

**解决方案**：
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

### Q: Supabase 连接失败？

**检查清单**：
1. ✅ `SUPABASE_URL` 格式正确（https://xxx.supabase.co）
2. ✅ `SUPABASE_SERVICE_ROLE_KEY` 正确
3. ✅ Supabase 项目已创建
4. ✅ 数据库迁移已运行
5. ✅ 网络连接正常

### Q: Azure 服务连接失败？

**检查清单**：
1. ✅ API 密钥正确
2. ✅ 区域（Region）匹配
3. ✅ Azure 资源已启用
4. ✅ 配额未超限
5. ✅ 网络可以访问 Azure 服务

---

## 📊 后端服务结构

```
server/
├── index.ts          # 入口文件（Express 服务器）
├── routes/           # API 路由
│   ├── asr.ts        # 语音转文字
│   ├── chat.ts       # 对话生成
│   ├── tts.ts        # 文字转语音
│   ├── usage.ts      # 使用量管理
│   ├── sessions.ts   # 会话管理
│   ├── users.ts      # 用户管理
│   ├── memory.ts     # 记忆管理
│   └── stripe.ts     # Stripe 支付
├── services/         # 业务逻辑服务
│   ├── asr.ts        # ASR 服务
│   ├── tts.ts        # TTS 服务
│   ├── orchestrator.ts # 对话编排
│   ├── session.ts    # 会话服务
│   ├── billing.ts    # 订阅服务
│   ├── usage.ts      # 使用量服务
│   └── memory.ts     # 记忆服务
└── lib/              # 工具库
    └── supabase.ts   # Supabase 客户端
```

---

## 🔍 调试技巧

### 1. 查看详细日志

后端会在控制台输出：
- ✅ API 请求日志
- ✅ 错误日志
- ✅ 服务启动信息

### 2. 使用 Postman/Insomnia 测试 API

导入以下端点进行测试：
- `POST http://localhost:3001/api/users`
- `POST http://localhost:3001/api/sessions`
- `POST http://localhost:3001/api/chat`
- `POST http://localhost:3001/api/asr`
- `POST http://localhost:3001/api/tts`

### 3. 检查环境变量

```bash
# 在 Node.js 中检查环境变量（不显示值）
node -e "require('dotenv').config(); console.log('Supabase:', !!process.env.SUPABASE_URL); console.log('Azure Speech:', !!process.env.AZURE_SPEECH_KEY); console.log('Azure OpenAI:', !!process.env.AZURE_OPENAI_ENDPOINT);"
```

---

## 🚢 生产部署

### 构建步骤

```bash
# 1. 安装依赖
npm install --production

# 2. 构建后端
npm run build:backend

# 3. 启动服务
npm run start:backend
```

### 部署平台推荐

- **Railway**：简单易用，自动部署
- **Render**：免费 tier，自动 SSL
- **Fly.io**：全球边缘部署
- **DigitalOcean App Platform**：稳定可靠

### 生产环境变量配置

在部署平台设置以下环境变量：
- 所有后端环境变量（见 `ENV_CONFIG.md`）
- `NODE_ENV=production`
- `PORT`（平台可能自动设置）

---

## 📝 相关文档

- `ENV_CONFIG.md` - 环境变量配置说明
- `ARCHITECTURE.md` - 架构设计文档
- `README.md` - 项目总览
- `SUPABASE_SETUP.md` - Supabase 设置指南

---

## ✅ 快速检查清单

运行后端前，确保：
- [ ] 已安装依赖：`npm install`
- [ ] 已创建 `.env.local` 文件
- [ ] 已配置所有必需的环境变量
- [ ] 已运行数据库迁移
- [ ] 端口 3001 未被占用
- [ ] Node.js 版本 >= 18

运行命令：
```bash
npm run dev:backend
```

成功标志：
- ✅ 看到 "🚀 Backend server running" 消息
- ✅ `/health` 端点返回 `{"status":"ok"}`
- ✅ 没有错误信息


