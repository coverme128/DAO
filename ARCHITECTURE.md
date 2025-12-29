# Acoda 核心架构设计文档

## 一、整体架构

### 架构模式
- **前端**：Next.js 16 (React 18) + Three.js + Zustand
- **后端**：Node.js + Express.js + Supabase
- **通信**：RESTful API (HTTP/JSON)
- **数据库**：Supabase PostgreSQL
- **第三方服务**：Azure OpenAI、Azure Speech Services、Stripe

### 部署架构
```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │ ──────> │   Backend   │ ──────> │  Supabase   │
│  (Vercel)   │         │  (Node.js)  │         │  (Postgres) │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ├──> Azure OpenAI
                              ├──> Azure Speech
                              └──> Stripe
```

---

## 二、前端核心模块设计

### 2.1 状态管理模块 (Zustand Store)

**职责**：
- 管理全局应用状态
- 统一数据流和状态更新

**核心状态**：
- `userId` / `sessionId` - 用户和会话标识
- `messages` - 聊天消息列表
- `avatarState` - Avatar 状态机 (idle/listening/thinking/speaking)
- `isRecording` / `isPlaying` - 录音和播放状态
- `usage` - 使用量信息 (剩余次数、套餐类型)

**设计原则**：
- 单一数据源
- 不可变状态更新
- 状态与 UI 解耦

---

### 2.2 3D Avatar 模块

**职责**：
- VRM 模型加载和渲染
- 状态驱动的动画切换
- 嘴型同步 (RMS/Viseme 驱动)

**核心组件**：
- `Avatar.tsx` - Canvas 容器和场景设置
- `AvatarModel.tsx` - VRM 模型加载器和动画控制

**状态机设计**：
```
idle ──[用户操作]──> listening ──[录音结束]──> thinking ──[LLM返回]──> speaking ──[播放结束]──> idle
  │                                                                                              │
  └──────────────────────────────────────────[用户打断]──────────────────────────────────────────┘
```

**技术要点**：
- Three.js + React Three Fiber
- @pixiv/three-vrm 加载器
- Web Audio API 分析音频 RMS
- 实时嘴型动画更新

---

### 2.3 语音交互模块

**职责**：
- 按住说话 (PTT) 交互
- 音频录制和上传
- TTS 音频播放和同步

**核心组件**：
- `PTTButton.tsx` - 按住说话按钮
- 音频录制逻辑 (MediaRecorder API)
- 音频播放逻辑 (Web Audio API)

**交互流程**：
1. 按下按钮 → 开始录音 → Avatar 进入 listening
2. 松开按钮 → 停止录音 → 上传音频 → Avatar 进入 thinking
3. 收到 TTS 音频 → 播放音频 → Avatar 进入 speaking + 嘴型同步
4. 播放结束 → Avatar 回到 idle

**错误处理**：
- 麦克风权限被拒 → 引导用户授权
- ASR 失败 → 显示错误提示，可重试
- TTS 失败 → 显示文本回复，禁用播放按钮

---

### 2.4 聊天界面模块

**职责**：
- 消息列表展示
- 文本输入和发送
- 消息状态反馈

**核心组件**：
- `ChatPanel.tsx` - 聊天容器
- `MessageList.tsx` - 消息列表
- `ChatInput.tsx` - 文本输入框

**消息类型**：
- User Message - 用户消息（蓝色）
- Assistant Message - AI 回复（灰色）
- System Message - 系统提示（可选）

**设计要点**：
- 自动滚动到底部
- 消息时间戳显示
- 支持文本和语音两种输入方式

---

### 2.5 设置面板模块

**职责**：
- 用户偏好设置
- 账户管理
- 订阅管理

**核心组件**：
- `SettingsDrawer.tsx` - 设置抽屉组件

**设置分类**：
- **Voice Input**：麦克风选择、输入音量、PTT 设置
- **Voice Output**：TTS 声音、语速、音量
- **Memory**：记忆摘要查看、清除记忆
- **Safety**：安全提示和边界说明
- **Account**：订阅信息、数据删除

---

### 2.6 API 客户端模块

**职责**：
- 统一 API 调用接口
- 请求/响应处理
- 错误处理

**核心配置**：
- `lib/config.ts` - API 端点配置
- 统一使用 `NEXT_PUBLIC_API_URL` 环境变量

**API 调用模式**：
- 所有 API 调用通过 `fetch` 统一处理
- 统一的错误处理和重试逻辑
- 支持 FormData (文件上传) 和 JSON

---

## 三、后端核心模块设计

### 3.1 会话与数据管理模块 (Session & Data Service)

**职责**：
- 用户、会话、消息的 CRUD 操作
- 使用量计数和限额检查
- 数据删除（全量/按会话）

**核心服务**：
- `SessionService` - 会话管理
- `BillingService` - 用户和订阅管理
- `UsageService` - 使用量跟踪

**数据模型**：
- `users` - 用户表（id, email, plan, created_at）
- `sessions` - 会话表（id, user_id, created_at, updated_at）
- `messages` - 消息表（id, session_id, role, content, created_at）
- `usages` - 使用量表（id, user_id, date, voice_count）

**关键逻辑**：
- Free 用户：每天 10 次语音限制
- Pro 用户：无限使用
- 使用量按日期 (YYYY-MM-DD) 统计
- 级联删除：删除用户时自动删除相关数据

---

### 3.2 记忆管理模块 (Memory Service)

**职责**：
- 生成对话摘要
- 管理记忆过期策略
- 提供记忆注入接口

**核心服务**：
- `MemoryService` - 记忆 CRUD 和摘要生成

**记忆策略**：
- Free：记忆保留 1 天
- Pro：记忆保留 90 天
- 自动过期清理

**摘要生成**：
- 使用 LLM 生成对话摘要
- 只存储摘要，不存储原始消息
- 摘要注入到系统提示词中

**数据模型**：
- `memories` - 记忆表（id, user_id, summary, updated_at, expires_at）

---

### 3.3 对话编排模块 (Orchestrator Service)

**职责**：
- 串联 ASR → LLM → TTS 流程
- 错误降级处理
- 输出统一事件流

**核心服务**：
- `OrchestratorService` - 主编排逻辑

**处理流程**：
```
用户输入 (文本/音频)
    ↓
[ASR] 音频 → 文字
    ↓
[Memory] 注入记忆上下文
    ↓
[LLM] 生成回复
    ↓
保存消息到数据库
    ↓
[TTS] 文字 → 音频
    ↓
返回结果 + 控制标签
```

**错误处理**：
- ASR 失败 → 返回错误，提示重试
- LLM 失败 → 返回占位符或错误信息
- TTS 失败 → 返回文本，前端显示文本回复

**控制标签 (Control Tags)**：
- `emotion` - 情绪标签（warm, happy, etc.）
- `gesture` - 手势标签（nod, wave, etc.）
- `intensity` - 强度值（0-1）

---

### 3.4 ASR/TTS 提供商模块

**职责**：
- 语音转文字 (ASR)
- 文字转语音 (TTS)
- 提供商抽象接口

**核心服务**：
- `AzureASRProvider` - Azure Speech 语音识别
- `AzureTTSProvider` - Azure Speech 语音合成

**接口设计**：
- `ASRProvider.transcribe(audio, options)` → `{ text, segments? }`
- `TTSProvider.speak(text, options)` → `{ audio, visemeEvents? }`

**技术实现**：
- Azure Speech SDK (microsoft-cognitiveservices-speech-sdk)
- 支持流式处理（后续升级）
- Viseme 事件用于嘴型同步（后续升级）

---

### 3.5 LLM 提供商模块

**职责**：
- 对话生成
- 系统提示词管理
- 响应格式化

**核心服务**：
- `OrchestratorService.callLLM()` - Azure OpenAI 调用

**提示词结构**：
```
System Prompt:
- 角色设定（Acoda）
- 记忆上下文（如有）
- 行为准则

User Messages:
- 历史对话
- 当前用户输入

Assistant Response:
- 生成回复
```

**配置参数**：
- `temperature`: 0.7（平衡创造性和准确性）
- `maxTokens`: 500（限制回复长度）
- `deployment`: 从环境变量读取

---

### 3.6 订阅与策略模块 (Billing & Policy Service)

**职责**：
- Free/Pro 套餐判定
- 每日语音额度管理
- 记忆保留策略
- 系统级内容护栏

**核心服务**：
- `BillingService` - 订阅管理
- `UsageService` - 额度检查
- `MemoryService` - 记忆策略

**套餐策略**：
- **Free**：
  - 每天 10 次语音
  - 记忆保留 1 天
- **Pro**：
  - 无限消息
  - 记忆保留 90 天

**内容安全**：
- 不装真人
- 不提供医疗/法律/金融建议
- 危机情况提示专业帮助

---

### 3.7 API 路由模块

**职责**：
- RESTful API 端点定义
- 请求验证和错误处理
- 响应格式化

**核心路由**：
- `POST /api/asr` - 语音转文字
- `POST /api/chat` - 对话生成
- `POST /api/tts` - 文字转语音
- `POST /api/usage/consume-voice` - 消费语音额度
- `POST /api/usage/check` - 检查剩余额度
- `POST /api/sessions` - 创建会话
- `GET /api/sessions` - 获取会话
- `POST /api/users` - 创建/获取用户
- `GET /api/memory` - 获取记忆摘要
- `DELETE /api/memory` - 清除记忆
- `POST /api/stripe/webhook` - Stripe 支付回调

**中间件**：
- CORS 配置
- JSON 解析
- 错误处理
- Stripe Webhook 签名验证

---

## 四、数据流设计

### 4.1 语音对话流程

```
前端 (PTTButton)
  ↓ 录音
  ↓ 上传音频
后端 /api/asr
  ↓ ASR 转文字
  ↓ 检查使用量
后端 /api/usage/consume-voice
  ↓ 扣减额度
后端 /api/chat
  ↓ 获取记忆
  ↓ 调用 LLM
  ↓ 保存消息
  ↓ 更新记忆
后端 /api/tts
  ↓ 生成音频
  ↓ 返回音频流
前端
  ↓ 播放音频
  ↓ 驱动 Avatar 嘴型
```

### 4.2 文本对话流程

```
前端 (ChatInput)
  ↓ 输入文本
  ↓ 发送请求
后端 /api/chat
  ↓ (同上)
后端 /api/tts
  ↓ (同上)
前端
  ↓ (同上)
```

---

## 五、关键技术决策

### 5.1 数据库选择：Supabase
- **原因**：PostgreSQL + 实时功能 + 认证 + 存储一体化
- **优势**：无需 Prisma，直接使用 Supabase Client
- **迁移**：SQL 迁移脚本管理

### 5.2 状态管理：Zustand
- **原因**：轻量级、TypeScript 友好、无需 Provider
- **优势**：简单 API、性能好、易于测试

### 5.3 3D 渲染：React Three Fiber
- **原因**：React 声明式 API + Three.js 性能
- **优势**：组件化、易于维护、生态丰富

### 5.4 语音服务：Azure Speech Services
- **原因**：高质量 ASR/TTS、Viseme 支持
- **优势**：多语言、流式支持、企业级稳定性

### 5.5 LLM：Azure OpenAI
- **原因**：企业级安全、合规性、稳定 API
- **优势**：数据不出 Azure、SLA 保障

---

## 六、扩展性设计

### 6.1 流式处理（V2）
- WebSocket 连接
- 流式 ASR（实时字幕）
- 流式 LLM（逐 token 返回）
- 流式 TTS（边生成边播放）

### 6.2 多角色支持（V2）
- 角色配置系统
- 不同 System Prompt
- 不同 TTS 声音

### 6.3 表情和动作（V2）
- Control Tags 扩展
- VRM BlendShape 控制
- 情绪识别和响应

### 6.4 多语言支持（V2）
- 语言检测
- 多语言 ASR/TTS
- 多语言 UI

---

## 七、安全与合规

### 7.1 数据安全
- Supabase RLS（Row Level Security）
- Service Role Key 仅后端使用
- 用户数据隔离

### 7.2 API 安全
- CORS 限制
- 请求验证（Zod）
- 错误信息不泄露敏感数据

### 7.3 内容安全
- 系统提示词约束
- 不提供医疗/法律/金融建议
- 危机情况提示专业帮助

### 7.4 隐私保护
- 用户可删除数据
- 记忆只存摘要
- 数据自动过期

---

## 八、性能优化

### 8.1 前端优化
- 代码分割（动态导入）
- 图片优化（Next.js Image）
- 3D 模型懒加载
- 音频预加载

### 8.2 后端优化
- 数据库索引
- 连接池（Supabase）
- 响应缓存（后续）
- 异步处理（后续）

### 8.3 网络优化
- 音频压缩
- 请求合并（后续）
- CDN 加速（Vercel）

---

## 九、监控与日志

### 9.1 前端监控
- 错误边界（Error Boundary）
- 用户行为追踪（可选）
- 性能监控（Web Vitals）

### 9.2 后端监控
- API 日志
- 错误日志
- 性能指标（响应时间）
- 使用量统计

### 9.3 告警机制
- API 错误率告警
- 使用量异常告警
- 服务可用性告警

---

## 十、部署与运维

### 10.1 前端部署
- **平台**：Vercel
- **构建**：Next.js 自动构建
- **环境变量**：Vercel Dashboard 配置

### 10.2 后端部署
- **平台**：Railway / Render / Fly.io
- **构建**：TypeScript 编译
- **启动**：`node server/dist/index.js`
- **环境变量**：平台配置

### 10.3 数据库部署
- **平台**：Supabase
- **迁移**：SQL Editor 执行
- **备份**：Supabase 自动备份

### 10.4 CI/CD（后续）
- GitHub Actions
- 自动化测试
- 自动化部署

---

## 十一、开发规范

### 11.1 代码规范
- TypeScript 严格模式
- ESLint + Prettier
- 统一的命名规范

### 11.2 Git 规范
- Feature 分支开发
- Commit 信息规范
- PR Review 流程

### 11.3 文档规范
- API 文档（Swagger/OpenAPI，后续）
- 代码注释
- README 更新

---

## 十二、测试策略

### 12.1 单元测试（后续）
- Service 层测试
- 工具函数测试
- Mock 外部依赖

### 12.2 集成测试（后续）
- API 端点测试
- 数据库操作测试
- 第三方服务 Mock

### 12.3 E2E 测试（后续）
- 用户流程测试
- 浏览器自动化
- 语音交互测试

---

## 总结

本架构设计遵循以下原则：
1. **模块化**：清晰的职责划分
2. **可扩展**：预留扩展接口
3. **可维护**：统一的代码规范
4. **高性能**：优化关键路径
5. **安全**：多层安全防护
6. **可观测**：完善的日志和监控

架构支持从 MVP 逐步演进到完整产品，每个模块都可以独立升级和优化。

