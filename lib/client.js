// dsh-capsule-skin — 壁纸皮肤（胶囊侧边栏 · 暗色 · 主题色取色 · 热切换/热添加）
// 皮肤数据通过 /skin-assets/skins.json 动态加载：加壁纸 = 生成数据文件 → 刷新页面即可
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
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, rgb(46, 48, 58)) 92%, transparent);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, rgb(192, 194, 210)) 14%, transparent);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  padding: 8px;
  z-index: 9999;
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
`;

const inject = ["theme"];

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

function buildPicker(container, skins, activeId, onPick) {
  const old = container.querySelector('[data-capsule-skin-picker]');
  if (old) old.remove();
  const picker = document.createElement('div');
  picker.setAttribute('data-capsule-skin-picker', '');
  for (const skin of skins) {
    const opt = document.createElement('div');
    opt.setAttribute('data-capsule-skin-option', '');
    if (skin.id === activeId) opt.setAttribute('data-active', 'true');
    const thumb = document.createElement('div');
    thumb.setAttribute('data-capsule-skin-thumb', '');
    thumb.style.backgroundImage = `url("${skin.bg}")`;
    const label = document.createElement('span');
    label.textContent = skin.name;
    opt.appendChild(thumb);
    opt.appendChild(label);
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
  dirInput.style.cssText = 'width: 100%; box-sizing: border-box; background: rgba(255,236,235,0.08); border: 1px solid rgba(255,236,235,0.15); border-radius: 8px; color: #fff; padding: 6px 8px; font-size: 12px;';
  const dirSave = document.createElement('button');
  dirSave.textContent = '保存目录';
  dirSave.style.cssText = 'margin-top: 4px; width: 100%; background: rgba(255,236,235,0.12); border: 1px solid rgba(255,236,235,0.15); border-radius: 8px; color: #fff; padding: 5px; font-size: 12px; cursor: pointer;';
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
  scanBtn.style.borderTop = '1px solid rgba(255,236,235,0.1)';
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
    const style = document.createElement('style');
    style.id = 'dsh-capsule-skin/active';
    style.dataset.plugin = 'dsh-capsule-skin';
    style.textContent = SKIN_CSS;
    document.head.appendChild(style);

    let disposeTokens = null;
    let skins = [];
    let activeId = localStorage.getItem(STORAGE_KEY) || null;

    const applySkin = (skin) => {
      disposeTokens = applySkinTokens(ctx, skin, disposeTokens);
      body.style.backgroundImage = `url("${skin.bg}")`;
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
      if (existing) { existing.remove(); return; }
      const sb = document.querySelector('[class*="sidebarCol"]');
      const host = sb || document.body;
      buildPicker(host, skins, activeId, (skin) => {
        applySkin(skin);
        const p = document.querySelector('[data-capsule-skin-picker]');
        if (p) p.remove();
      });
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
      style.remove();
      if (disposeTokens) { try { disposeTokens(); } catch (e) {} }
      btn.remove();
      const p = document.querySelector('[data-capsule-skin-picker]');
      if (p) p.remove();
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
