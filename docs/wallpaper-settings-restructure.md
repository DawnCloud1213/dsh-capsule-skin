# 壁纸设置层级重构 · 详细实现方案

> 分支：`feat/wallpaper-settings-restructure`
> 依据：互联网调研结论（Windows/macOS/GNOME/KDE/Deepin/iOS/Android/HarmonyOS/HyperOS/ColorOS/OriginOS/Wallpaper Engine + Fluent/HIG/GNOME HIG 规范）+
> 用户新决策：**「胶囊模糊」并入美化编辑器，紧挨「壁纸模糊」**。
> 涉及文件：`lib/client.js`（仅客户端；`lib/index.js` 服务端零改动）。

---

## 0. 调研结论（方案依据）

1. 壁纸设置归入「个性化/外观」聚合面板，与主题/颜色/锁屏/字体并列。
2. **换壁纸（选素材）与美化（编辑当前素材）分属两个层级**：美化发生在"选中某张壁纸之后"的编辑上下文，不是设置树独立分支。
3. 素材源管理（导入/目录/扫描）收敛为壁纸选择器层的一个入口，不占主干。
4. 设置树保持扁平：避免深层导航，"切换类"内联、"配置类"才开子页。

## 1. 目标层级（重构后）

```
设置
└─ 壁纸皮肤（分区名可选改为「外观与壁纸」，见 §5）
   ├─ 分组「壁纸」                          ← 列表视图（唯一主干视图）
   │   ├─ 壁纸网格：点击 = 应用；卡片操作 = 美化 / 删除
   │   └─ 「＋ 添加壁纸」→ 弹层（壁纸目录 + 扫描新壁纸）   ← Phase 2
   └─ 美化编辑器（覆盖层/抽屉，可关闭，不打断列表）        ← Phase 2 形态；Phase 1 暂保留视图切换
       ├─ 预设 chips
       ├─ 滤镜
       │   ├─ 模糊（壁纸）   ← 现状 FILTER_KEYS[0]
       │   ├─ 胶囊模糊（全局）← ★ 本次核心改动：紧跟壁纸模糊
       │   └─ 亮度/对比度/饱和度/灰度/复古/色相
       ├─ 氛围 / 色调 / 取景 / 文字水印 / 自适应文字
       └─ 启用美化 / 重置
```

**删除**：列表视图的「外观」分组（`buildAppearanceBlock`）整体移除。

## 2. 改动范围总览

| # | 改动 | 位置（lib/client.js） | 阶段 |
|---|------|----------------------|------|
| 1 | 新增 `capsuleBlurRow()`（美化面板内的胶囊模糊行） | 模块级，靠近 `buildAppearanceBlock` 原位置或 `SLIDERS` 之后 | P1 |
| 2 | 「滤镜」区渲染：模糊行之后插入胶囊模糊行 | `renderPanelInto` 内滤镜循环（~L1332-1337） | P1 |
| 3 | 删除 `buildAppearanceBlock` 及其调用 | ~L1744-1774、`buildListView`（~L1778） | P1 |
| 4 | 列表视图瘦身：目录+扫描收敛为「＋ 添加壁纸」弹层 | `buildListView`（~L1891-1939） | P2 |
| 5 | 美化编辑器抽屉化（覆盖层、ESC/关闭、与取景共存） | `SkinSettingsSection` / `buildBeautifyView`（~L1942-1973）+ `UI_CSS` | P2 |
| 6 | 壁纸卡片「美化」操作入口（选中态浮出） | `buildListView` 网格卡片（~L1789-1873） | P2 |
| 7 | （可选）分区更名「外观与壁纸」 | `settings.section` 注册（~L1976-1981） | P3 |

## 3. 详细设计

### 3.1 ★ 胶囊模糊并入美化编辑器（Phase 1 核心）

**3.1.1 数据边界（不可破坏的约束）**

| 项 | 胶囊模糊 | 壁纸模糊 |
|----|---------|---------|
| 语义 | 全局 UI 毛玻璃（左栏/顶栏/输入托盘） | 单张壁纸的滤镜效果 |
| 存储 | `localStorage['dsh-capsule-skin-blur']`（现有 key 不变） | `LAB_STORAGE_KEY` 按 `currentSkinId` 分键 |
| 运行时 | 模块级 `currentBlur` + `applyBlur(px)`（CSS 变量等比缩放） | `settings` + `applyAll()`（美化层） |
| 生命周期 | 启动时 `loadBlur()` 一次（~L1718-1719 不变） | 随壁纸切换 `reloadSkinSettings()` |

**胶囊模糊行不得**：
- 写入 `ui.sliderRefs`（否则 `refreshControls` 会用 `settings['capsuleBlur']=undefined` 覆盖它的值显示）；
- 写入 `settings` / 调用 `scheduleSave()`（否则会进 LAB 存储、按壁纸分键、被预设污染）；
- 被预设 chips / 「↺ 重置」影响（预设与重置只作用于 LAB 壁纸效果）。

**3.1.2 新增 `capsuleBlurRow()`（模块级函数，与 sliderRow 同风格）**

```
function capsuleBlurRow() {
  // 结构：div.wpl-row > [span.wpl-label「胶囊模糊」+ 小字badge「全局」, input.wpl-range, span.wpl-val]
  // 初始化：input.min=BLUR_MIN(0) max=BLUR_MAX(40) step=1, value=currentBlur, val=currentBlur+'px'
  // input 事件：
  //   currentBlur = Number(input.value)
  //   val.textContent = currentBlur + 'px'
  //   applyBlur(currentBlur)                          // 实时联动 CSS 变量
  //   localStorage.setItem(BLUR_STORAGE_KEY, ...)     // 直接写全局 key
  // 行下 .wpl-note：'胶囊毛玻璃全局联动（左栏/顶栏/输入托盘）· 0px = 无模糊 · 默认 16px'
  // 不注册 ui.sliderRefs；不触碰 settings/preset
}
```

复用现有 `wpl-row/wpl-label/wpl-range/wpl-val/wpl-note` 类，零新增 CSS（可选加一个 `.wpl-badge` 小标签样式，非必需）。

**3.1.3 「滤镜」区插入点（renderPanelInto ~L1332-1337）**

现状：
```js
const secFilter = ...; secFilter.textContent = '滤镜'; container.appendChild(secFilter);
for (const key of FILTER_KEYS) container.appendChild(sliderRow(key));
```
改为：
```js
for (const key of FILTER_KEYS) {
  const row = sliderRow(key);
  container.appendChild(row);
  if (key === 'blur') container.appendChild(capsuleBlurRow());  // 紧跟壁纸模糊
}
```
效果：滤镜区顺序 = 模糊 → **胶囊模糊** → 亮度 → 对比度 → …，与用户要求"放在壁纸模糊的旁边"完全一致。

**3.1.4 删除「外观」分组**

- 删除 `buildAppearanceBlock`（~L1744-1774）整函数；
- `buildListView` 首行 `buildAppearanceBlock(container)`（~L1778）删除；
- 启动时的 `currentBlur = loadBlur(); applyBlur(currentBlur);`（~L1718-1719）**保留**（模块级状态初始化，与 UI 位置无关）；
- 缩略图 `--dsh-thumb-blur`（~L1798）继续读 `currentBlur`，不变；
- `apply()` 清理逻辑（~L2001 移除 CSS 变量）不变。

### 3.2 列表视图瘦身（Phase 2）

- 主干只剩「壁纸」分组：网格 + 卡片操作。
- 「壁纸目录」输入框 + 保存 + 「🔄 扫描新壁纸」三块（~L1891-1939）收敛为一行按钮「＋ 添加壁纸」：
  - 点击弹出**弹层**（复刻现有目录输入/保存/扫描逻辑，搬进弹层容器）；
  - 弹层保留「关闭」；扫描完成提示改为弹层内联状态（不再"重新打开本页可见"），成功后刷新网格；
  - 行为参照 Windows「浏览照片」/macOS「＋ 添加」——源管理是壁纸选择器层的次级入口。

### 3.3 美化编辑器抽屉化（Phase 2）

- `SkinSettingsSection` 去掉 `beautify` state 视图切换（~L1961-1973）；
- 美化面板改为**覆盖层**：定位在设置页内容区内右侧滑出（或全屏遮罩 + 居中面板），
  头部「🎨 壁纸美化」+ 「✕」关闭（`onClose` 语义从"切回列表"变为"关闭抽屉"）；
- 打开入口：壁纸卡片选中态浮出的「🎨 美化」按钮（§3.4）与「＋ 添加壁纸」互斥；
- 与取景交互：关闭抽屉 / ESC 时调用 `lab.exitFraming()`（现状已具备，~L1886/1950 保留该调用）；
- 注意 `UI_CSS` 中 `[data-capsule-skin-section][data-wpl-view="true"]` 的字体样式随视图切换机制移除而清理。

### 3.4 壁纸卡片「美化」操作（Phase 2）

- 网格卡片（~L1789-1873）在 hover / `data-active` 时显示「🎨 美化」按钮（与现有「✕ 删除」同风格，右下角/角标）；
- 点击 → 打开美化编辑器（作用于**该壁纸**：先 `applySkin(skin)` 再开抽屉，保证 `currentSkinId` 与所见一致）；
- 保留现状"点击卡片 = 应用 + 就地高亮"行为。

### 3.5 分区更名（Phase 3 可选）

- `label: () => "壁纸皮肤"` → `"外观与壁纸"`（贴合"个性化聚合"命名惯例；动文案即可，不影响 id/order）。

## 4. 数据与兼容性

- `dsh-capsule-skin-blur`、`dsh-wallpaper-lab-settings` 两个 localStorage key **均不变**，老用户设置无缝迁移；
- LAB settings 结构（`LAB_DEFAULTS`）**不新增字段**——胶囊模糊不进入壁纸参数；
- 每壁纸独立参数（`currentSkinId` 分键）语义不变；
- 服务端（`lib/index.js` 的 /skin-assets/* 路由）零改动。

## 5. 实施顺序与验收清单

### Phase 1（本次核心：胶囊模糊并入编辑器）
1. `git checkout feat/wallpaper-settings-restructure`
2. 新增 `capsuleBlurRow()`；改造滤镜循环插入点；删除 `buildAppearanceBlock` 及调用
3. 构建/验证（刷新 dsh web 设置页）

**P1 验收**：
- [ ] 设置 → 壁纸皮肤 → 美化，「滤镜」区第一行「模糊」下方紧邻出现「胶囊模糊（全局）」行
- [ ] 拖动胶囊模糊滑块：左栏/顶栏/输入托盘毛玻璃实时联动；值显示 `px`
- [ ] 刷新页面后胶囊模糊保持（读旧 key）
- [ ] 切换壁纸：壁纸模糊随壁纸变，胶囊模糊不变（两者互不污染）
- [ ] 点任意预设 / 「↺ 重置」：胶囊模糊滑块值不动
- [ ] 列表视图不再有「外观」分组；启动加载、缩略图预览模糊正常
- [ ] 清空胶囊模糊存储（localStorage 删除 key）→ 回默认 16px（`loadBlur` 判空逻辑仍在）

### Phase 2（抽屉 + 添加壁纸收敛）
- [ ] 设置页主干无二级视图切换；美化以覆盖层开合
- [ ] 卡片「美化」作用于对应壁纸；关闭抽屉不残留取景遮罩
- [ ] 「＋ 添加壁纸」弹层：目录保存/扫描/关闭均正常；扫描成功后网格即时刷新
### Phase 3（可选）
- [ ] 分区更名「外观与壁纸」，导航/路由不受影响

## 6. 风险与回滚

| 风险 | 缓解 |
|------|------|
| 胶囊模糊误入 LAB 存储/被预设重置 | 3.1.1 数据边界约束 + P1 验收第 4/5 条强制检查 |
| 删除外观块后 `currentBlur` 失去初始化 | 启动加载逻辑保留于 apply()（3.1.4） |
| 抽屉与取景全屏遮罩冲突 | 关闭路径统一走 `exitFraming()`（现状逻辑复用） |
| 老用户设置丢失 | key 不变 + LAB 结构不变（§4） |

回滚：`git revert` 对应 commit 即可，改动集中在 `lib/client.js` 单文件。
