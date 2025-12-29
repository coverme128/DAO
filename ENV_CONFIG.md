# 环境变量配置文档

本文档列出了 Acoda 项目所需的所有环境变量及其配置说明。

## 📋 快速开始

1. 复制示例文件：
```bash
cp env.example .env.local
```

2. 根据以下说明填写各个环境变量的值

3. 确保 `.env.local` 文件已添加到 `.gitignore`（不要提交到 Git）

---

## 🔐 必需环境变量（MVP 运行）

### 1. Supabase 配置

#### `SUPABASE_URL`
- **类型**：必需
- **说明**：Supabase 项目 URL
- **获取方式**：Supabase Dashboard > Settings > API > Project URL
- **示例**：`https://abcdefghijklmnop.supabase.co`
- **用途**：后端连接 Supabase 数据库

#### `SUPABASE_SERVICE_ROLE_KEY`
- **类型**：必需
- **说明**：Supabase Service Role Key（拥有完整权限，绕过 RLS）
- **获取方式**：Supabase Dashboard > Settings > API > service_role key
- **示例**：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **⚠️ 安全提示**：此密钥拥有完整权限，仅用于后端，不要暴露给前端
- **用途**：后端数据库操作

#### `SUPABASE_ANON_KEY`
- **类型**：可选（如果前端需要直接访问 Supabase）
- **说明**：Supabase 匿名密钥（受 RLS 限制）
- **获取方式**：Supabase Dashboard > Settings > API > anon public key
- **示例**：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **用途**：前端直接访问 Supabase（如果使用）

---

### 2. Azure Speech Services 配置

#### `AZURE_SPEECH_KEY`
- **类型**：必需（用于 ASR 和 TTS）
- **说明**：Azure Speech Services API 密钥
- **获取方式**：
  1. 登录 Azure Portal
  2. 创建或选择 Speech Services 资源
  3. 进入 "Keys and Endpoint"
  4. 复制 Key1 或 Key2
- **示例**：`a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- **用途**：语音识别（ASR）和语音合成（TTS）

#### `AZURE_SPEECH_REGION`
- **类型**：必需（用于 ASR 和 TTS）
- **说明**：Azure Speech Services 区域
- **获取方式**：与 `AZURE_SPEECH_KEY` 在同一页面，查看 "Location/Region"
- **示例**：`eastus`、`westus2`、`southeastasia`
- **常用区域**：
  - `eastus` - 美国东部
  - `westus2` - 美国西部 2
  - `southeastasia` - 东南亚
  - `japaneast` - 日本东部
- **用途**：指定 Speech Services 服务区域

---

### 3. Azure OpenAI 配置

#### `AZURE_OPENAI_ENDPOINT`
- **类型**：必需
- **说明**：Azure OpenAI 服务端点 URL
- **获取方式**：
  1. 登录 Azure Portal
  2. 创建或选择 Azure OpenAI 资源
  3. 进入 "Keys and Endpoint"
  4. 复制 Endpoint
- **示例**：`https://your-resource.openai.azure.com`
- **格式**：必须是完整的 HTTPS URL，不包含路径
- **用途**：LLM 对话生成

#### `AZURE_OPENAI_API_KEY`
- **类型**：必需
- **说明**：Azure OpenAI API 密钥
- **获取方式**：与 `AZURE_OPENAI_ENDPOINT` 在同一页面，复制 Key1 或 Key2
- **示例**：`a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- **用途**：认证 Azure OpenAI API 请求

#### `AZURE_OPENAI_DEPLOYMENT_NAME`
- **类型**：必需
- **说明**：Azure OpenAI 部署名称（模型部署）
- **获取方式**：
  1. Azure Portal > Azure OpenAI 资源
  2. 进入 "Deployments"
  3. 查看或创建部署，复制部署名称
- **示例**：`gpt-4`、`gpt-35-turbo`、`gpt-4o`
- **推荐模型**：
  - `gpt-4o` - 最新最强模型
  - `gpt-4` - 高质量对话
  - `gpt-35-turbo` - 性价比高
- **用途**：指定使用的模型部署

---

### 4. Stripe 配置（支付）

#### `STRIPE_SECRET_KEY`
- **类型**：必需（如果启用支付功能）
- **说明**：Stripe 密钥（服务器端使用）
- **获取方式**：
  1. 登录 Stripe Dashboard
  2. 进入 "Developers" > "API keys"
  3. 复制 "Secret key"（测试环境使用 `sk_test_...`，生产环境使用 `sk_live_...`）
- **⚠️ 安全提示**：仅用于后端，不要暴露给前端
- **用途**：创建支付会话、处理 Webhook

#### `STRIPE_WEBHOOK_SECRET`
- **类型**：必需（如果启用支付功能）
- **说明**：Stripe Webhook 签名密钥（用于验证 Webhook 请求）
- **获取方式**：
  1. Stripe Dashboard > "Developers" > "Webhooks"
  2. 创建或选择 Webhook 端点
  3. 复制 "Signing secret"（格式：`whsec_...`）
- **示例**：`whsec_1234567890abcdefghijklmnopqrstuvwxyz`
- **用途**：验证 Stripe Webhook 请求的真实性

#### `STRIPE_PUBLISHABLE_KEY`
- **类型**：可选（前端使用）
- **说明**：Stripe 公开密钥（前端使用）
- **获取方式**：与 `STRIPE_SECRET_KEY` 在同一页面，复制 "Publishable key"
- **示例（测试）**：`pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...`
- **用途**：前端创建 Checkout 会话（如果前端直接调用 Stripe）

---

### 5. 服务器配置

#### `PORT`
- **类型**：可选（有默认值）
- **说明**：后端服务器端口
- **默认值**：`3001`
- **示例**：`3001`、`8080`、`5000`
- **用途**：后端 API 服务监听端口

#### `FRONTEND_URL`
- **类型**：可选（有默认值）
- **说明**：前端应用 URL（用于 CORS 配置）
- **默认值**：`http://localhost:3000`
- **开发环境**：`http://localhost:3000`
- **生产环境**：`https://yourdomain.com`
- **用途**：后端 CORS 允许的前端域名

---

### 6. 前端配置（Next.js）

#### `NEXT_PUBLIC_API_URL`
- **类型**：必需
- **说明**：后端 API 服务 URL（前端调用）
- **开发环境**：`http://localhost:3001`
- **生产环境**：`https://api.yourdomain.com`
- **⚠️ 注意**：`NEXT_PUBLIC_` 前缀表示此变量会暴露给浏览器
- **用途**：前端 API 请求的基础 URL

#### `NEXT_PUBLIC_APP_URL`
- **类型**：可选
- **说明**：前端应用 URL（用于重定向等）
- **开发环境**：`http://localhost:3000`
- **生产环境**：`https://yourdomain.com`
- **用途**：前端应用自身的 URL

---

## 📝 完整环境变量列表

### 后端环境变量（.env.local）

```env
# ============================================
# Supabase 配置
# ============================================
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_ANON_KEY="your-anon-key"

# ============================================
# Azure Speech Services 配置
# ============================================
AZURE_SPEECH_KEY="your-azure-speech-key"
AZURE_SPEECH_REGION="eastus"

# ============================================
# Azure OpenAI 配置
# ============================================
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
AZURE_OPENAI_API_KEY="your-azure-openai-key"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"

# ============================================
# Stripe 配置
# ============================================
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# ============================================
# 服务器配置
# ============================================
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### 前端环境变量（.env.local）

```env
# ============================================
# 前端配置
# ============================================
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🔍 环境变量检查清单

### 开发环境必需（MVP）
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `AZURE_SPEECH_KEY`
- [ ] `AZURE_SPEECH_REGION`
- [ ] `AZURE_OPENAI_ENDPOINT`
- [ ] `AZURE_OPENAI_API_KEY`
- [ ] `AZURE_OPENAI_DEPLOYMENT_NAME`
- [ ] `NEXT_PUBLIC_API_URL`

### 支付功能必需
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`

### 可选配置
- [ ] `SUPABASE_ANON_KEY`（如果前端直接访问 Supabase）
- [ ] `STRIPE_PUBLISHABLE_KEY`（如果前端直接调用 Stripe）
- [ ] `PORT`（使用默认值 3001）
- [ ] `FRONTEND_URL`（使用默认值）
- [ ] `NEXT_PUBLIC_APP_URL`（使用默认值）

---

## 🚀 快速验证

### 检查环境变量是否配置

**后端检查**：
```bash
# 在 server/index.ts 启动时检查
node -e "require('dotenv').config(); console.log('Supabase:', !!process.env.SUPABASE_URL); console.log('Azure Speech:', !!process.env.AZURE_SPEECH_KEY); console.log('Azure OpenAI:', !!process.env.AZURE_OPENAI_ENDPOINT);"
```

**前端检查**：
```bash
# Next.js 会自动加载 .env.local
# 检查 NEXT_PUBLIC_API_URL 是否正确
```

---

## 🔒 安全注意事项

### 1. 不要提交敏感信息
- ✅ `.env.local` 已在 `.gitignore` 中
- ❌ 不要将 `.env.local` 提交到 Git
- ❌ 不要在代码中硬编码密钥

### 2. 密钥管理
- **开发环境**：使用 `.env.local`（本地文件）
- **生产环境**：使用平台的环境变量配置
  - Vercel：Dashboard > Settings > Environment Variables
  - Railway/Render：项目设置 > Environment Variables

### 3. 密钥轮换
- 定期轮换 API 密钥
- 如果密钥泄露，立即在服务商处重置

### 4. 权限最小化
- Service Role Key 仅用于后端
- 不要在前端使用 Service Role Key
- 使用 Anon Key 进行前端操作（如果启用 RLS）

---

## 📚 获取密钥指南

### Supabase
1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择或创建项目
3. Settings > API
4. 复制所需密钥

### Azure Speech Services
1. 访问 [Azure Portal](https://portal.azure.com)
2. 创建 "Speech Services" 资源
3. 进入资源 > Keys and Endpoint
4. 复制 Key 和 Region

### Azure OpenAI
1. 访问 [Azure Portal](https://portal.azure.com)
2. 创建 "Azure OpenAI" 资源（需要申请访问权限）
3. 进入资源 > Keys and Endpoint
4. 复制 Endpoint 和 Key
5. 创建部署（Deployments）并记录部署名称

### Stripe
1. 访问 [Stripe Dashboard](https://dashboard.stripe.com)
2. Developers > API keys
3. 复制 Secret key 和 Publishable key
4. Developers > Webhooks
5. 创建 Webhook 端点并复制 Signing secret

---

## 🐛 常见问题

### Q: 环境变量不生效？
**A**: 
- 确保文件名为 `.env.local`（不是 `.env`）
- 重启开发服务器
- 检查变量名拼写是否正确
- 确保没有多余的空格或引号

### Q: `NEXT_PUBLIC_` 变量不生效？
**A**:
- 需要重启 Next.js 开发服务器
- 确保变量名以 `NEXT_PUBLIC_` 开头
- 这些变量会暴露给浏览器，不要放敏感信息

### Q: 后端读取不到环境变量？
**A**:
- 确保 `dotenv.config()` 在代码最前面调用
- 检查 `.env.local` 文件位置（项目根目录）
- 生产环境需要在部署平台配置环境变量

### Q: Azure 服务连接失败？
**A**:
- 检查密钥是否正确
- 检查区域是否匹配
- 检查 Azure 资源是否已启用
- 检查网络连接和防火墙设置

---

## 📖 参考资源

- [Supabase 文档](https://supabase.com/docs)
- [Azure Speech Services 文档](https://learn.microsoft.com/azure/ai-services/speech-service/)
- [Azure OpenAI 文档](https://learn.microsoft.com/azure/ai-services/openai/)
- [Stripe 文档](https://stripe.com/docs)
- [Next.js 环境变量](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## ✅ 配置完成检查

配置完成后，运行以下命令验证：

```bash
# 启动后端（检查环境变量）
npm run dev:backend

# 启动前端（检查环境变量）
npm run dev:frontend
```

如果看到服务正常启动且没有配置错误提示，说明环境变量配置成功！


