# dsh-capsule-skin

DeepSeek Harness (dsh) Web UI 壁纸皮肤插件：**胶囊侧边栏 · 暗色主题 · 壁纸主题色取色 · 热切换/热添加**

- 左侧边栏控件全部胶囊化（大圆角 / 毛玻璃 / 高光阴影）
- 项目胶囊物理包含会话胶囊（大胶囊包小胶囊）
- 壁纸作为界面背景，主题色由壁纸自动提取（Google Material You 同款取色管线）
- 热切换：点侧边栏「🖼 壁纸皮肤」按钮，缩略图列表点选即换
- 热添加：往壁纸目录放新图 → 点「🔄 扫描新壁纸」→ 刷新列表，**无需重启 dsh web**
- 壁纸目录在 WebUI 内配置，**无需改任何文件/环境变量**
- 支持 **Windows / macOS** 双平台（见下方分平台说明）

---

## 安装

### Windows

```sh
# 从 GitHub 安装
dsh plugin --profile web add github:DawnCloud1213/dsh-capsule-skin

# 或本地目录（开发调试）
dsh plugin --profile web add file:C:/path/to/dsh-capsule-skin
```

装完重启 `dsh web`，浏览器强刷 **Ctrl+Shift+R**。

### macOS

```sh
# 从 GitHub 安装
dsh plugin --profile web add github:DawnCloud1213/dsh-capsule-skin

# 或本地目录（开发调试）
dsh plugin --profile web add file:/path/to/dsh-capsule-skin
```

装完重启 `dsh web`，浏览器强刷 **Cmd+Shift+R**。

> 插件会自动适配平台：Windows 默认 `python` 命令 + `D:\Wallpaper` 目录；macOS/Linux 默认 `python3` 命令 + `~/Pictures` 目录。目录可在 WebUI 里随时改。

---

## 快速上手（双平台一致）

1. 重启 dsh web 后，侧边栏底部出现 **「🖼 壁纸皮肤」** 按钮
2. 点击弹出壁纸列表 + 设置区
3. 在 **「📁 壁纸目录」** 输入框填你的壁纸文件夹（默认已按平台填好），点 **「保存目录」**
4. 点 **「🔄 扫描新壁纸」**，等待处理完成
5. 重新打开列表，新壁纸出现（带缩略图），**点选即切换**，选择自动记忆（localStorage）

---

## 添加壁纸

**方式一：WebUI 一键扫描（推荐，双平台）**
1. 打开「🖼 壁纸皮肤」浮层
2. 「📁 壁纸目录」填你的壁纸文件夹（Windows 例：`D:\Wallpaper`；macOS 例：`/Users/你/Pictures` 或 `~/壁纸`），点「保存目录」
3. 点「🔄 扫描新壁纸」，等提示完成后重新打开列表即见

**方式二：命令行手动生成（开发/进阶）**
```sh
python3 scripts/gen_skin.py "/Users/你/Pictures/任意壁纸.jpg"     # macOS
python  scripts/gen_skin.py "D:\任意壁纸.jpg"                     # Windows
```
刷新浏览器页面即可见。

---

## 依赖与注意事项

### 扫描功能需要 Python

「扫描新壁纸」依赖 Python 3.10+ 和取色库（**仅扫描功能需要；皮肤框架/切换/内置壁纸不需要**）：

```sh
# Windows
pip install material-color-utilities -i https://pypi.tuna.tsinghua.edu.cn/simple

# macOS
pip3 install material-color-utilities
```

如果 Python 命令不在 PATH，可设 `DSH_SKIN_PYTHON` 指定（如 `/usr/local/bin/python3`）。

### 常见问题

| 现象 | 处理 |
|---|---|
| 装完没有「壁纸皮肤」按钮 | 重启 dsh web + 浏览器强刷（组合层变更不热更新） |
| 点「扫描新壁纸」提示失败 | 检查 Python 依赖是否装好；目录是否存在 |
| 壁纸切换后文字看不清 | 壁纸过亮时建议换暗色系壁纸；或降低壁纸目录里的亮度 |
| 卸载插件 | `dsh plugin --profile web remove @dawn/dsh-capsule-skin`，重启即还原 |

### 其他

- 插件为暗色主题定位（`overrideTokens` 强制暗色板）
- 仓库不内置壁纸素材（版权考虑），装完是空框架，按上文添加自己的壁纸
- dsh 仍在快速迭代（0.1.x RC），升级 dsh 后如遇异常请重新安装插件

---

## 开发

```sh
# 壁纸 → 皮肤数据（生成 assets/<name>/ + 更新清单）
python scripts/gen_skin.py <壁纸路径> [皮肤名]

# 批量扫描壁纸目录
python scripts/gen_skin.py --scan <壁纸目录>
```

### 架构

```
dsh-capsule-skin/
├── package.json        # dsh.bundle.patch + dsh.client 声明（npm 包即插件）
├── cordis.patch.yml    # 注册 capsule-skin 到 web profile
├── lib/
│   ├── index.js        # host 半：/skin-assets 资源路由 + config API + scan API（防路径穿越）
│   └── client.js       # 浏览器半：皮肤应用（overrideTokens）+ 切换浮层 + 目录配置 + 扫描按钮
├── assets/
│   ├── skins.json      # 壁纸清单（热添加：文件更新 → 刷新页面即见）
│   └── <壁纸名>/       # 每张壁纸一套（bg.jpg + skin.json）
└── scripts/gen_skin.py # 壁纸→MCU取色→token表+背景帧→清单（幂等）
```

## 已知限制

- 颜色变量覆盖走 `ctx.theme.overrideTokens`（rc.6 官方接口），明暗同为暗色板（插件定位暗色主题）
- macOS 已做平台适配但尚未真机全量验证；如遇问题欢迎提 issue（附报错/截图）

---

## 贡献者

- [DawnCloud1213](https://github.com/DawnCloud1213) — 项目维护者
- [MollyRy](https://github.com/MollyRy) — wallpaper-lab 实时壁纸美化层（滤镜 / 氛围 / 色调 / 水印 / 取景）

---

## 壁纸美化（wallpaper-lab）

在壁纸之上叠加**实时美化层**，全部在浏览器内即时生效，无需重新生成图片：

- **滤镜**：模糊 / 亮度 / 对比度 / 饱和度 / 灰度 / 复古（sepia）/ 色相
- **氛围**：压暗（遮罩）/ 暗角（vignette）/ 颗粒（胶片噪点）
- **色调**：任意颜色叠加层 + 强度
- **文字水印**：文字内容、字体（11 种）、字号、透明度、位置（6 方位）、颜色
- **取景**：拖拽移动、滚轮缩放选择壁纸显示区域，可一键重置
- **一键预设**：原图 / 柔光 / 胶片 / 黑白 / 冷调 / 暖阳 / 暗夜
- 设置自动保存到 `localStorage`；自动跟随壁纸切换（与胶囊皮肤联动）

入口：左下角「🖼 壁纸皮肤」浮层内点「🎨 壁纸美化」进入美化视图（与皮肤列表共用同一浮层容器）。
