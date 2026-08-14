# dsh-capsule-skin

DeepSeek Harness (dsh) Web UI 壁纸皮肤插件：**胶囊侧边栏 · 暗色主题 · 壁纸主题色取色 · 热切换/热添加**

- 左侧边栏控件全部胶囊化（大圆角 / 毛玻璃 / 高光阴影）
- 项目胶囊物理包含会话胶囊（大胶囊包小胶囊）
- 壁纸作为界面背景，主题色由壁纸自动提取（Google Material You 同款取色管线）
- 热切换：点侧边栏「🖼 壁纸皮肤」按钮，缩略图列表点选即换
- 热添加：往壁纸目录放新图 → 点「🔄 扫描新壁纸」→ 刷新列表，**无需重启 dsh web**

## 安装

```sh
# 方式一：从 GitHub 仓库（推荐，含内置壁纸）
dsh plugin --profile web add github:<你的用户名>/dsh-capsule-skin

# 方式二：本地目录（开发调试）
dsh plugin --profile web add file:C:/path/to/dsh-capsule-skin
```

装完**重启 dsh web**（`dsh web`），浏览器强刷（Ctrl+Shift+R）。

## 使用

1. 重启后侧边栏底部出现「🖼 壁纸皮肤」按钮
2. 点击弹出壁纸列表（内置壁纸 + 你的壁纸），点选即切换，选择自动记忆
3. 「🔄 扫描新壁纸」：扫描壁纸目录（默认 `D:\Wallpaper`）中未处理过的图片，自动生成皮肤

### 自定义壁纸目录

设置环境变量 `DSH_SKIN_WALLPAPER_DIR` 指向你的壁纸文件夹，再点「扫描新壁纸」：

```sh
# Windows（临时）
set DSH_SKIN_WALLPAPER_DIR=E:\my-wallpapers
dsh web
```

> 扫描依赖 Python 3.10+ 和 `material-color-utilities`：
> ```sh
> pip install material-color-utilities -i https://pypi.tuna.tsinghua.edu.cn/simple
> ```
> 可用 `DSH_SKIN_PYTHON` 指定 Python 可执行文件。

## 开发

```sh
# 壁纸 → 皮肤数据（生成 assets/<name>/ + 更新清单）
python scripts/gen_skin.py <壁纸路径> [皮肤名]

# 批量扫描壁纸目录
python scripts/gen_skin.py --scan D:\Wallpaper
```

### 架构

```
dsh-capsule-skin/
├── package.json        # dsh.bundle.patch + dsh.client 声明（npm 包即插件）
├── cordis.patch.yml    # 注册 capsule-skin 到 web profile
├── lib/
│   ├── index.js        # host 半：/skin-assets 资源路由（热添加核心，含防路径穿越）
│   └── client.js       # 浏览器半：皮肤应用（overrideTokens）+ 切换浮层 + 扫描按钮
├── assets/
│   ├── skins.json      # 壁纸清单（热添加：文件更新 → 刷新页面即见）
│   └── <壁纸名>/       # 每张壁纸一套（bg.jpg + skin.json）
└── scripts/gen_skin.py # 壁纸→MCU取色→token表+背景帧→清单（幂等）
```

## 已知限制

- 颜色变量覆盖走 `ctx.theme.overrideTokens`（rc.6 官方接口），明暗同为暗色板（插件定位暗色主题）
- 内置壁纸为作者自用素材，发布前请替换为你自己的壁纸资源
