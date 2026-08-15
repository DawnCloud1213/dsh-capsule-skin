// dsh-capsule-skin — 壁纸皮肤（胶囊侧边栏 · 暗色 · 主题色取色 · 热切换/热添加）+ 壁纸美化（wallpaper-lab 已并入主模块）
// 皮肤数据通过 /skin-assets/skins.json 动态加载：加壁纸 = 生成数据文件 → 刷新页面即可
// 壁纸美化：滤镜（模糊/亮度/对比度/饱和度/灰度/复古/色相）+ 压暗 + 暗角 + 色调 + 颗粒 + 文字水印 + 取景，
// 入口在「🖼 壁纸皮肤」浮层内的「🎨 壁纸美化」视图；设置保存在 localStorage，刷新页面后保持。
window.__ModuleLoader__.load({
  id: "@dawn/dsh-capsule-skin",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

const STORAGE_KEY = 'dsh-capsule-skin-active';

// 胶囊样式（静态部分，作用域 body[data-ds-skin]）
const SKIN_CSS = `
body[data-ds-skin="capsule"] {
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}
body[data-ds-skin="capsule"] [class*="sidebarCol"] {
  background: transparent !important;
}
body[data-ds-skin="capsule"] [class*="frame"],
body[data-ds-skin="capsule"] [class*="frame"] [class*="root"] {
  background: transparent !important;
}
/* 注意：centerCol 不能带 backdrop-filter——它会成为 backdrop root，
   导致其内部（输入托盘等）的 backdrop-filter 无法模糊滚动层内容 */
body[data-ds-skin="capsule"] [class*="centerCol"],
body[data-ds-skin="capsule"] [class*="detailsCol"] {
  background: rgba(0, 0, 0, 0.08) !important;
}
body[data-ds-skin="capsule"] [class*="sidebarCol"] button,
body[data-ds-skin="capsule"] [class*="sidebarCol"] [role="treeitem"],
body[data-ds-skin="capsule"] [class*="sidebarCol"] input,
body[data-ds-skin="capsule"] [class*="sidebarCol"] [class*="search"] {
  border-radius: 14px !important;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgb(46, 48, 58)) 62%, transparent) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgb(192, 194, 210)) 12%, transparent) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    0 2px 10px rgba(0, 0, 0, 0.35) !important;
  transition: all 0.18s cubic-bezier(.4, 0, .2, 1) !important;
}
body[data-ds-skin="capsule"] [class*="sidebarCol"] button:hover,
body[data-ds-skin="capsule"] [class*="sidebarCol"] [role="treeitem"]:hover {
  background: color-mix(in srgb, var(--dsw-alias-interactive-hover, rgb(176, 192, 255)) 22%, transparent) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 4px 16px rgba(0, 0, 0, 0.45) !important;
}
body[data-ds-skin="capsule"] [class*="sidebarCol"] [aria-selected="true"],
body[data-ds-skin="capsule"] [class*="sidebarCol"] [data-selected] {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, rgb(238, 239, 255)) 16%, transparent) !important;
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, rgb(238, 239, 255)) 45%, transparent) !important;
}
/* ── 层级：项目组容器 = 大胶囊，物理包含项目行 + 会话行 ── */
body[data-ds-skin="capsule"] [class*="sidebarCol"] [class*="groupSection"]:has([class*="projectRow"]) {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgb(46, 48, 58)) 45%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgb(192, 194, 210)) 12%, transparent) !important;
  border-radius: 18px !important;
  margin: 4px 8px 10px !important;
  padding: 8px !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 2px 12px rgba(0, 0, 0, 0.25) !important;
}
/* 项目行：容器内顶部标题胶囊 */
body[data-ds-skin="capsule"] [class*="sidebarCol"] [role="treeitem"][class*="projectRow"] {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1, rgb(29, 31, 41)) 55%, transparent) !important;
  border-radius: 12px !important;
  margin: 0 0 6px !important;
  padding: 6px 12px !important;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgb(192, 194, 210)) 10%, transparent) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07) !important;
}
/* 会话行：容器内的小胶囊（缩进 + 浅色） */
body[data-ds-skin="capsule"] [class*="sidebarCol"] [role="treeitem"][class*="sessionRow"] {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, rgb(238, 239, 255)) 8%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary, rgb(238, 239, 255)) 6%, transparent) !important;
  border-radius: 10px !important;
  margin: 2px 8px 2px 14px !important;
  padding: 5px 10px !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04) !important;
}
body[data-ds-skin="capsule"] [class*="sidebarCol"] [role="treeitem"][class*="sessionRow"][class*="selected"],
body[data-ds-skin="capsule"] [class*="sidebarCol"] [role="treeitem"][class*="sessionRow"][aria-selected="true"] {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, rgb(238, 239, 255)) 16%, transparent) !important;
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, rgb(238, 239, 255)) 40%, transparent) !important;
}
/* ── 对话气泡：暗色底 + 白字 ── */
body[data-ds-skin="capsule"] [class*="centerCol"] [class*="bubble"] {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgb(46, 48, 58)) 68%, transparent) !important;
  color: #ffffff !important;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgb(192, 194, 210)) 12%, transparent) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
}
/* AI 文本直接铺背景时加轻微暗罩保可读 */
body[data-ds-skin="capsule"] [class*="centerCol"] [class*="turn"] [class*="text"],
body[data-ds-skin="capsule"] [class*="centerCol"] [class*="assistant"] [class*="content"] {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}
/* ── Markdown 代码底衬：浅色底 + 白字不可读 → 主题色毛玻璃药丸 ── */
/* 行内代码：主题色半透明药丸 */
body[data-ds-skin="capsule"] [class*="centerCol"] [class*="_markdown_"] :not(pre) > code {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgb(40, 42, 52)) 62%, transparent) !important;
  color: var(--dsw-alias-label-primary, #ffffff) !important;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgb(192, 194, 210)) 28%, transparent) !important;
  border-radius: 999px !important;
  padding: 1px 8px !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
}
/* 代码块：主题色毛玻璃面板（胶囊圆角） */
body[data-ds-skin="capsule"] [class*="centerCol"] [class*="md-code-block"] {
  --dsl-code-block-border-radius: 14px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1, rgb(24, 26, 34)) 78%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgb(192, 194, 210)) 20%, transparent) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 4px 20px rgba(0, 0, 0, 0.35) !important;
}
body[data-ds-skin="capsule"] [class*="centerCol"] [class*="md-code-block"] pre {
  background: transparent !important;
}
body[data-ds-skin="capsule"] [class*="centerCol"] [class*="md-code-block"] [class*="banner"] {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgb(40, 42, 52)) 55%, transparent) !important;
}
/* 输入区「命令」加号按钮：浅色底 + 白色图标 → 主题色胶囊 */
body[data-ds-skin="capsule"] [class*="composerSeat"] button[class$="_add"] {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgb(40, 42, 52)) 60%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgb(192, 194, 210)) 25%, transparent) !important;
  color: var(--dsw-alias-label-primary, #ffffff) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
}
/* 「加载更早」历史按钮：浅色底 + 白字 → 主题色胶囊 */
body[data-ds-skin="capsule"] [data-chat-flow] [class*="_older"] button {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgb(40, 42, 52)) 60%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgb(192, 194, 210)) 25%, transparent) !important;
  color: var(--dsw-alias-label-primary, #ffffff) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
}
/* ── 输入区：外层胶囊托盘 + 内层输入胶囊（大包小 · 材质分级 · 12px 呼吸区） ── */
body[data-ds-skin="capsule"] [class*="composerSeat"] {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
/* 外层托盘：轻材质，统一 12px 内衬——内层不贴边、上下节奏一致。
   强模糊（24px+saturate）：对下层滚动的对话内容做真正的毛玻璃处理 */
body[data-ds-skin="capsule"] [class*="centerCol"] [class*="card"]:has(textarea) {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1, rgb(29, 31, 41)) 45%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgb(192, 194, 210)) 14%, transparent) !important;
  border-radius: 22px !important;
  padding: 12px !important;
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.30) !important;
}
/* 输入区文字渲染架构：dsh 由 backdrop 层渲染可见文字（textarea 文字透明，
   只负责输入/光标），mirror 测量高度。药丸视觉必须放在 backdrop 上，
   否则 textarea 自绘文字与 backdrop 文字叠成两行（一明一淡）。 */
/* backdrop = 可见文字层 + 药丸视觉（背景/描边/模糊/高光） */
body[data-ds-skin="capsule"] [class*="composerSeat"] [class*="_backdrop"] {
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgb(46, 48, 58)) 62%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgb(192, 194, 210)) 12%, transparent) !important;
  border-radius: 14px !important;
  color: #ffffff !important;
  padding: 14px 14px !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
}
/* textarea：透明输入层——透明文字 + 透明背景，只保留光标；
   padding 与 backdrop 同步，保证光标与可见文字对齐 */
body[data-ds-skin="capsule"] [class*="composerSeat"] textarea {
  box-sizing: border-box !important;
  width: auto !important;
  height: auto !important;
  background: transparent !important;
  border: 1px solid transparent !important;
  color: transparent !important;
  padding: 14px 14px !important;
}
body[data-ds-skin="capsule"] [class*="composerSeat"] textarea::placeholder,
body[data-ds-skin="capsule"] [class*="composerSeat"] [contenteditable="true"]:empty::before {
  color: rgba(255, 255, 255, 0.45) !important;
}
/* 隐藏镜像 mirror 是输入区高度的真正驱动者（流内元素撑起 grow）：
   给它与 textarea 同步的上下 padding（上下各多 2px 保险防长文截断），
   grow → scroll → 外层托盘随之协同长高，提示词框完整展示、无内部滚动 */
body[data-ds-skin="capsule"] [class*="composerSeat"] [class*="_mirror"] {
  padding: 16px 14px 16px 14px !important;
}
/* 解除 grow/scroll 的高度锁定（336px 上限 + 动态写入的固定 height） */
body[data-ds-skin="capsule"] [class*="composerSeat"] [class*="_grow"],
body[data-ds-skin="capsule"] [class*="composerSeat"] [class*="_scroll"] {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}
/* ── 侧边栏装饰分隔线：融入主题 ── */
body[data-ds-skin="capsule"] [class*="sidebarCol"] * {
  border-color: color-mix(in srgb, var(--dsw-alias-border-l1, rgb(192, 194, 210)) 8%, transparent) !important;
}
/* 壁纸切换按钮 + 浮层 */
body[data-ds-skin="capsule"] [class*="sidebarCol"] [data-capsule-skin-btn] {
  margin: 6px 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
body[data-ds-skin="capsule"] [data-capsule-skin-picker] {
  position: fixed;
  left: 16px;
  bottom: 64px;
  width: 220px;
  max-height: 320px;
  overflow-y: auto;
  background: var(--dsw-adaptive-surface, color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgb(46, 48, 58)) 92%, transparent));
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgb(192, 194, 210)) 14%, transparent);
  box-shadow: var(--dsw-adaptive-shadow, 0 8px 30px rgba(0, 0, 0, 0.5));
  padding: 8px;
  z-index: 9999;
}
/* 壁纸美化视图：共用浮层容器，仅加宽（高度维持 max-height + overflow-y:auto） */
body[data-ds-skin="capsule"] [data-capsule-skin-picker][data-wpl-view="true"] {
  width: 272px;
}
body[data-ds-skin="capsule"] [data-capsule-skin-option] {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid transparent;
}
body[data-ds-skin="capsule"] [data-capsule-skin-option]:hover {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, rgb(238, 239, 255)) 10%, transparent);
}
body[data-ds-skin="capsule"] [data-capsule-skin-option][data-active="true"] {
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, rgb(238, 239, 255)) 40%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, rgb(238, 239, 255)) 8%, transparent);
}
body[data-ds-skin="capsule"] [data-capsule-skin-thumb] {
  width: 40px;
  height: 24px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgb(192, 194, 210)) 20%, transparent);
}
/* ── 自适应文字颜色（壁纸美化）：由 body[data-ds-adaptive-text] 驱动，
     按壁纸背景亮度覆盖默认 label 变量（dark=深底用浅字 / light=浅底用深字）。
     同时定义浮层表面变量：美化面板/皮肤浮层跟随模式（浅底→浅色表面+深字）。── */
body[data-ds-skin="capsule"][data-ds-adaptive-text="light"] {
  --dsw-alias-label-primary: rgb(20, 20, 24) !important;
  --dsw-alias-label-secondary: rgba(20, 20, 24, 0.72) !important;
  --dsw-adaptive-surface: rgba(250, 250, 252, 0.94);
  --dsw-adaptive-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
}
body[data-ds-skin="capsule"][data-ds-adaptive-text="dark"] {
  --dsw-alias-label-primary: rgb(245, 245, 248) !important;
  --dsw-alias-label-secondary: rgba(245, 245, 248, 0.72) !important;
  --dsw-adaptive-surface: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgb(46, 48, 58)) 92%, transparent);
  --dsw-adaptive-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}
`;

const inject = ["theme"];

// ════════════════════════════════════════════════════════════════
// 壁纸美化（原 dsh-wallpaper-lab）—— 常量与工具
// ════════════════════════════════════════════════════════════════
const LAB_STORAGE_KEY = 'dsh-wallpaper-lab-settings';

const LAB_DEFAULTS = {
  enabled: true,
  blur: 0,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  hue: 0,
  shade: 0,
  vignette: 0,
  tintColor: '#000000',
  tintOpacity: 0,
  grain: 0,
  bgZoom: 100,
  bgCx: 50,
  bgCy: 50,
  text: '',
  textSize: 28,
  textOpacity: 60,
  textPos: 'bottom-right',
  textColor: '#ffffff',
  textFont: 'system',
  preset: 'none',
  // 自适应文字颜色：按壁纸背景亮度自动切换深浅文字（WCAG 对比度）
  adaptiveText: true,
};

const LAB_PRESETS = {
  // 原图：补全所有滤镜默认值（应用后与原始壁纸完全一致）
  none:  { label: '原图', s: { blur: 0, brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0, hue: 0, shade: 0, vignette: 0, grain: 0, tintOpacity: 0 } },
  soft:  { label: '柔光', s: { blur: 2, brightness: 105, saturate: 110, vignette: 15 } },
  film:  { label: '胶片', s: { contrast: 115, saturate: 85, sepia: 18, vignette: 40, grain: 45 } },
  mono:  { label: '黑白', s: { grayscale: 100, contrast: 120, vignette: 35 } },
  cool:  { label: '冷调', s: { saturate: 90, hue: 8, brightness: 105, tintColor: '#a8c8ff', tintOpacity: 10 } },
  warm:  { label: '暖阳', s: { sepia: 25, saturate: 120, brightness: 108, tintColor: '#ffd9a0', tintOpacity: 10 } },
  night: { label: '暗夜', s: { brightness: 75, contrast: 110, shade: 35, blur: 1 } },
};

const TEXT_POS = {
  'top-left':      { top: '24px', left: '24px' },
  'top-right':     { top: '24px', right: '24px' },
  'bottom-left':   { bottom: '24px', left: '24px' },
  'bottom-right':  { bottom: '24px', right: '24px' },
  'center':        { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  'bottom-center': { bottom: '24px', left: '50%', transform: 'translateX(-50%)' },
};

// 水印字体选项：跨平台字体栈（macOS / Windows 均可用）
const FONTS = {
  'system':   { label: '系统默认', family: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif" },
  'pingfang': { label: '苹方', family: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif" },
  'song':     { label: '宋体', family: "'Songti SC', SimSun, 'Noto Serif CJK SC', serif" },
  'kai':      { label: '楷体', family: "'Kaiti SC', KaiTi, 'STKaiti', 'Noto Serif CJK SC', serif" },
  'xingkai':  { label: '行楷', family: "'Xingkai SC', 'STXingkai', 'Kaiti SC', cursive" },
  'hei':      { label: '黑体', family: "'Heiti SC', 'SimHei', 'Noto Sans CJK SC', sans-serif" },
  'yahei':    { label: '微软雅黑', family: "'Microsoft YaHei', 'PingFang SC', sans-serif" },
  'lishu':    { label: '隶书', family: "'LiSu', 'STLiti', serif" },
  'yuanti':   { label: '圆体', family: "'Yuanti SC', 'YouYuan', 'STYuanti-SC-Regular', sans-serif" },
  'serif':    { label: '衬线', family: "Georgia, 'Times New Roman', serif" },
  'mono':     { label: '等宽', family: "'SF Mono', Menlo, Consolas, monospace" },
};

const GRAIN_SVG = 'url("data:image/svg+xml;utf8,' + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>" +
  "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>" +
  "<feColorMatrix type='saturate' values='0'/></filter>" +
  "<rect width='160' height='160' filter='url(#n)' opacity='0.6'/></svg>"
) + '")';

// 滑杆元数据（单位/范围唯一来源：sliderRow 构建与 refreshControls 回显共用，避免两份映射漂移）
const SLIDERS = [
  ['blur', '模糊', 0, 30, 1, 'px'],
  ['brightness', '亮度', 30, 180, 1, '%'],
  ['contrast', '对比度', 50, 180, 1, '%'],
  ['saturate', '饱和度', 0, 250, 1, '%'],
  ['grayscale', '灰度', 0, 100, 1, '%'],
  ['sepia', '复古', 0, 100, 1, '%'],
  ['hue', '色相', 0, 360, 1, '°'],
  ['shade', '压暗', 0, 80, 1, '%'],
  ['vignette', '暗角', 0, 100, 1, '%'],
  ['grain', '颗粒', 0, 100, 1, ''],
  ['bgZoom', '缩放', 100, 400, 5, '%'],
  ['textSize', '字号', 12, 72, 1, 'px'],
  ['textOpacity', '透明度', 10, 100, 1, '%'],
];
const SLIDER_MAP = {};
for (const s of SLIDERS) SLIDER_MAP[s[0]] = s;
const SLIDER_UNIT = {};
for (const [key, , , , , unit] of SLIDERS) SLIDER_UNIT[key] = unit;
const FILTER_KEYS = ['blur', 'brightness', 'contrast', 'saturate', 'grayscale', 'sepia', 'hue'];
const MOOD_KEYS = ['shade', 'vignette', 'grain'];

const UI_CSS = `
[data-capsule-skin-picker][data-wpl-view="true"] {
  font: 13px/1.5 -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--dsw-alias-label-primary, #e8ecf4);
}
.wpl-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.wpl-title { font-weight: 700; font-size: 14px; flex: 1; }
.wpl-icon-btn {
  background: color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255, 255, 255)) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255, 255, 255)) 14%, transparent);
  color: var(--dsw-alias-label-primary, #e8ecf4); border-radius: 8px; padding: 2px 8px; cursor: pointer; font-size: 12px;
}
.wpl-icon-btn:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255, 255, 255)) 16%, transparent); }
.wpl-presets { display: flex; flex-wrap: wrap; gap: 6px; margin: 2px 0 10px; }
.wpl-chip {
  padding: 3px 10px; border-radius: 999px; font-size: 11px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255, 255, 255)) 14%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255, 255, 255)) 6%, transparent);
  color: var(--dsw-alias-label-primary, #dfe5f0); cursor: pointer; transition: background .12s ease;
}
.wpl-chip:hover { background: rgba(110, 168, 255, 0.2); }
.wpl-chip[data-active="true"] { background: rgba(110, 168, 255, 0.32); border-color: rgba(110, 168, 255, 0.7); color: var(--dsw-alias-label-primary, #fff); }
.wpl-sec {
  font-size: 11px; opacity: 0.6; margin: 12px 0 4px; letter-spacing: 1px;
  border-top: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255, 255, 255)) 10%, transparent); padding-top: 8px;
}
.wpl-row { display: flex; align-items: center; gap: 8px; margin: 6px 0; }
.wpl-label { width: 46px; font-size: 11px; opacity: 0.75; flex-shrink: 0; }
.wpl-range { flex: 1; accent-color: #6ea8ff; cursor: pointer; }
.wpl-val { width: 36px; text-align: right; font-size: 10px; opacity: 0.6; flex-shrink: 0; }
.wpl-text {
  width: 100%; box-sizing: border-box;
  background: color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255, 255, 255)) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255, 255, 255)) 16%, transparent);
  border-radius: 8px; color: var(--dsw-alias-label-primary, #fff);
  padding: 6px 8px; font-size: 12px; outline: none;
}
.wpl-text::placeholder { color: color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255, 255, 255)) 45%, transparent); }
.wpl-text:focus { border-color: rgba(110, 168, 255, 0.6); }
.wpl-select {
  background: color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255, 255, 255)) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255, 255, 255)) 16%, transparent);
  color: var(--dsw-alias-label-primary, #fff); border-radius: 8px; padding: 4px 6px; font-size: 12px; flex: 1;
}
.wpl-color { width: 34px; height: 24px; padding: 0; border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255, 255, 255)) 22%, transparent); border-radius: 6px; background: transparent; cursor: pointer; }
.wpl-foot { display: flex; align-items: center; gap: 10px; margin-top: 12px; padding-top: 10px; border-top: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255, 255, 255)) 10%, transparent); }
.wpl-toggle { display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; flex: 1; }
.wpl-toggle input { accent-color: #6ea8ff; }
.wpl-note { font-size: 10px; opacity: 0.45; margin-top: 8px; text-align: center; }
[data-wpl-frame] {
  position: fixed; inset: 0; z-index: 9998;
  display: none; cursor: grab; touch-action: none; user-select: none;
}
[data-wpl-frame][data-active="true"] { display: block; }
[data-wpl-frame][data-active="true"]:active { cursor: grabbing; }
[data-wpl-frame-rect] {
  position: absolute; border: 2px dashed rgba(110, 168, 255, 0.95);
  border-radius: 10px; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  pointer-events: none; box-sizing: border-box;
}
[data-wpl-frame-hint] {
  position: fixed; left: 50%; top: 12px; transform: translateX(-50%);
  background: rgba(18, 20, 28, 0.9); border: 1px solid rgba(110, 168, 255, 0.4);
  color: #fff; font-size: 12px; border-radius: 999px; padding: 4px 14px;
  pointer-events: none; white-space: nowrap;
}
.wpl-btn-block {
  width: 100%; background: rgba(110, 168, 255, 0.14);
  border: 1px solid rgba(110, 168, 255, 0.35); color: var(--dsw-alias-label-primary, #fff);
  border-radius: 8px; padding: 5px; font-size: 12px; cursor: pointer;
}
.wpl-btn-block:hover { background: rgba(110, 168, 255, 0.24); }
`;

// 逐 key 类型校验 + 范围 clamp：坏数据（类型错/越界）回退默认值，避免 hexToRgba 等下游抛错
let currentSkinId = null; // 当前壁纸 id：美化参数按壁纸独立存储（map[skinId]）

function loadSettings() {
  const out = { ...LAB_DEFAULTS };
  let raw = {};
  try {
    const parsed = JSON.parse(localStorage.getItem(LAB_STORAGE_KEY) || '{}');
    if (parsed && typeof parsed === 'object') {
      if ('enabled' in parsed) {
        // 旧版全局格式 → 迁移为当前皮肤专属（首次切换即生效）
        raw = parsed;
        try { localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify({ [currentSkinId || '_default']: parsed })); } catch (e) {}
      } else {
        // 新版 map 格式：每皮肤一份，无记录用全默认
        raw = parsed[currentSkinId] || {};
      }
    }
  } catch (e) { /* 损坏的 JSON → 全默认 */ }
  const clampNum = (v, min, max, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  };
  for (const [key, , min, max] of SLIDERS) {
    out[key] = clampNum(raw[key], min, max, LAB_DEFAULTS[key]);
  }
  out.bgCx = clampNum(raw.bgCx, 0, 100, LAB_DEFAULTS.bgCx);
  out.bgCy = clampNum(raw.bgCy, 0, 100, LAB_DEFAULTS.bgCy);
  out.enabled = typeof raw.enabled === 'boolean' ? raw.enabled : LAB_DEFAULTS.enabled;
  out.adaptiveText = typeof raw.adaptiveText === 'boolean' ? raw.adaptiveText : LAB_DEFAULTS.adaptiveText;
  if (typeof raw.text === 'string') out.text = raw.text;
  if (typeof raw.tintColor === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw.tintColor)) out.tintColor = raw.tintColor;
  if (typeof raw.textColor === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw.textColor)) out.textColor = raw.textColor;
  if (TEXT_POS[raw.textPos]) out.textPos = raw.textPos;
  if (FONTS[raw.textFont]) out.textFont = raw.textFont;
  if (raw.preset === 'custom' || LAB_PRESETS[raw.preset]) out.preset = raw.preset;
  return out;
}

function saveSettings(s, sid) {
  try {
    const parsed = JSON.parse(localStorage.getItem(LAB_STORAGE_KEY) || '{}');
    const map = parsed && typeof parsed === 'object' && !('enabled' in parsed) ? parsed : {};
    map[sid || currentSkinId || '_default'] = s;
    localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

function currentBgUrl() {
  const css = document.body.style && document.body.style.backgroundImage;
  if (css && css !== 'none') {
    const m = /url\(["']?([^"')]+)["']?\)/.exec(css);
    if (m) return m[1];
  }
  return null;
}

function hexToRgba(hex, a) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const num = parseInt(n, 16);
  if (Number.isNaN(num)) return 'rgba(0,0,0,' + a + ')';
  return 'rgba(' + ((num >> 16) & 255) + ',' + ((num >> 8) & 255) + ',' + (num & 255) + ',' + a + ')';
}

// ════════════════════════════════════════════════════════════════
// 自适应文字颜色 —— WCAG 对比度计算
// 相对亮度（WCAG 2.x，https://www.w3.org/TR/WCAG21/#dfn-relative-luminance）：
//   1) 每个 sRGB 通道 c ∈ [0,1]（先除以 255）做线性化：
//        c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ^ 2.4
//   2) L = 0.2126·R + 0.7152·G + 0.0722·B
// 对比度（WCAG 2.x）：(L1 + 0.05) / (L2 + 0.05)，L1 为较亮者；正文 AA 要求 >= 4.5:1。
// 深色文字 rgb(20,20,24) 的 L≈0.007：背景 L >= 0.207 时对比度 >= 4.5:1；
// 浅色文字 rgb(245,245,248) 的 L≈0.913：背景 L <= 0.183 时对比度 >= 4.5:1。
// 阈值取 0.25（WCAG 线性亮度空间）：背景 L > 0.25 用深色文字（对比度 > 5:1），
// <= 0.25 用浅色文字。注意阈值作用于 LINEARIZED luminance——浅灰(171/255=0.67)
// 线性化后仅 0.408，若阈值 0.5 会误判为深底（白字白底不可读）。
const TEXT_LUM_THRESHOLD = 0.25;
const ADAPTIVE_TEXT_COLORS = {
  light: { primary: 'rgb(20, 20, 24)', secondary: 'rgba(20, 20, 24, 0.72)' },      // 浅底 → 深字
  dark:  { primary: 'rgb(245, 245, 248)', secondary: 'rgba(245, 245, 248, 0.72)' }, // 深底 → 浅字
};

// 解析 CSS 颜色字符串（#rgb/#rrggbb/rgb()/rgba()）→ {r,g,b}；无法解析返回 null
function parseColor(str) {
  if (typeof str !== 'string') return null;
  const s = str.trim();
  if (!s) return null;
  if (s.startsWith('#')) {
    const h = s.slice(1);
    if (!/^[0-9a-fA-F]{3,8}$/.test(h)) return null;
    const n = (h.length === 3 || h.length === 4) ? h.split('').map(c => c + c).join('') : h;
    const num = parseInt(n.slice(0, 6), 16);
    if (Number.isNaN(num)) return null;
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  const m = /^rgba?\(([^)]+)\)$/.exec(s);
  if (m) {
    const parts = m[1].split(',').map(v => parseFloat(v));
    if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) {
      return { r: parts[0], g: parts[1], b: parts[2] };
    }
  }
  return null;
}

// 相对亮度：入参 r/g/b ∈ [0,1]
function relativeLuminance(r, g, b) {
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// WCAG 对比度（L1/L2 为相对亮度）
function contrastRatio(l1, l2) {
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

// 按背景色亮度阈值选文字配色模式（'light' = 浅底深字 / 'dark' = 深底浅字）
function pickAdaptiveText(bgColor) {
  const L = relativeLuminance(bgColor.r / 255, bgColor.g / 255, bgColor.b / 255);
  const mode = L > TEXT_LUM_THRESHOLD ? 'light' : 'dark';
  return { mode, L, ...ADAPTIVE_TEXT_COLORS[mode] };
}

// 根据当前壁纸背景色计算并应用自适应文字颜色：
// 以 body[data-ds-adaptive-text] 驱动 SKIN_CSS 中的 CSS 变量规则
// （--dsw-alias-label-primary 主文字 / --dsw-alias-label-secondary 次级文字），
// 变量在 body 上声明、继承到整个 UI，覆盖 overrideTokens 的默认 label 值；
// 无背景色时移除属性 → 回退皮肤/暗色主题默认文字色。
function applyAdaptiveTextColor(bgColor) {
  const rgb = typeof bgColor === 'string' ? parseColor(bgColor) : bgColor;
  if (!rgb || !Number.isFinite(rgb.r) || !Number.isFinite(rgb.g) || !Number.isFinite(rgb.b)) {
    document.body.removeAttribute('data-ds-adaptive-text');
    return;
  }
  document.body.setAttribute('data-ds-adaptive-text', pickAdaptiveText(rgb).mode);
}

// 实时分析壁纸图片的平均亮度（canvas 采样 32x32）。
// 皮肤预生成的 tokens 可能恒为暗色板（深底浅字），无法反映浅色壁纸，
// 故自适应文字优先分析图片真实亮度；加载失败返回 null 由调用方回退 token。
function imageBrightness(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = 32; c.height = 32;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(img, 0, 0, 32, 32);
        const d = g.getImageData(0, 0, 32, 32).data;
        let r = 0, gg = 0, b = 0;
        for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; }
        const n = d.length / 4;
        resolve({ r: Math.round(r / n), g: Math.round(gg / n), b: Math.round(b / n) });
      } catch (e) { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// 估算美化层叠加后的"最终背景色"（亮度滤镜 / 压暗遮罩 / 色调叠加的近似合成），
// 供自适应文字在壁纸被调暗/染色后重新计算
function effectiveBgColor(base, settings) {
  if (!base) return null;
  let r = base.r, g = base.g, b = base.b;
  if (settings.enabled) {
    const k = Math.max(0, settings.brightness) / 100;          // 亮度滤镜：100% 不变
    r *= k; g *= k; b *= k;
    const s = Math.min(1, Math.max(0, settings.shade / 100));  // 压暗：黑色遮罩 alpha
    r *= 1 - s; g *= 1 - s; b *= 1 - s;
    const tint = parseColor(settings.tintColor);
    const a = Math.min(1, Math.max(0, settings.tintOpacity / 100)); // 色调叠加
    if (tint && a > 0) {
      r = r * (1 - a) + tint.r * a;
      g = g * (1 - a) + tint.g * a;
      b = b * (1 - a) + tint.b * a;
    }
  }
  const clamp = (v) => Math.min(255, Math.max(0, v));
  return { r: clamp(r), g: clamp(g), b: clamp(b) };
}

function applySkinTokens(ctx, skin, disposeOld) {
  if (disposeOld) { try { disposeOld(); } catch (e) {} }
  const pair = {};
  for (const [k, v] of Object.entries(skin.tokens || {})) {
    pair[k] = { light: v, dark: v };
  }
  // sidebar-fill 透明化：官方用它做 sidebar 底部实色背景（深酒红色带元凶）
  pair['--dsw-specific-sidebar-fill'] = { light: 'rgba(0,0,0,0)', dark: 'rgba(0,0,0,0)' };
  // markdown 代码底衬 token：皮肤未覆盖时会取浅色主题值 → 白字白底不可读，派生为主题色兜底
  const t = skin.tokens || {};
  const surface1 = t['--dsw-alias-bg-layer-1'] || t['--dsw-alias-bg-base'] || 'rgb(20, 22, 30)';
  const surface2 = t['--dsw-alias-bg-layer-2'] || surface1;
  pair['--dsw-alias-markdown-code-block'] = { light: surface1, dark: surface1 };
  pair['--dsw-alias-markdown-code-block-banner'] = { light: surface2, dark: surface2 };
  pair['--dsw-alias-markdown-inline-code'] = { light: surface2, dark: surface2 };
  return ctx.theme.overrideTokens('dsh-capsule-skin', pair);
}

// ════════════════════════════════════════════════════════════════
// 壁纸美化（原 dsh-wallpaper-lab）—— 工厂
//   mountLayers()     数据层（bg/shade/vignette/tint/grain/text/frame）挂 document.body
//   renderPanelInto() 美化面板控件渲染进指定容器（不再 fixed 悬浮）
//   refreshAdaptive() 重算自适应文字颜色（皮肤切换 / 美化层变化时调用）
//   dispose()         清理（MutationObserver / storage 监听 / 元素移除）
//   exitFraming()     关闭取景模式（避免全屏遮罩残留拦截点击）
// ════════════════════════════════════════════════════════════════
function createWallpaperLab(ctx, getBgColor) {
  let settings = loadSettings();
  const state = { bgUrl: null, fallbackTried: false, disposed: false };
  // 控件引用：每次 renderPanelInto 重建（美化视图可反复进出）
  const ui = { sliderRefs: {}, chipRefs: {} };
  let saveTimer = null;
  let styleEl = null;
  let mo = null;

  // ---------- 自适应文字颜色 ----------
  // 开关关 / 无背景色 → 移除属性回退默认；否则按"美化层合成后的背景色"重算。
  // 背景基色优先实时分析壁纸图片真实亮度（canvas 采样，避免 token 恒为暗色板
  // 导致浅色壁纸被误判为深底），图片不可用时回退皮肤 token 的 --dsw-alias-bg-base。
  async function refreshAdaptive() {
    if (state.disposed) return;
    if (!settings.adaptiveText) {
      document.body.removeAttribute('data-ds-adaptive-text');
      return;
    }
    const imgRgb = await imageBrightness(currentBgUrl());
    if (imgRgb) {
      applyAdaptiveTextColor(effectiveBgColor(imgRgb, settings));
      return;
    }
    const base = typeof getBgColor === 'function' ? getBgColor() : null;
    applyAdaptiveTextColor(effectiveBgColor(base, settings));
  }

  // 皮肤切换时调用：按当前壁纸重载独立参数 → 刷新美化层 / 面板控件 / 自适应文字
  function reloadSkinSettings() {
    if (state.disposed) return;
    settings = loadSettings();
    applyAll();
    refreshControls();
    refreshAdaptive();
  }

  // ---------- 层元素 ----------
  function makeLayer(attr) {
    const el = document.createElement('div');
    el.setAttribute(attr, '');
    el.style.cssText = 'position: fixed; inset: 0; z-index: -1; pointer-events: none;';
    return el;
  }
  const bgLayer = makeLayer('data-wpl-bg');
  bgLayer.style.inset = '-48px';
  bgLayer.style.backgroundSize = 'cover';
  bgLayer.style.backgroundPosition = 'center';
  const shadeLayer = makeLayer('data-wpl-shade');
  const vignetteLayer = makeLayer('data-wpl-vignette');
  const tintLayer = makeLayer('data-wpl-tint');
  const grainLayer = makeLayer('data-wpl-grain');
  const frameLayer = document.createElement('div');
  frameLayer.setAttribute('data-wpl-frame', '');
  const frameRect = document.createElement('div');
  frameRect.setAttribute('data-wpl-frame-rect', '');
  const frameHint = document.createElement('div');
  frameHint.setAttribute('data-wpl-frame-hint', '');
  frameHint.textContent = '拖拽移动取景 · 滚轮缩放 · 完成后关闭取景模式';
  frameLayer.append(frameRect, frameHint);
  const textLayer = document.createElement('div');
  textLayer.setAttribute('data-wpl-text', '');
  textLayer.style.cssText = 'position: fixed; z-index: 9996; pointer-events: none; user-select: none; white-space: nowrap; font-weight: 600; letter-spacing: 2px; text-shadow: 0 2px 10px rgba(0,0,0,.55); display: none;';

  // ---------- 持久化：滑杆/取景等连续操作防抖保存（约 120ms） ----------
  // 捕获保存时的皮肤 id 与 settings 快照：切换壁纸瞬间的挂起保存必须写回原壁纸
  // 的原参数（settings 是 let 变量，切换后被替换为新皮肤对象，直接引用会串参数）
  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    const sid = currentSkinId;
    const snap = { ...settings };
    saveTimer = setTimeout(() => { saveTimer = null; saveSettings(snap, sid); }, 120);
  }

  // ---------- 取景（选择壁纸显示区域） ----------
  function updateFrame() {
    const z = settings.bgZoom / 100;
    const size = Math.min(100 / z, 100);
    frameRect.style.width = size + '%';
    frameRect.style.height = size + '%';
    frameRect.style.left = settings.bgCx + '%';
    frameRect.style.top = settings.bgCy + '%';
    frameRect.style.transform = 'translate(-50%, -50%)';
  }

  function setFraming(on) {
    if (ui.frameToggleInput) ui.frameToggleInput.checked = !!on;
    frameLayer.setAttribute('data-active', on ? 'true' : 'false');
    if (on) updateFrame();
  }

  function moveFrameTo(e) {
    const r = frameLayer.getBoundingClientRect();
    settings.bgCx = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    settings.bgCy = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
    settings.preset = 'custom';
    updateFrame();
    applyBgTransform();
    scheduleSave();
  }

  frameLayer.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    frameLayer.setPointerCapture(e.pointerId);
    moveFrameTo(e);
    const move = (ev) => moveFrameTo(ev);
    const up = () => {
      frameLayer.removeEventListener('pointermove', move);
      frameLayer.removeEventListener('pointerup', up);
    };
    frameLayer.addEventListener('pointermove', move);
    frameLayer.addEventListener('pointerup', up);
  });
  frameLayer.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    settings.bgZoom = Math.min(400, Math.max(100, Math.round(settings.bgZoom * factor)));
    settings.preset = 'custom';
    updateFrame();
    applyBgTransform();
    const ref = ui.sliderRefs.bgZoom;
    if (ref) {
      ref.input.value = settings.bgZoom;
      ref.val.textContent = settings.bgZoom + (SLIDER_UNIT.bgZoom || '');
    }
    scheduleSave();
  }, { passive: false });

  // ---------- 渲染 ----------
  function applyBgTransform() {
    bgLayer.style.transform = 'scale(' + (settings.bgZoom / 100) + ')';
    bgLayer.style.transformOrigin = settings.bgCx + '% ' + settings.bgCy + '%';
  }

  function applyAll() {
    if (state.disposed) return;
    const on = settings.enabled;
    const base = on ? '' : 'none';
    [bgLayer, shadeLayer, vignetteLayer, tintLayer, grainLayer].forEach(el => {
      el.style.display = base;
    });
    textLayer.style.display = 'none';
    if (!on) {
      refreshAdaptive(); // 美化关闭：背景回到原壁纸，仍按皮肤底色重算
      return;
    }

    bgLayer.style.filter =
      'blur(' + settings.blur + 'px)' +
      ' brightness(' + settings.brightness + '%)' +
      ' contrast(' + settings.contrast + '%)' +
      ' saturate(' + settings.saturate + '%)' +
      ' grayscale(' + settings.grayscale + '%)' +
      ' sepia(' + settings.sepia + '%)' +
      ' hue-rotate(' + settings.hue + 'deg)';
    applyBgTransform();

    shadeLayer.style.background = 'rgba(0,0,0,' + (settings.shade / 100) + ')';

    const v = settings.vignette;
    vignetteLayer.style.background = v > 0
      ? 'radial-gradient(ellipse at center, rgba(0,0,0,0) ' + Math.max(30, 72 - v * 0.36) + '%, rgba(0,0,0,' + (v / 100) + ') 100%)'
      : 'none';

    if (settings.tintOpacity > 0) {
      tintLayer.style.background = hexToRgba(settings.tintColor, settings.tintOpacity / 100);
      tintLayer.style.display = '';
    } else {
      tintLayer.style.background = 'none';
    }

    if (settings.grain > 0) {
      grainLayer.style.backgroundImage = GRAIN_SVG;
      grainLayer.style.backgroundSize = '160px 160px';
      grainLayer.style.opacity = String((settings.grain / 100) * 0.35);
      grainLayer.style.display = '';
    } else {
      grainLayer.style.backgroundImage = 'none';
    }

    const text = settings.text.trim();
    if (text) {
      const pos = TEXT_POS[settings.textPos] || TEXT_POS['bottom-right'];
      textLayer.style.top = pos.top || '';
      textLayer.style.left = pos.left || '';
      textLayer.style.right = pos.right || '';
      textLayer.style.bottom = pos.bottom || '';
      textLayer.style.transform = pos.transform || '';
      textLayer.style.fontSize = settings.textSize + 'px';
      textLayer.style.fontFamily = (FONTS[settings.textFont] || FONTS.system).family;
      textLayer.style.color = settings.textColor;
      textLayer.style.opacity = String(settings.textOpacity / 100);
      textLayer.textContent = text;
      textLayer.style.display = '';
    }
    if (frameLayer.getAttribute('data-active') === 'true') updateFrame();
    refreshAdaptive(); // 美化层（亮度/压暗/色调等）可能改变背景观感 → 重算文字深浅
  }

  function applyPreset(id) {
    const p = LAB_PRESETS[id];
    if (!p) return;
    settings.preset = id;
    Object.assign(settings, p.s);
    refreshControls();
    applyAll();
    saveSettings(settings);
  }

  function refreshControls() {
    for (const [key, ref] of Object.entries(ui.sliderRefs)) {
      ref.input.value = settings[key];
      // 单位统一来自 SLIDERS 元数据
      ref.val.textContent = settings[key] + (SLIDER_UNIT[key] || '');
    }
    if (ui.tintColor) {
      ui.tintColor.value = settings.tintColor;
      ui.tintSlider.value = settings.tintOpacity;
      ui.tintVal.textContent = settings.tintOpacity + '%';
      ui.textInput.value = settings.text;
      ui.posSelect.value = TEXT_POS[settings.textPos] ? settings.textPos : 'bottom-right';
      ui.fontSelect.value = FONTS[settings.textFont] ? settings.textFont : 'system';
      ui.textColorInput.value = settings.textColor;
      ui.toggleInput.checked = settings.enabled;
      if (ui.adaptiveInput) ui.adaptiveInput.checked = settings.adaptiveText;
      for (const [id, chip] of Object.entries(ui.chipRefs)) {
        chip.setAttribute('data-active', settings.preset === id ? 'true' : 'false');
      }
    }
  }

  // 滑杆构建器：元数据（label/min/max/step/unit）全部取自 SLIDERS，唯一来源
  function sliderRow(key) {
    const meta = SLIDER_MAP[key];
    if (!meta) return null;
    const [k, label, min, max, step, unit] = meta;
    const row = document.createElement('div');
    row.className = 'wpl-row';
    const l = document.createElement('span');
    l.className = 'wpl-label';
    l.textContent = label;
    const input = document.createElement('input');
    input.type = 'range';
    input.className = 'wpl-range';
    input.min = min; input.max = max; input.step = step;
    input.addEventListener('input', () => {
      settings[k] = Number(input.value);
      settings.preset = 'custom';
      ui.sliderRefs[k].val.textContent = settings[k] + (unit || '');
      applyAll();
      scheduleSave();
    });
    const val = document.createElement('span');
    val.className = 'wpl-val';
    row.append(l, input, val);
    ui.sliderRefs[k] = { input, val };
    return row;
  }

  // 美化面板控件渲染进指定容器（调用方已清空容器；返回按钮由 picker 视图切换逻辑负责）
  function renderPanelInto(container) {
    // 头部
    const head = document.createElement('div');
    head.className = 'wpl-head';
    const title = document.createElement('span');
    title.className = 'wpl-title';
    title.textContent = '🎨 壁纸美化';
    const resetBtn = document.createElement('button');
    resetBtn.className = 'wpl-icon-btn';
    resetBtn.textContent = '↺ 重置';
    resetBtn.title = '恢复默认';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'wpl-icon-btn';
    closeBtn.textContent = '✕';
    head.append(title, resetBtn, closeBtn);
    container.appendChild(head);

    // 预设
    const chipsRow = document.createElement('div');
    chipsRow.className = 'wpl-presets';
    const chipRefs = {};
    for (const [id, p] of Object.entries(LAB_PRESETS)) {
      const chip = document.createElement('span');
      chip.className = 'wpl-chip';
      chip.textContent = p.label;
      chip.addEventListener('click', () => applyPreset(id));
      chipRefs[id] = chip;
      chipsRow.appendChild(chip);
    }
    container.appendChild(chipsRow);

    // 滤镜区
    const secFilter = document.createElement('div');
    secFilter.className = 'wpl-sec';
    secFilter.textContent = '滤镜';
    container.appendChild(secFilter);
    for (const key of FILTER_KEYS) container.appendChild(sliderRow(key));

    // 氛围区
    const secMood = document.createElement('div');
    secMood.className = 'wpl-sec';
    secMood.textContent = '氛围';
    container.appendChild(secMood);
    for (const key of MOOD_KEYS) container.appendChild(sliderRow(key));

    // 色调（颜色 + 强度）
    const tintRow = document.createElement('div');
    tintRow.className = 'wpl-row';
    const tintLabel = document.createElement('span');
    tintLabel.className = 'wpl-label';
    tintLabel.textContent = '色调';
    const tintColor = document.createElement('input');
    tintColor.type = 'color';
    tintColor.className = 'wpl-color';
    const tintSlider = document.createElement('input');
    tintSlider.type = 'range';
    tintSlider.className = 'wpl-range';
    tintSlider.min = 0; tintSlider.max = 60; tintSlider.step = 1;
    const tintVal = document.createElement('span');
    tintVal.className = 'wpl-val';
    tintColor.addEventListener('input', () => {
      settings.tintColor = tintColor.value;
      settings.preset = 'custom';
      applyAll(); saveSettings(settings);
    });
    tintSlider.addEventListener('input', () => {
      settings.tintOpacity = Number(tintSlider.value);
      settings.preset = 'custom';
      tintVal.textContent = settings.tintOpacity + '%';
      applyAll(); scheduleSave();
    });
    tintRow.append(tintLabel, tintColor, tintSlider, tintVal);
    container.appendChild(tintRow);

    // 取景区（选择壁纸显示区域）
    const secFraming = document.createElement('div');
    secFraming.className = 'wpl-sec';
    secFraming.textContent = '取景（选择壁纸显示区域）';
    container.appendChild(secFraming);

    const frameModeRow = document.createElement('div');
    frameModeRow.className = 'wpl-row';
    const frameModeLabel = document.createElement('span');
    frameModeLabel.className = 'wpl-label';
    frameModeLabel.textContent = '模式';
    const frameToggle = document.createElement('label');
    frameToggle.className = 'wpl-toggle';
    frameToggle.style.flex = '1';
    const frameToggleInput = document.createElement('input');
    frameToggleInput.type = 'checkbox';
    frameToggleInput.addEventListener('change', () => {
      setFraming(frameToggleInput.checked);
    });
    frameToggle.append(frameToggleInput, document.createTextNode('取景模式（拖拽·滚轮缩放）'));
    frameModeRow.append(frameModeLabel, frameToggle);
    container.appendChild(frameModeRow);

    container.appendChild(sliderRow('bgZoom'));

    const resetFrameBtn = document.createElement('button');
    resetFrameBtn.className = 'wpl-btn-block';
    resetFrameBtn.textContent = '↺ 重置取景（回到完整图片）';
    resetFrameBtn.addEventListener('click', () => {
      settings.bgCx = 50; settings.bgCy = 50; settings.bgZoom = 100;
      settings.preset = 'custom';
      refreshControls(); applyAll(); saveSettings(settings);
    });
    container.appendChild(resetFrameBtn);

    // 文字水印区
    const secText = document.createElement('div');
    secText.className = 'wpl-sec';
    secText.textContent = '文字水印';
    container.appendChild(secText);

    const textInput = document.createElement('input');
    textInput.className = 'wpl-text';
    textInput.placeholder = '输入水印文字（留空关闭）';
    textInput.addEventListener('input', () => {
      settings.text = textInput.value;
      settings.preset = 'custom';
      applyAll(); saveSettings(settings);
    });
    container.appendChild(textInput);

    const fontRow = document.createElement('div');
    fontRow.className = 'wpl-row';
    const fontLabel = document.createElement('span');
    fontLabel.className = 'wpl-label';
    fontLabel.textContent = '字体';
    const fontSelect = document.createElement('select');
    fontSelect.className = 'wpl-select';
    for (const [v, f] of Object.entries(FONTS)) {
      const o = document.createElement('option');
      o.value = v; o.textContent = f.label;
      fontSelect.appendChild(o);
    }
    fontSelect.addEventListener('change', () => {
      settings.textFont = FONTS[fontSelect.value] ? fontSelect.value : 'system';
      settings.preset = 'custom';
      applyAll(); saveSettings(settings);
    });
    fontRow.append(fontLabel, fontSelect);
    container.appendChild(fontRow);

    const posRow = document.createElement('div');
    posRow.className = 'wpl-row';
    const posLabel = document.createElement('span');
    posLabel.className = 'wpl-label';
    posLabel.textContent = '位置';
    const posSelect = document.createElement('select');
    posSelect.className = 'wpl-select';
    const posOpts = [
      ['top-left', '左上'], ['top-right', '右上'],
      ['bottom-left', '左下'], ['bottom-right', '右下'],
      ['center', '居中'], ['bottom-center', '底部居中'],
    ];
    for (const [v, l] of posOpts) {
      const o = document.createElement('option');
      o.value = v; o.textContent = l;
      posSelect.appendChild(o);
    }
    posSelect.addEventListener('change', () => {
      settings.textPos = posSelect.value;
      settings.preset = 'custom';
      applyAll(); saveSettings(settings);
    });
    const textColorInput = document.createElement('input');
    textColorInput.type = 'color';
    textColorInput.className = 'wpl-color';
    textColorInput.addEventListener('input', () => {
      settings.textColor = textColorInput.value;
      settings.preset = 'custom';
      applyAll(); saveSettings(settings);
    });
    posRow.append(posLabel, posSelect, textColorInput);
    container.appendChild(posRow);
    container.appendChild(sliderRow('textSize'));
    container.appendChild(sliderRow('textOpacity'));

    // 底部：启用开关 + 说明
    const foot = document.createElement('div');
    foot.className = 'wpl-foot';
    const toggle = document.createElement('label');
    toggle.className = 'wpl-toggle';
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.addEventListener('change', () => {
      settings.enabled = toggleInput.checked;
      if (!settings.enabled) setFraming(false); // 关闭美化时退出取景，避免全屏遮罩拦截点击
      applyAll(); saveSettings(settings);
    });
    toggle.append(toggleInput, document.createTextNode('启用美化'));
    foot.appendChild(toggle);
    // 自适应文字颜色开关（按壁纸亮度自动切换深浅文字，WCAG 对比度）
    const adaptiveToggle = document.createElement('label');
    adaptiveToggle.className = 'wpl-toggle';
    adaptiveToggle.title = '按壁纸背景亮度自动调整文字深浅（WCAG 对比度）';
    const adaptiveInput = document.createElement('input');
    adaptiveInput.type = 'checkbox';
    adaptiveInput.addEventListener('change', () => {
      settings.adaptiveText = adaptiveInput.checked;
      saveSettings(settings);
      refreshAdaptive();
    });
    adaptiveToggle.append(adaptiveInput, document.createTextNode('自适应文字'));
    foot.appendChild(adaptiveToggle);
    container.appendChild(foot);
    const note = document.createElement('div');
    note.className = 'wpl-note';
    note.textContent = '设置自动保存 · 跟随当前壁纸';
    container.appendChild(note);

    // 控件引用登记（refreshControls / setFraming 使用）
    ui.chipRefs = chipRefs;
    ui.tintColor = tintColor;
    ui.tintSlider = tintSlider;
    ui.tintVal = tintVal;
    ui.frameToggleInput = frameToggleInput;
    ui.textInput = textInput;
    ui.fontSelect = fontSelect;
    ui.posSelect = posSelect;
    ui.textColorInput = textColorInput;
    ui.toggleInput = toggleInput;
    ui.adaptiveInput = adaptiveInput;

    // 事件：重置 / 关闭（关闭 = 关掉整个浮层）
    resetBtn.addEventListener('click', () => {
      const keep = { enabled: settings.enabled };
      Object.assign(settings, LAB_DEFAULTS, keep);
      refreshControls();
      applyAll();
      saveSettings(settings);
    });
    closeBtn.addEventListener('click', () => {
      setFraming(false);
      container.remove();
    });

    refreshControls();
    applyAll();
  }

  // ---------- 背景同步：跟随 body 内联壁纸（胶囊皮肤切换自动跟随） ----------
  function syncBg() {
    if (state.disposed) return;
    const url = currentBgUrl();
    if (url && url !== state.bgUrl) {
      state.bgUrl = url;
      bgLayer.style.backgroundImage = 'url("' + url + '")';
    }
    if (!state.bgUrl) tryFallback();
  }

  function tryFallback() {
    if (state.fallbackTried) return;
    state.fallbackTried = true;
    fetch('/skin-assets/skins.json', { cache: 'no-store' })
      .then(r => r.json())
      .then(list => {
        if (state.disposed || currentBgUrl() || !list || !list.length) return;
        state.bgUrl = list[0].bg;
        bgLayer.style.backgroundImage = 'url("' + list[0].bg + '")';
      })
      .catch(() => {});
  }

  // ---------- 挂载 / 清理 ----------
  function mountLayers() {
    styleEl = document.createElement('style');
    styleEl.id = 'dsh-capsule-skin/wpl-style';
    styleEl.dataset.plugin = 'dsh-capsule-skin';
    styleEl.textContent = UI_CSS;
    document.head.appendChild(styleEl);
    document.body.append(bgLayer, shadeLayer, vignetteLayer, tintLayer, grainLayer, frameLayer, textLayer);
    mo = new MutationObserver(syncBg);
    mo.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    window.addEventListener('storage', syncBg);
    syncBg();
    applyAll();
  }

  function dispose() {
    state.disposed = true;
    if (mo) mo.disconnect();
    window.removeEventListener('storage', syncBg);
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; saveSettings(settings, currentSkinId); } // 冲刷未落盘的防抖保存（写回原皮肤）
    document.body.removeAttribute('data-ds-adaptive-text'); // 卸载时回退主题默认文字色
    if (styleEl) styleEl.remove();
    textLayer.remove();
    frameLayer.remove();
    grainLayer.remove();
    tintLayer.remove();
    vignetteLayer.remove();
    shadeLayer.remove();
    bgLayer.remove();
  }

  return {
    mountLayers,
    renderPanelInto,
    refreshAdaptive,
    reloadSkinSettings,
    dispose,
    exitFraming: () => setFraming(false),
  };
}

function buildPicker(container, skins, activeId, onPick, lab) {
  const old = container.querySelector('[data-capsule-skin-picker]');
  if (old) old.remove();
  const picker = document.createElement('div');
  picker.setAttribute('data-capsule-skin-picker', '');
  // 顶部入口：壁纸美化视图（与皮肤列表共用同一浮层容器）
  const labEntry = document.createElement('div');
  labEntry.setAttribute('data-capsule-skin-option', '');
  labEntry.textContent = '🎨 壁纸美化 →';
  labEntry.style.justifyContent = 'center';
  labEntry.style.borderBottom = '1px solid color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255,255,255)) 10%, transparent)';
  labEntry.style.marginBottom = '6px';
  labEntry.addEventListener('click', () => {
    lab.exitFraming();
    picker.innerHTML = '';
    picker.setAttribute('data-wpl-view', 'true');
    const back = document.createElement('div');
    back.setAttribute('data-capsule-skin-option', '');
    back.textContent = '← 返回皮肤列表';
    back.style.justifyContent = 'center';
    back.style.borderBottom = '1px solid color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255,255,255)) 10%, transparent)';
    back.style.marginBottom = '6px';
    back.addEventListener('click', () => {
      lab.exitFraming();
      buildPicker(container, skins, activeId, onPick, lab);
    });
    picker.appendChild(back);
    lab.renderPanelInto(picker);
  });
  picker.appendChild(labEntry);
  for (const skin of skins) {
    const opt = document.createElement('div');
    opt.setAttribute('data-capsule-skin-option', '');
    if (skin.id === activeId) opt.setAttribute('data-active', 'true');
    opt.style.position = 'relative';
    const thumb = document.createElement('div');
    thumb.setAttribute('data-capsule-skin-thumb', '');
    thumb.style.backgroundImage = `url("${skin.bg}")`;
    const label = document.createElement('span');
    label.textContent = skin.name;
    // 删除按钮：两次点击确认（防误删），成功后重建列表；删除当前皮肤自动切到第一个
    const del = document.createElement('span');
    del.textContent = '✕';
    del.style.cssText = 'position:absolute; top:2px; right:5px; z-index:2; font-size:11px; opacity:0.55; cursor:pointer; padding:1px 4px; border-radius:4px; background:color-mix(in srgb, var(--dsw-alias-label-primary, rgb(0,0,0)) 18%, transparent);';
    del.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (del.textContent !== '✕') {
        del.textContent = '⏳';
        try {
          const r = await fetch('/skin-assets/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: skin.id }),
          });
          const data = await r.json();
          if (!data.ok) { del.textContent = '✕'; del.style.color = ''; del.style.opacity = '0.55'; return; }
          const idx = skins.indexOf(skin);
          if (idx >= 0) skins.splice(idx, 1);
          let nextActive = activeId;
          if (activeId === skin.id && skins.length) {
            nextActive = skins[0].id;
            onPick(skins[0]);
          } else if (activeId === skin.id) {
            nextActive = null;
          }
          buildPicker(container, skins, nextActive, onPick, lab);
        } catch (err) {
          del.textContent = '✕';
          del.style.color = '';
          del.style.opacity = '0.55';
        }
        return;
      }
      del.textContent = '确认?';
      del.style.color = '#ff6b6b';
      del.style.opacity = '1';
      setTimeout(() => {
        if (del.isConnected && del.textContent === '确认?') {
          del.textContent = '✕';
          del.style.color = '';
          del.style.opacity = '0.55';
        }
      }, 3000);
    });
    opt.appendChild(thumb);
    opt.appendChild(label);
    opt.appendChild(del);
    opt.addEventListener('click', () => onPick(skin));
    picker.appendChild(opt);
  }
  // 壁纸目录设置行（WebUI 内配置，免改环境变量）
  const dirRow = document.createElement('div');
  dirRow.setAttribute('data-capsule-skin-dirrow', '');
  dirRow.style.cssText = 'padding: 6px 4px 2px;';
  const dirLabel = document.createElement('div');
  dirLabel.textContent = '📁 壁纸目录';
  dirLabel.style.cssText = 'font-size: 11px; opacity: 0.7; margin-bottom: 4px;';
  const dirInput = document.createElement('input');
  dirInput.setAttribute('data-capsule-skin-dir', '');
  dirInput.value = '…';
  dirInput.style.cssText = 'width: 100%; box-sizing: border-box; background: color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255,255,255)) 8%, transparent); border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255,255,255)) 16%, transparent); border-radius: 8px; color: var(--dsw-alias-label-primary, #fff); padding: 6px 8px; font-size: 12px;';
  const dirSave = document.createElement('button');
  dirSave.textContent = '保存目录';
  dirSave.style.cssText = 'margin-top: 4px; width: 100%; background: color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255,255,255)) 12%, transparent); border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255,255,255)) 16%, transparent); border-radius: 8px; color: var(--dsw-alias-label-primary, #fff); padding: 5px; font-size: 12px; cursor: pointer;';
  dirSave.addEventListener('click', async () => {
    const dir = dirInput.value.trim();
    if (!dir) { dirSave.textContent = '⚠️ 目录不能为空'; return; }
    dirSave.textContent = '⏳ 保存中…';
    try {
      const r = await fetch('/skin-assets/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallpaperDir: dir }),
      });
      const data = await r.json();
      dirSave.textContent = data.ok ? '✅ 已保存' : '⚠️ ' + (data.error || '失败');
    } catch (e) {
      dirSave.textContent = '⚠️ 保存失败';
    }
  });
  dirRow.appendChild(dirLabel);
  dirRow.appendChild(dirInput);
  dirRow.appendChild(dirSave);
  picker.appendChild(dirRow);
  // 读取当前配置回显
  fetch('/skin-assets/config', { cache: 'no-store' })
    .then(r => r.json())
    .then(cfg => { if (cfg.wallpaperDir) dirInput.value = cfg.wallpaperDir; })
    .catch(() => {});

  // 扫描新壁纸按钮（热添加入口：跑 gen_skin.py 批量生成 → 刷新列表）
  const scanBtn = document.createElement('div');
  scanBtn.setAttribute('data-capsule-skin-option', '');
  scanBtn.textContent = '🔄 扫描新壁纸';
  scanBtn.style.justifyContent = 'center';
  scanBtn.style.borderTop = '1px solid color-mix(in srgb, var(--dsw-alias-label-primary, rgb(255,255,255)) 10%, transparent)';
  scanBtn.style.marginTop = '6px';
  scanBtn.addEventListener('click', async () => {
    scanBtn.textContent = '⏳ 扫描中…';
    try {
      const r = await fetch('/skin-assets/scan', { method: 'POST' });
      const data = await r.json();
      scanBtn.textContent = data.ok ? '✅ 扫描完成，点我刷新列表' : '⚠️ 扫描失败: ' + (data.error || '');
    } catch (e) {
      scanBtn.textContent = '⚠️ 扫描失败';
    }
  });
  picker.appendChild(scanBtn);
  container.appendChild(picker);
}

module.exports = {
  inject,
  apply(ctx) {
    const body = document.body;
    const hadDark = body.hasAttribute('data-ds-dark-theme');
    body.setAttribute('data-ds-skin', 'capsule');
    // 强制暗色：dsh 的 ThemePresenter 会在启动/主题变更时按用户偏好（浅色/跟随系统）
    // 移除 data-ds-dark-theme 并重写 color-scheme，导致皮肤未覆盖的 token 与组件
    // 残留浅色底 + 白字。皮肤是暗色定位，这里持续守护两个属性，让整套暗色样式
    // 从根上生效（含未来新增的面板，无需逐个修补）。
    const forceDark = () => {
      const root = document.documentElement;
      if (root.style.colorScheme !== 'dark') root.style.colorScheme = 'dark';
      if (!body.hasAttribute('data-ds-dark-theme')) body.setAttribute('data-ds-dark-theme', '');
    };
    forceDark();
    const darkObserver = new MutationObserver(forceDark);
    darkObserver.observe(body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
    darkObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    // ── 白底白字兜底巡逻（底层防线）────────────────────────────
    // 上层机制（token 覆盖 / 暗色守护）只对"使用 dsw token"的组件生效；
    // 第三方插件若用硬编码浅色（或渲染在 shadow DOM），依然会浅底+白字。
    // 这里按计算样式兜底：任何元素只要背景为浅色且文字也为浅色，
    // 就强制换为主题深色表面——不依赖任何插件的编码方式。
    const LIGHT_BG_LUM = 150;   // 背景亮度阈值（如 #f5f6f7、#fff）
    const LIGHT_FG_LUM = 140;   // 文字亮度阈值（如白色系）
    const lumOf = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const rgbOf = (s) => {
      const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(s);
      return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
    };
    const patchedEls = new WeakSet();
    const patchedRoots = new WeakSet();
    let patrolTimer = null;
    const patrolOpts = { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] };
    const runPatrol = () => {
      if (document.hidden) return;
      const walk = (root) => {
        for (const el of root.querySelectorAll('*')) {
          // 穿透 shadow DOM：新发现的 shadow root 也纳入观察与扫描
          if (el.shadowRoot && !patchedRoots.has(el.shadowRoot)) {
            patchedRoots.add(el.shadowRoot);
            patrolObserver.observe(el.shadowRoot, patrolOpts);
            walk(el.shadowRoot);
          }
          if (patchedEls.has(el)) continue;
          const cs = getComputedStyle(el);
          const bg = rgbOf(cs.backgroundColor);
          const fg = rgbOf(cs.color);
          if (!bg || !fg || bg.a <= 0.5 || fg.a <= 0.5) continue;
          if (lumOf(bg.r, bg.g, bg.b) > LIGHT_BG_LUM && lumOf(fg.r, fg.g, fg.b) > LIGHT_FG_LUM) {
            el.style.setProperty('background-color', 'var(--dsw-alias-bg-layer-2, rgb(46, 48, 58))', 'important');
            patchedEls.add(el);
          }
        }
      };
      walk(document.body);
    };
    const schedulePatrol = () => {
      if (patrolTimer) return;
      patrolTimer = setTimeout(() => { patrolTimer = null; runPatrol(); }, 400);
    };
    const patrolObserver = new MutationObserver(schedulePatrol);
    patrolObserver.observe(document.body, patrolOpts);
    runPatrol();
    const style = document.createElement('style');
    style.id = 'dsh-capsule-skin/active';
    style.dataset.plugin = 'dsh-capsule-skin';
    style.textContent = SKIN_CSS;
    document.head.appendChild(style);

    // 当前皮肤的背景基色（来自 skins.json tokens 的 --dsw-alias-bg-base，供自适应文字使用）
    let currentBgColor = null;
    // 壁纸美化（wallpaper-lab 并入）：数据层挂载 + 面板渲染 + 清理
    const lab = createWallpaperLab(ctx, () => currentBgColor);
    lab.mountLayers();

    let disposeTokens = null;
    let skins = [];
    let activeId = localStorage.getItem(STORAGE_KEY) || null;

    const applySkin = (skin) => {
      disposeTokens = applySkinTokens(ctx, skin, disposeTokens);
      body.style.backgroundImage = `url("${skin.bg}")`;
      // 壁纸切换后：读取新皮肤 tokens 的背景基色 → 重算自适应文字颜色
      currentBgColor = parseColor((skin.tokens || {})['--dsw-alias-bg-base']);
      currentSkinId = skin.id; // 独立参数：标记当前壁纸，load/save 按它分键
      lab.reloadSkinSettings(); // 重载该壁纸的美化参数（美化层/面板/自适应文字）
      activeId = skin.id;
      localStorage.setItem(STORAGE_KEY, skin.id);
      const picker = document.querySelector('[data-capsule-skin-picker]');
      if (picker) {
        for (const opt of picker.children) {
          opt.setAttribute('data-active', opt.dataset && opt.querySelector('span') ? 'false' : 'false');
        }
      }
    };

    // 侧边栏切换按钮（设置在底部，壁纸按钮放在其上方）
    const btn = document.createElement('button');
    btn.setAttribute('data-capsule-skin-btn', '');
    btn.textContent = '🖼 壁纸皮肤';
    btn.addEventListener('click', () => {
      const existing = document.querySelector('[data-capsule-skin-picker]');
      if (existing) { lab.exitFraming(); existing.remove(); return; }
      // 浮层挂 document.body：脱离 sidebarCol 的 !important 胶囊样式（
      // button/`*` border-color 等会覆盖自适应配色），position:fixed 定位不受影响
      buildPicker(document.body, skins, activeId, (skin) => {
        applySkin(skin);
        lab.exitFraming();
        const p = document.querySelector('[data-capsule-skin-picker]');
        if (p) p.remove();
      }, lab);
    });
    // 等待侧边栏渲染后再挂按钮（apply 时机早于 DOM 就绪）
    const mountBtn = (retries) => {
      const sb = document.querySelector('[class*="sidebarCol"]');
      const settingsBtn = sb
        ? [...sb.querySelectorAll('button')].find(b => (b.textContent || '').includes('设置'))
        : null;
      if (settingsBtn && settingsBtn.parentElement) {
        settingsBtn.parentElement.insertBefore(btn, settingsBtn);
        return;
      }
      if (retries > 0) setTimeout(() => mountBtn(retries - 1), 500);
    };
    mountBtn(20);

    // 加载壁纸清单（热添加：文件更新后刷新页面即见）
    fetch('/skin-assets/skins.json', { cache: 'no-store' })
      .then(r => r.json())
      .then(list => {
        skins = list;
        if (!skins.length) return;
        const saved = skins.find(s => s.id === activeId);
        applySkin(saved || skins[0]);
      })
      .catch(err => console.warn('[dsh-capsule-skin] 清单加载失败', err));

    return () => {
      darkObserver.disconnect();
      patrolObserver.disconnect();
      if (patrolTimer) { clearTimeout(patrolTimer); patrolTimer = null; }
      style.remove();
      if (disposeTokens) { try { disposeTokens(); } catch (e) {} }
      btn.remove();
      const p = document.querySelector('[data-capsule-skin-picker]');
      if (p) p.remove();
      lab.dispose();
      body.removeAttribute('data-ds-skin');
      if (!hadDark) {
        body.removeAttribute('data-ds-dark-theme');
        document.documentElement.style.removeProperty('color-scheme');
      }
      body.style.backgroundImage = '';
    };
  }
};

    return module.exports;
  }
});
