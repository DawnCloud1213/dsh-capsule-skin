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
body[data-ds-skin="capsule"] [class*="centerCol"],
body[data-ds-skin="capsule"] [class*="detailsCol"] {
  background: rgba(0, 0, 0, 0.08) !important;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
body[data-ds-skin="capsule"] [class*="sidebarCol"] button,
body[data-ds-skin="capsule"] [class*="sidebarCol"] [role="treeitem"],
body[data-ds-skin="capsule"] [class*="sidebarCol"] input,
body[data-ds-skin="capsule"] [class*="sidebarCol"] [class*="search"] {
  border-radius: 14px !important;
  background: rgba(61, 44, 44, 0.62) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 236, 235, 0.10) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    0 2px 10px rgba(0, 0, 0, 0.35) !important;
  transition: all 0.18s cubic-bezier(.4, 0, .2, 1) !important;
}
body[data-ds-skin="capsule"] [class*="sidebarCol"] button:hover,
body[data-ds-skin="capsule"] [class*="sidebarCol"] [role="treeitem"]:hover {
  background: rgba(255, 173, 174, 0.22) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 4px 16px rgba(0, 0, 0, 0.45) !important;
}
body[data-ds-skin="capsule"] [class*="sidebarCol"] [aria-selected="true"],
body[data-ds-skin="capsule"] [class*="sidebarCol"] [data-selected] {
  background: rgba(255, 236, 235, 0.14) !important;
  border-color: rgba(255, 236, 235, 0.45) !important;
}
/* ── 层级：项目组容器 = 大胶囊，物理包含项目行 + 会话行 ── */
body[data-ds-skin="capsule"] [class*="sidebarCol"] [class*="groupSection"]:has([class*="projectRow"]) {
  background: rgba(61, 44, 44, 0.42) !important;
  border: 1px solid rgba(255, 236, 235, 0.10) !important;
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
  background: rgba(61, 44, 44, 0.50) !important;
  border-radius: 12px !important;
  margin: 0 0 6px !important;
  padding: 6px 12px !important;
  border: 1px solid rgba(255, 236, 235, 0.08) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07) !important;
}
/* 会话行：容器内的小胶囊（缩进 + 浅色） */
body[data-ds-skin="capsule"] [class*="sidebarCol"] [role="treeitem"][class*="sessionRow"] {
  background: rgba(255, 236, 235, 0.06) !important;
  border: 1px solid rgba(255, 236, 235, 0.05) !important;
  border-radius: 10px !important;
  margin: 2px 8px 2px 14px !important;
  padding: 5px 10px !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04) !important;
}
body[data-ds-skin="capsule"] [class*="sidebarCol"] [role="treeitem"][class*="sessionRow"][class*="selected"],
body[data-ds-skin="capsule"] [class*="sidebarCol"] [role="treeitem"][class*="sessionRow"][aria-selected="true"] {
  background: rgba(255, 236, 235, 0.14) !important;
  border-color: rgba(255, 236, 235, 0.40) !important;
}
/* ── 对话气泡：暗色底 + 白字 ── */
body[data-ds-skin="capsule"] [class*="centerCol"] [class*="bubble"] {
  background: rgba(61, 44, 44, 0.65) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 236, 235, 0.10) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
}
/* AI 文本直接铺背景时加轻微暗罩保可读 */
body[data-ds-skin="capsule"] [class*="centerCol"] [class*="turn"] [class*="text"],
body[data-ds-skin="capsule"] [class*="centerCol"] [class*="assistant"] [class*="content"] {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}
/* ── 输入框：跟随壁纸主题色（只给输入框本体上暗色，容器保持透明） ── */
body[data-ds-skin="capsule"] [class*="composerSeat"] {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
body[data-ds-skin="capsule"] [class*="composerSeat"] textarea {
  background: rgba(30, 16, 16, 0.55) !important;
  border: 1px solid rgba(255, 236, 235, 0.10) !important;
  border-radius: 14px !important;
  color: #ffffff !important;
  padding: 12px 14px !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35) !important;
}
body[data-ds-skin="capsule"] [class*="composerSeat"] textarea::placeholder,
body[data-ds-skin="capsule"] [class*="composerSeat"] [contenteditable="true"]:empty::before {
  color: rgba(255, 255, 255, 0.45) !important;
}
/* 首页 hero 输入卡片（仅含 textarea 的卡片容器） */
body[data-ds-skin="capsule"] [class*="centerCol"] [class*="card"]:has(textarea) {
  background: rgba(30, 16, 16, 0.55) !important;
  border: 1px solid rgba(255, 236, 235, 0.10) !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35) !important;
}
/* ── 侧边栏装饰分隔线：融入主题 ── */
body[data-ds-skin="capsule"] [class*="sidebarCol"] * {
  border-color: rgba(255, 236, 235, 0.06) !important;
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
  background: rgba(30, 16, 16, 0.92);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 236, 235, 0.12);
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
  background: rgba(255, 236, 235, 0.10);
}
body[data-ds-skin="capsule"] [data-capsule-skin-option][data-active="true"] {
  border-color: rgba(255, 236, 235, 0.4);
  background: rgba(255, 236, 235, 0.08);
}
body[data-ds-skin="capsule"] [data-capsule-skin-thumb] {
  width: 40px;
  height: 24px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.15);
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
    body.setAttribute('data-ds-dark-theme', '');
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
      style.remove();
      if (disposeTokens) { try { disposeTokens(); } catch (e) {} }
      btn.remove();
      const p = document.querySelector('[data-capsule-skin-picker]');
      if (p) p.remove();
      body.removeAttribute('data-ds-skin');
      if (!hadDark) body.removeAttribute('data-ds-dark-theme');
      body.style.backgroundImage = '';
    };
  }
};

    return module.exports;
  }
});
// dsh-wallpaper-lab — 壁纸美化插件（客户端半）
// 在现有壁纸之上叠加实时美化层：
//   滤镜（模糊/亮度/对比度/饱和度/灰度/复古/色相）+ 压暗 + 暗角 + 色调 + 颗粒 + 文字水印
// 壁纸来源自动跟随：body 内联 background-image（胶囊皮肤插件会设置它）；
// 若没有，则回退读取 /skin-assets/skins.json 的第一个皮肤。
// 设置保存在 localStorage，刷新页面后保持。
window.__ModuleLoader__.load({
  id: "@local/dsh-wallpaper-lab",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

    const STORAGE_KEY = 'dsh-wallpaper-lab-settings';

    const DEFAULTS = {
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
    };

    const PRESETS = {
      none:  { label: '原图', s: {} },
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

    const UI_CSS = `
[data-wpl-btn] {
  position: fixed; right: 16px; bottom: 20px; z-index: 9997;
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(20, 22, 30, 0.85); border: 1px solid rgba(255, 255, 255, 0.14);
  color: #fff; font-size: 20px; cursor: pointer;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
  display: flex; align-items: center; justify-content: center;
  transition: transform .15s ease, background .15s ease;
}
[data-wpl-btn]:hover { background: rgba(40, 44, 58, 0.92); transform: scale(1.06); }
[data-wpl-panel] {
  position: fixed; right: 16px; bottom: 76px; z-index: 10000;
  width: 272px; max-height: 66vh; overflow-y: auto;
  background: rgba(18, 20, 28, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  padding: 12px; color: #e8ecf4;
  font: 13px/1.5 -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
[data-wpl-panel]::-webkit-scrollbar { width: 6px; }
[data-wpl-panel]::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.18); border-radius: 3px; }
.wpl-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.wpl-title { font-weight: 700; font-size: 14px; flex: 1; }
.wpl-icon-btn {
  background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e8ecf4; border-radius: 8px; padding: 2px 8px; cursor: pointer; font-size: 12px;
}
.wpl-icon-btn:hover { background: rgba(255, 255, 255, 0.16); }
.wpl-presets { display: flex; flex-wrap: wrap; gap: 6px; margin: 2px 0 10px; }
.wpl-chip {
  padding: 3px 10px; border-radius: 999px; font-size: 11px;
  border: 1px solid rgba(255, 255, 255, 0.14); background: rgba(255, 255, 255, 0.06);
  color: #dfe5f0; cursor: pointer; transition: background .12s ease;
}
.wpl-chip:hover { background: rgba(110, 168, 255, 0.2); }
.wpl-chip[data-active="true"] { background: rgba(110, 168, 255, 0.32); border-color: rgba(110, 168, 255, 0.7); color: #fff; }
.wpl-sec {
  font-size: 11px; opacity: 0.6; margin: 12px 0 4px; letter-spacing: 1px;
  border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 8px;
}
.wpl-row { display: flex; align-items: center; gap: 8px; margin: 6px 0; }
.wpl-label { width: 46px; font-size: 11px; opacity: 0.75; flex-shrink: 0; }
.wpl-range { flex: 1; accent-color: #6ea8ff; cursor: pointer; }
.wpl-val { width: 36px; text-align: right; font-size: 10px; opacity: 0.6; flex-shrink: 0; }
.wpl-text {
  width: 100%; box-sizing: border-box; background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 8px; color: #fff;
  padding: 6px 8px; font-size: 12px; outline: none;
}
.wpl-text:focus { border-color: rgba(110, 168, 255, 0.6); }
.wpl-select {
  background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.14);
  color: #fff; border-radius: 8px; padding: 4px 6px; font-size: 12px; flex: 1;
}
.wpl-color { width: 34px; height: 24px; padding: 0; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: transparent; cursor: pointer; }
.wpl-foot { display: flex; align-items: center; gap: 10px; margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.08); }
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
  border: 1px solid rgba(110, 168, 255, 0.35); color: #fff;
  border-radius: 8px; padding: 5px; font-size: 12px; cursor: pointer;
}
.wpl-btn-block:hover { background: rgba(110, 168, 255, 0.24); }
`;

    function loadSettings() {
      try {
        return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')) };
      } catch (e) {
        return { ...DEFAULTS };
      }
    }
    function saveSettings(s) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
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

    module.exports = {
      inject: [],
      apply(ctx) {
        const settings = loadSettings();
        const state = { bgUrl: null, fallbackTried: false, disposed: false };
        const sliderRefs = {};

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

        // ---------- UI ----------
        const btn = document.createElement('button');
        btn.setAttribute('data-wpl-btn', '');
        btn.textContent = '🎨';
        btn.title = '壁纸美化';
        const panel = document.createElement('div');
        panel.setAttribute('data-wpl-panel', '');
        panel.style.display = 'none';

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
        panel.appendChild(head);

        // 预设
        const chipsRow = document.createElement('div');
        chipsRow.className = 'wpl-presets';
        const chipRefs = {};
        for (const [id, p] of Object.entries(PRESETS)) {
          const chip = document.createElement('span');
          chip.className = 'wpl-chip';
          chip.textContent = p.label;
          chip.addEventListener('click', () => applyPreset(id));
          chipRefs[id] = chip;
          chipsRow.appendChild(chip);
        }
        panel.appendChild(chipsRow);

        // 滑杆构建器
        function sliderRow(key, label, min, max, step, unit) {
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
            settings[key] = Number(input.value);
            settings.preset = 'custom';
            sliderRefs[key].val.textContent = settings[key] + (unit || '');
            applyAll();
            saveSettings(settings);
          });
          const val = document.createElement('span');
          val.className = 'wpl-val';
          row.append(l, input, val);
          sliderRefs[key] = { input, val };
          return row;
        }

        // 滤镜区
        const secFilter = document.createElement('div');
        secFilter.className = 'wpl-sec';
        secFilter.textContent = '滤镜';
        panel.appendChild(secFilter);
        [
          ['blur', '模糊', 0, 30, 1, 'px'],
          ['brightness', '亮度', 30, 180, 1, '%'],
          ['contrast', '对比度', 50, 180, 1, '%'],
          ['saturate', '饱和度', 0, 250, 1, '%'],
          ['grayscale', '灰度', 0, 100, 1, '%'],
          ['sepia', '复古', 0, 100, 1, '%'],
          ['hue', '色相', 0, 360, 1, '°'],
        ].forEach(([key, label, min, max, step, unit]) => {
          panel.appendChild(sliderRow(key, label, min, max, step, unit));
        });

        // 氛围区
        const secMood = document.createElement('div');
        secMood.className = 'wpl-sec';
        secMood.textContent = '氛围';
        panel.appendChild(secMood);
        [
          ['shade', '压暗', 0, 80, 1, '%'],
          ['vignette', '暗角', 0, 100, 1, '%'],
          ['grain', '颗粒', 0, 100, 1, ''],
        ].forEach(([key, label, min, max, step, unit]) => {
          panel.appendChild(sliderRow(key, label, min, max, step, unit));
        });

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
          applyAll(); saveSettings(settings);
        });
        tintRow.append(tintLabel, tintColor, tintSlider, tintVal);
        panel.appendChild(tintRow);

        // 取景区（选择壁纸显示区域）
        const secFraming = document.createElement('div');
        secFraming.className = 'wpl-sec';
        secFraming.textContent = '取景（选择壁纸显示区域）';
        panel.appendChild(secFraming);

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
        panel.appendChild(frameModeRow);

        panel.appendChild(sliderRow('bgZoom', '缩放', 100, 400, 5, '%'));

        const resetFrameBtn = document.createElement('button');
        resetFrameBtn.className = 'wpl-btn-block';
        resetFrameBtn.textContent = '↺ 重置取景（回到完整图片）';
        resetFrameBtn.addEventListener('click', () => {
          settings.bgCx = 50; settings.bgCy = 50; settings.bgZoom = 100;
          settings.preset = 'custom';
          refreshControls(); applyAll(); saveSettings(settings);
        });
        panel.appendChild(resetFrameBtn);

        // 文字水印区
        const secText = document.createElement('div');
        secText.className = 'wpl-sec';
        secText.textContent = '文字水印';
        panel.appendChild(secText);

        const textInput = document.createElement('input');
        textInput.className = 'wpl-text';
        textInput.placeholder = '输入水印文字（留空关闭）';
        textInput.addEventListener('input', () => {
          settings.text = textInput.value;
          settings.preset = 'custom';
          applyAll(); saveSettings(settings);
        });
        panel.appendChild(textInput);

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
        panel.appendChild(fontRow);

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
        panel.appendChild(posRow);
        panel.appendChild(sliderRow('textSize', '字号', 12, 72, 1, 'px'));
        panel.appendChild(sliderRow('textOpacity', '透明度', 10, 100, 1, '%'));

        // 底部：启用开关 + 说明
        const foot = document.createElement('div');
        foot.className = 'wpl-foot';
        const toggle = document.createElement('label');
        toggle.className = 'wpl-toggle';
        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.addEventListener('change', () => {
          settings.enabled = toggleInput.checked;
          applyAll(); saveSettings(settings);
        });
        toggle.append(toggleInput, document.createTextNode('启用美化'));
        foot.appendChild(toggle);
        panel.appendChild(foot);
        const note = document.createElement('div');
        note.className = 'wpl-note';
        note.textContent = '设置自动保存 · 跟随当前壁纸';
        panel.appendChild(note);

        // ---------- 逻辑 ----------
        function applyPreset(id) {
          const p = PRESETS[id];
          if (!p) return;
          settings.preset = id;
          Object.assign(settings, p.s);
          refreshControls();
          applyAll();
          saveSettings(settings);
        }

        function refreshControls() {
          for (const [key, ref] of Object.entries(sliderRefs)) {
            ref.input.value = settings[key];
            const unit =
              key === 'blur' || key === 'textSize' ? 'px' :
              key === 'hue' ? '°' :
              key === 'brightness' || key === 'contrast' || key === 'saturate' || key === 'grayscale' || key === 'sepia' || key === 'shade' || key === 'vignette' || key === 'grain' || key === 'bgZoom' || key === 'textOpacity' ? '%' : '';
            ref.val.textContent = settings[key] + unit;
          }
          tintColor.value = settings.tintColor;
          tintSlider.value = settings.tintOpacity;
          tintVal.textContent = settings.tintOpacity + '%';
          textInput.value = settings.text;
          posSelect.value = TEXT_POS[settings.textPos] ? settings.textPos : 'bottom-right';
          fontSelect.value = FONTS[settings.textFont] ? settings.textFont : 'system';
          textColorInput.value = settings.textColor;
          toggleInput.checked = settings.enabled;
          for (const [id, chip] of Object.entries(chipRefs)) {
            chip.setAttribute('data-active', settings.preset === id ? 'true' : 'false');
          }
        }

        function applyBgTransform() {
          bgLayer.style.transform = 'scale(' + (settings.bgZoom / 100) + ')';
          bgLayer.style.transformOrigin = settings.bgCx + '% ' + settings.bgCy + '%';
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
          frameToggleInput.checked = on;
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
          saveSettings(settings);
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
          sliderRefs.bgZoom.input.value = settings.bgZoom;
          sliderRefs.bgZoom.val.textContent = settings.bgZoom + '%';
          saveSettings(settings);
        }, { passive: false });

        function applyAll() {
          if (state.disposed) return;
          const on = settings.enabled;
          const base = on ? '' : 'none';
          [bgLayer, shadeLayer, vignetteLayer, tintLayer, grainLayer].forEach(el => {
            el.style.display = base;
          });
          textLayer.style.display = 'none';
          if (!on) return;

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
        }

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

        // ---------- 挂载 ----------
        const style = document.createElement('style');
        style.id = 'dsh-wallpaper-lab/style';
        style.dataset.plugin = 'dsh-wallpaper-lab';
        style.textContent = UI_CSS;

        document.head.appendChild(style);
        document.body.append(bgLayer, shadeLayer, vignetteLayer, tintLayer, grainLayer, frameLayer, textLayer, btn, panel);

        btn.addEventListener('click', () => {
          panel.style.display = panel.style.display === 'none' ? '' : 'none';
        });
        closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
        resetBtn.addEventListener('click', () => {
          const keep = { enabled: settings.enabled };
          Object.assign(settings, DEFAULTS, keep);
          refreshControls();
          applyAll();
          saveSettings(settings);
        });

        const mo = new MutationObserver(syncBg);
        mo.observe(document.body, { attributes: true, attributeFilter: ['style'] });
        window.addEventListener('storage', syncBg);

        refreshControls();
        syncBg();
        applyAll();

        return () => {
          state.disposed = true;
          mo.disconnect();
          window.removeEventListener('storage', syncBg);
          style.remove();
          btn.remove();
          panel.remove();
          textLayer.remove();
          frameLayer.remove();
          grainLayer.remove();
          tintLayer.remove();
          vignetteLayer.remove();
          shadeLayer.remove();
          bgLayer.remove();
        };
      }
    };

    return module.exports;
  }
});
