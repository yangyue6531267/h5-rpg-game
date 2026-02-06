---
name: setting-detector
description: "自动检测故事设定（类型、时代、主题）并激活对应知识库。当用户提到言情、悬疑、历史、复仇、武侠、民国、1920等关键词时自动激活对应的写作知识库。适用于需要类型特定写作指导的小说创作。"
allowed-tools: Read
---

# 故事设定自动检测器

## 核心功能
**自动激活知识库系统** - 后台静默运行的知识调度器。

当你提到特定关键词时，我会自动：
1. 检测故事的类型、时代、主题
2. 加载对应的写作知识库
3. 在整个创作过程中应用专业知识

**无需手动调用** - 完全自动化。

---

## 关键词映射表

### 类型知识库（Genres）

**言情小说**（romance）：
```
触发词：言情、爱情、恋爱、浪漫、感情线、CP、甜文、虐文、
       HE、BE、双洁、破镜重圆、先婚后爱、契约关系

激活：templates/knowledge-base/genres/romance.md
```

**悬疑推理**（mystery）：
```
触发词：悬疑、推理、侦探、破案、谜团、线索、真相、凶手、犯罪、
       密室、诡计、不在场证明

激活：templates/knowledge-base/genres/mystery.md
```

**历史小说**（historical）：
```
触发词：历史、古代、朝代、考据、古言、穿越、架空历史、
       宫斗、宅斗

激活：templates/knowledge-base/genres/historical.md
```

**复仇爽文**（revenge）：
```
触发词：复仇、报仇、打脸、爽文、逆袭、反击、重生复仇、
       穿越复仇、系统、金手指

激活：templates/knowledge-base/genres/revenge.md
```

**武侠小说**（wuxia）：
```
触发词：武侠、江湖、武功、侠客、门派、武学、剑客、
       轻功、内功、武林、江湖恩仇、侠义

激活：templates/knowledge-base/genres/wuxia.md
```

### 参考资料库（References）

**1920年代中国**（china-1920s）：
```
触发词：1920、民国、军阀、北洋、穿越民国、二十年代

激活：templates/knowledge-base/references/china-1920s/
```

---

## 自动激活流程

### 示例1：单一类型检测
```
用户："我要写一部言情小说"
              ↓
[检测到关键词："言情"]
              ↓
✓ 自动加载：romance.md
              ↓
AI回复："太好了！让我帮你创作言情小说。
根据言情类型惯例，我们需要明确几个核心元素...
（自动应用romance.md中的知识）"
```

### 示例2：多类型组合检测
```
用户："我要写一部1920年代的言情复仇小说"
              ↓
[检测到关键词："1920"、"言情"、"复仇"]
              ↓
✓ 自动加载：romance.md
✓ 自动加载：revenge.md
✓ 自动加载：references/china-1920s/
              ↓
📚 已激活知识库：
- genres/romance.md（言情小说惯例）
- genres/revenge.md（复仇爽文技巧）
- references/china-1920s/（1920年代背景）
```

---

## 手动控制

### 查看当前激活的知识库
随时询问：
```
"当前激活了哪些知识库？"
```

### 手动激活知识库
如果自动检测失败，可以明确指定：
```
"请加载 romance 和 mystery 知识库"
"这个故事需要 1920s 中国参考资料"
"激活武侠知识库"
```

### 停用知识库
如果某个知识库不需要了：
```
"停用 revenge 知识库，这个故事不涉及复仇"
```

---

## 智能特性

### 1. 模糊匹配
即使不是精确关键词也能识别：
```
"我想写个穿越到民国的复仇故事"
           ↓
识别："民国" → 1920s中国
     "复仇" → revenge
```

### 2. 上下文理解
根据对话上下文持续识别：
```
第1条消息："我要写小说"
→ 未激活任何知识库（等待更多信息）

第2条消息："主角是侦探"
→ 激活mystery.md

第3条消息："还有感情线"
→ 额外激活romance.md

→ 当前激活：mystery + romance（浪漫悬疑）
```

### 3. 自动去重
避免重复激活：
```
用户："这是武侠小说，江湖背景，有武功"
            ↓
识别到3个武侠关键词，但只激活1次wuxia.md
```

---

## 与requirement-detector配合

本Skill与requirement-detector协同工作：

```
用户输入："我要写民国言情复仇小说，口语化，去AI味"

setting-detector → 识别：romance + revenge + china-1920s
requirement-detector → 识别：fast-paced + anti-ai-v4

最终效果：
- 言情+复仇类型知识指导
- 1920s历史背景参考
- 快节奏爽文节奏
- 强力去AI味
```

---

## 知识库扩展

### 当前支持
| 类别 | 已完成 |
|------|--------|
| 类型知识 | romance, mystery, historical, revenge, wuxia |
| 参考资料 | china-1920s |

### 添加新知识库
1. 在`templates/knowledge-base/`对应目录创建文件
2. 更新关键词映射表
3. setting-detector会自动识别

---

**Skill版本**: v1.0
**最后更新**: 2026-01-17
**协作**: requirement-detector
