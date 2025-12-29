# pc web端最小 PRD 固化版（执行规格）

---

## 一、产品定位

- **类型**：陪聊型 AI 伴侣  
- **平台**：Web-only  
- **语言**：英文  
- **角色**：1 个角色 —— **Acoda（温和语气）**

PC Web 最适合做成**主舞台 + 侧栏**的沉浸式单页应用（SPA）：

### 布局

- **左侧（主舞台）**：
  - 3D 角色（Acoda）
  - 状态反馈：
    - Listening
    - Thinking
    - Speaking

- **右侧（对话侧栏）**：
  - 聊天记录
  - 控制区：
    - 按住说话按钮（PTT）
    - 文本输入框
    - 设置入口

- **顶部（轻 Header）**：
  - Logo
  - 套餐状态（Free / Pro）
  - Usage 计数
  - 账号菜单

**设计目标**：用户一进来就知道，按住说话就能聊，角色会“动嘴”回应。

---

## 二、信息架构（最小 IA）

### 1) Home / Chat（核心页，90% 使用场景）

- 3D 角色舞台
- 聊天流（支持语音与文本）
- 按住说话按钮（PTT）
- TTS 播放控件（自动播放 + 可暂停 / 重播）
- 记忆提示：
  - 文案示例：“Acoda remembers a short summary of recent chats”
  - 管理入口

### 2) Settings（抽屉 / 模态，不单独页面）

- **Voice Input**
  - 麦克风选择
  - 输入音量条
  - 按住说话设置
- **Voice Output**
  - TTS 声音
  - 语速
  - 音量
- **Memory**
  - 记忆开关
  - 查看摘要
  - 清除记忆
- **Safety**
  - 边界提示：
    - 不装真人
    - 不提供医疗 / 法律 / 金融建议
- **Account**
  - 订阅信息
  - 登出
  - 删除数据（Delete my data）

### 3) Billing（可合并进 Settings）

- **Free**
  - 剩余次数（今日语音 / 消息）
- **Pro**
  - 权益说明（无限消息 / 更长记忆）
- **升级按钮**
  - Stripe Checkout

---

## 三、核心交互（PC Web 关键细节）

### A) 按住说话（PTT）交互规范

- 按下开始录音：
  - 按钮变红 / 波纹
  - 显示“Listening…”
- 松开发送：
  - 自动结束录音
  - 进入“Thinking…”
- Esc 取消：
  - 取消本次录音，不发送
- 录音时显示输入音量：
  - 给用户确认“麦克风正在收音”
- ASR 出来的文字：
  - 先显示灰色草稿
  - 可“Edit & Send”（可选，但加分）

---

### B) 回答播放与嘴型

- LLM 返回后立即进入“Speaking…”
- TTS 播放边驱动嘴型（实时更自然）
- 提供 **Stop / Replay**
- 用户在 Speaking 时按住说话：
  - **推荐**：打断（barge-in）→ 停止 TTS，开始 Listening
  - 不推荐：排队 → 陪伴感差

---

### C) 失败兜底（必须实现）

- **麦克风权限被拒**：
  - 一键引导用户打开浏览器权限
  - fallback 到文本输入
- **ASR 失败**：
  - 提示：“Couldn’t hear that—try again.”
  - 可重试
- **TTS 失败**：
  - 显示文本回答
  - “Play again”按钮灰掉

## 二、核心闭环

**按住说话 → ASR → LLM → TTS → 播放 + 3D 嘴型**

- **MVP 嘴型**：音量（RMS）驱动张嘴（后续升级 viseme）
- **MVP 语音**：整段录音 / 整段 TTS（后续升级流式）


前端：Next.js, Three.js, Web Audio API, MediaRecorder, Vercel

后端：Node.js, Supabase, Stripe

ASR/TTS：Azure AI Speech

LLM：Azure OpenAI

DB/Auth：Supabase

---

## 三、记忆策略

- **记忆类型**：摘要记忆  

| 方案 | 记忆保留 |
|----|----|
| Free | 1 天 |
| Pro | 90 天 |

---

## 四、订阅策略

| 方案 | 权限 |
|----|----|
| Free | 每天 10 次语音 |
| Pro | 无限消息 + 90 天记忆 |

---

## 五、风控声明（系统级）

- 不装真人  
- 不提供医疗 / 法律 / 金融建议  
- **危机情况提示**：建议寻求专业帮助（一句话即可，不强制）

---

## 六、数据与隐私

- 聊天：**持久化存储**
- 用户：**可删除数据**
  - 删除账号
  - 删除全部对话（级联删除）

---

## 七、功能清单（按 MVP → V2）

### MVP（上线可收费）

- 3D 角色页：加载 VRM，`idle / listening / speaking` 三态
- 按住说话录音（整段）→ 上传
- ASR 返回文字（显示字幕）
- LLM 返回回答（显示字幕）
- TTS 返回音频（播放）
- 播放时 RMS 驱动嘴型
- 会话存储（session / messages）
- 摘要记忆（Free 1 天 / Pro 90 天）
- 订阅开关（Stripe）：Free / Pro gating  
  - Free：10 次语音 / 天  
  - Pro：无限

---

## 八、数据模型（最小够用）

**ORM：Prisma（建议）**

### 表结构

#### User
- `id`
- `email?`
- `plan` (`free | pro`)
- `createdAt`

#### Session
- `id`
- `userId`
- `createdAt`
- `updatedAt`

#### Message
- `id`
- `sessionId`
- `role` (`user | assistant`)
- `content`
- `createdAt`

#### Memory
- `id`
- `userId` 或 `sessionId`
- `summary`
- `updatedAt`
- `expiresAt`（Free：+1 天 / Pro：+90 天）

#### Usage
- `id`
- `userId`
- `date`（YYYY-MM-DD）
- `voiceCount`

### 删除策略

- 删除账号 / 删除数据  
  → **级联删除**：Session / Message / Memory / Usage

---

## 九、角色设定（Acoda · System Prompt 最小版）

- 名字：**Acoda**
- 语气：温和、简短
- 行为：
  - 会追问澄清
  - 不声称自己是人或有真实经历
  - 不提供医疗 / 法律 / 金融建议
  - 遇到危险或危机话题：**建议寻求专业帮助**

---

## 十、里程碑（按“产出物”定义）

| 里程碑 | 产出 |
|----|----|
| M1 | 3D VRM 场景（角色站立 + 三态切换） |
| M2 | 录音 → ASR（字幕出现，listening） |
| M3 | Chat → 字幕（回答出现，speaking） |
| M4 | TTS → 播放 + 张嘴（结束复位） |
| M5 | 存储 + 摘要记忆（Free / Pro 生效） |
| M6 | 订阅 + 额度（10 次 / 无限） |

---

## 十一、核心模块（必须先定义接口）

### 1️⃣ Session & Data（会话与数据域）

**职责**
- user / session / message CRUD
- usage（每日 10 次语音）计数与限额
- 数据删除（全量 / 按会话）

**输入 / 输出**
- 输入：`userId`, `sessionId`, `message`
- 输出：`history`, `usage`, 删除结果

**为什么是核心**
- 订阅、额度、记忆、合规全依赖

---

### 2️⃣ Memory（摘要记忆域）

**职责**
- 从历史消息生成 `memory_summary`
- Free / Pro 设置不同 `expiresAt`
- 提供统一「注入提示词」接口

**关键点**
- 可控、可清空、可过期
- 只存摘要，避免敏感原文

---

### 3️⃣ Orchestrator（对话编排域）

**职责**
audio → text → response_text → response_audio (+ controlTags)

- 串联 ASR / LLM / TTS
- 错误降级
- 输出统一事件流（驱动 UI / Avatar）

---

### 4️⃣ Avatar Runtime（3D 头像运行时）

**职责**
- VRM 加载（Three.js）
- 状态机：idle / listening / speaking / react
- 接口：
  - `setMouth(v)`
  - `applyTags(tags)`
  - `setMode(mode)`

**关键点**
- 只吃控制信号
- 不关心文字 / ASR / LLM / TTS

---

### 5️⃣ Billing & Policy（订阅与策略域）

**职责**
- Free / Pro 判定
- 每日语音额度
- 记忆保留策略
- 系统级内容护栏

---

## 十二、可插拔模块（供应商适配层）

### A) ASR Provider

```ts
transcribe(audio, opts): Promise<{ text; segments? }>
LM Provider
complete(messages, opts): Promise<{ text; tags? }>
stream(messages, opts): AsyncIterable<{ token | tags | done }>

C) TTS Provider
speak(text, opts): Promise<{ audio; visemeEvents? }>
streamSpeak(text, opts): AsyncIterable<{ audioChunk; visemeEvents? }>


## 十三、部署结构（自建 Node）

### 前端（Next.js）

- **部署**：Vercel  
- **职责**：
  - UI 渲染
  - 3D Avatar
  - 录音
  - 播放音频
- **原则**：仅轻逻辑，不承载业务

---

### 后端（Node.js 服务）

- **形态**：长期运行的 HTTP API 服务  

- **域名示例**：`https://api.acoda.ai`

#### Endpoints
- `/asr`
- `/chat`
- `/tts`
- `/usage/consume-voice`
- `/stripe/webhook`

> **后续流式升级**：  
> 在同一服务上增加  
> `wss://api.acoda.ai/ws`  
> 无需调整整体架构

---

## 十四、后端接口清单

### ① POST /asr

**用途**：语音转文字  

- **入参**：`multipart/form-data`
  - `audio`
- **返回**：
```json
{ "text": "..." }
② POST /chat
用途：对话生成（注入摘要记忆）

入参

json
复制代码
{
  "userId": "u_xxx",
  "sessionId": "s_xxx",
  "userText": "...",
  "history": []
}
返回

json
复制代码
{
  "assistantText": "...",
  "controlTags": {
    "emotion": "warm",
    "gesture": ["nod"],
    "intensity": 0.6
  }
}
Phase 1：controlTags 可先固定
接口预留，后续扩展表情 / 动作

③ POST /tts
用途：文字转语音（整段）

入参

json
复制代码
{ "text": "..." }
返回：audio/mpeg

④ POST /usage/consume-voice
用途：语音额度扣减（Free 每天 10 次）

入参

json
复制代码
{ "userId": "u_xxx" }
返回（允许）

json
复制代码
{ "allowed": true, "remaining": 7, "plan": "free" }
返回（超限）

json
复制代码
{ "allowed": false, "remaining": 0, "plan": "free" }
⑤ POST /stripe/webhook
用途：订阅状态同步

Stripe Webhook 验签

更新用户 plan（free | pro）

十五、阶段 1 交互流程（Node 版）
前端 按住说话录音（整段）

调用 /usage/consume-voice

Free 超限 → 展示 Paywall

/asr → 返回 text

/chat（Node 注入 memory summary）

/tts → 返回 mp3

前端播放音频

WebAudio RMS 驱动 VRM 嘴型

Node 写入数据：

messages

memory（带 expiresAt）

十六、数据与权限（推荐方案）
做法 A（MVP 推荐）
Node 使用 Supabase service role key

前端仅传 userId（支持匿名）

权限控制集中在 Node

不依赖 Supabase RLS（降低复杂度）
