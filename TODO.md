# 待办事项清单

## 🔴 必须完成（项目运行前）

### 1. 清理重复文件
- [ ] 删除 `lib/services/` 目录（已迁移到 `server/services/`）
- [ ] 删除 `lib/prisma.ts`（前端不需要直接访问数据库）

### 2. 环境配置
- [ ] 创建 Supabase 项目并获取连接信息
- [ ] 配置 `.env.local` 文件（参考 `env.example`）
- [ ] 运行数据库迁移：`npx prisma db push`

### 3. 依赖安装
- [ ] 运行 `npm install` 安装所有依赖

## 🟡 核心功能实现（MVP 必需）

### 4. Azure OpenAI 集成
- [ ] 实现 `server/services/orchestrator.ts` 中的 `callLLM()` 方法
- [ ] 配置 Azure OpenAI SDK
- [ ] 测试对话生成功能

### 5. Azure Speech Services 集成
- [ ] 实现 `server/services/asr.ts` 中的 `transcribe()` 方法
- [ ] 实现 `server/services/tts.ts` 中的 `speak()` 方法
- [ ] 配置 Azure Speech SDK
- [ ] 测试语音转文字和文字转语音

### 6. VRM 模型加载
- [ ] 实现 `components/AvatarModel.tsx` 中的 VRM 加载
- [ ] 添加 VRM 模型文件到 `public/models/`
- [ ] 实现嘴型同步（viseme 或 RMS 驱动）

### 7. 记忆摘要生成
- [ ] 实现 `server/services/memory.ts` 中的 `generateSummary()` 方法
- [ ] 使用 LLM 生成对话摘要

## 🟢 功能增强（可选但推荐）

### 8. Stripe 支付集成
- [ ] 实现 `server/routes/stripe.ts` 中的用户订阅映射
- [ ] 创建 Stripe Checkout 会话
- [ ] 实现订阅状态同步逻辑

### 9. 用户认证
- [ ] 集成 Supabase Auth
- [ ] 实现登录/注册功能
- [ ] 添加用户会话管理

### 10. 错误处理
- [ ] 添加全局错误处理中间件
- [ ] 实现错误日志记录
- [ ] 添加用户友好的错误提示

### 11. 测试
- [ ] 添加单元测试
- [ ] 添加集成测试
- [ ] 添加 E2E 测试

## 📝 文档和部署

### 12. 部署准备
- [ ] 配置生产环境变量
- [ ] 设置 CI/CD 流程
- [ ] 配置域名和 SSL

### 13. 性能优化
- [ ] 添加 API 响应缓存
- [ ] 优化数据库查询
- [ ] 实现流式响应（SSE/WebSocket）

## 🔧 代码质量

### 14. 代码清理
- [ ] 移除未使用的依赖
- [ ] 统一代码风格
- [ ] 添加类型定义完善

