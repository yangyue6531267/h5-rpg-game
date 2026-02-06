# 《我把你当师姐》H5 RPG游戏设计与实现文档（v0.1）

## 1. 文档目标

本文件用于把现有剧情大纲落地为可开发、可验收的 H5 RPG 方案，作为后续代码实现基线。

- 先产出单机 H5 版本（移动端优先，桌面端兼容）。
- 以“剧情推进 + 回合战斗 + 养成”为核心循环。
- 按章节逐步可玩，先完成 MVP（Ch01-Ch05）。

## 2. 大纲来源与范围

### 2.1 输入大纲

- `docs/大纲_Ch1-20.md`
- `docs/大纲_Ch21-40.md`
- `docs/大纲_Ch57-67.md`

### 2.2 本期范围

- 主角：陈道
- 主线：从“血条开局”到“金鳞杀局/太素寻剑”的章节化体验
- 形态：剧情驱动单机 RPG（非开放世界、非联机）

### 2.3 非本期范围

- 多人联机/PVP
- 后端账号体系
- 大地图自由探索（先用章节节点替代）

## 3. 产品定位

- 类型：文字剧情 RPG + 回合制战斗 + 轻养成
- 体验关键词：黑色幽默、修仙求生、系统吐槽、以伤换伤
- 单次游玩节奏：3-8 分钟/章节段落，碎片化推进
- 平台：移动浏览器优先（H5），不依赖后端

## 4. 核心玩法循环

1. 读取剧情节点（旁白/对话/系统弹窗）
2. 出现分支选择，按条件判定（属性/物品/好感/flag）
3. 进入战斗或修炼
4. 结算奖励（经验、物品、符钱、关系）
5. 切入下一节点或下一章

## 5. 系统设计

### 5.1 属性与成长

| 模块 | 字段 | 说明 |
|---|---|---|
| 生存 | `hp/maxHp` | 血量，战斗与剧情判定核心 |
| 资源 | `sp/maxSp` | 灵力，技能消耗 |
| 状态 | `mood/maxMood` | 心情值，后续可接 SAN/分支 |
| 战斗 | `attack/defense/speed` | 基础战斗参数 |
| 成长 | `exp/expToNext` | 升级与境界推进 |
| 特性 | `killIntent` | 杀意值，用于爆发与剧情风格强化 |

境界采用“炼气 -> 筑基”可扩展结构，后续继续加金丹及以上。

### 5.2 战斗系统（回合制）

- 玩家行动：攻击、技能、以伤换伤、物品、防御、逃跑
- 敌方行动：普通攻击 + 概率技能
- 关键机制：`以伤换伤`
  - 先承伤（至少保留 1HP）
  - 触发高伤反击（必暴击/高倍率）
  - 提升杀意值，形成“赌命”风格

### 5.3 剧情节点系统

节点类型：

- `narration`：旁白
- `dialogue`：对话
- `choice`：分支选择
- `system`：系统提示弹窗
- `combat`：进入战斗
- `cultivation`：修炼插段
- `transition`：章节过渡

推荐节点结构（示例）：

```js
{
  id: "ch01_poison_warn",
  type: "system",
  title: "系统警告",
  messages: [
    { text: "【警告：百草蛊酒。每小时HP-10】", style: "dmg" },
    { text: "【系统：你这开局，地狱难度。】", style: "snark" }
  ],
  effects: [{ type: "flag", key: "ch01_poisoned", value: true }],
  next: "ch01_find_ginger"
}
```

### 5.4 养成系统

- 修炼：打坐（恢复灵力+经验）、休息（回血）
- 背包：物品使用、战斗物品调用
- 装备：武器/护甲/饰品槽位
- 关系：角色好感度与阈值标签

### 5.5 存档系统

- 本地存档（`localStorage`）
- 3 个手动槽位 + 1 个自动存档
- 存档内容：玩家状态、章节节点、时间戳、版本号

## 6. 剧情落地映射（按阶段）

### 6.1 MVP（Ch01-Ch05）

目标：跑通“能开局、能战斗、能结算、能过章”。

- Ch01 血条：蛊毒预警、红姜回血、进入师门
- Ch02 药人：苏灵韵试药、重伤判定、关系建立
- Ch03 刷毒：毒丹收益/风险、系统吐槽强化
- Ch04 逆练：高风险修炼节点、首个修炼插段
- Ch05 夺舍：首次强敌战 + 反杀 + 获得关键技能

### 6.2 Alpha（Ch01-Ch20）

围绕 `docs/大纲_Ch1-20.md` 完整落地：

- 新手村生存（1-8）
- 宗门黑幕（9-15）
- 筑基风云（16-20）

补充系统：

- 毒抗/状态效果
- 更完整怪物与掉落表
- 多段 Boss 战

### 6.3 Beta（Ch21-Ch40）

围绕 `docs/大纲_Ch21-40.md` 落地“回山与整备”到“大战余波”。

重点增加：

- 修罗场关系分支（青禾/苏灵韵/杨幼微）
- 宗门站队旗标（入世/出世）
- 事件链连续状态（证词、阵营、仇恨）

### 6.4 Release（Ch57-Ch67）

围绕 `docs/大纲_Ch57-67.md` 落地“归山-金鳞-太素寻剑”。

重点增加：

- 大场景事件（海市、金鳞号、剑炉）
- 多角色协同事件（大师团/F4）
- 高阶越阶斩杀与阶段奖励

## 7. 数据与目录规范

目标目录（基于现有 `game/` 结构）：

```txt
game/
  data/
    characters.js
    skills.js
    items.js
    monsters.js
    chapters/
      ch01.js
      ch02.js
      ...
  js/
    core.js
    story.js
    combat.js
    cultivation.js
    inventory.js
    relationship.js
    save.js
    renderer.js
    app.js
```

章节文件规范：

- 文件：`game/data/chapters/chXX.js`
- 导出形式：启动时调用 `game.registerChapter("chXX", chapterData)`
- 节点 ID：统一 `chXX_xxx`
- 每章至少包含：
  - `chXX_start`
  - 1 个 `choice` 节点
  - 1 个 `system` 或 `combat` 节点
  - `chXX_end` 或 `transition` 节点

## 8. 当前工程状态与缺口（已核对）

### 8.1 已存在

- 页面框架：`game/index.html`
- 核心模块：`game/js/core.js`
- 剧情系统：`game/js/story.js`
- 战斗系统：`game/js/combat.js`
- 渲染系统：`game/js/renderer.js`
- 背包/修炼/存档：已具备基础实现
- 数据：`game/data/characters.js`、`game/data/skills.js`

### 8.2 缺失与阻塞

`game/index.html` 已引用但当前缺失以下文件：

- `game/data/items.js`
- `game/data/monsters.js`
- `game/data/chapters/ch01.js` 到 `game/data/chapters/ch05.js`
- `game/js/relationship.js`
- `game/js/app.js`

`game/data/chapters/` 目录目前为空，主线尚未可运行。

## 9. 实施里程碑与验收标准

### M1：工程可启动

- 补齐缺失脚本（可最小实现）
- 页面无 `404`/无致命 `ReferenceError`

### M2：MVP剧情可玩（Ch01-Ch05）

- 可从标题页进入剧情
- 至少 2 场战斗可完成
- 可正常存档/读档
- 可完整进入 Ch05 结尾过渡

### M3：Alpha扩展（Ch01-Ch20）

- 主线章节连续可玩
- 分支与状态变量可追踪
- 数值曲线与掉落稳定

## 10. 下一步执行清单

按本文件继续开发时，建议顺序：

1. 补齐 `items.js`、`monsters.js`、`app.js`、`relationship.js` 的最小可运行版本。
2. 先做 `ch01-ch05` 章节数据文件，跑通主流程。
3. 再按大纲扩展到 Ch20，并补充测试与数值校准。

