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
body[data-ds-skin="capsule"] [class*="sidebarCol"] [role="treeitem"] {
  margin: 2px 8px;
  padding: 6px 12px;
}
/* 会话胶囊缩进嵌在项目胶囊内 */
body[data-ds-skin="capsule"] [class*="sidebarCol"] [role="treeitem"]:not([class*="projectRow"]):not([class*="folder"]) {
  margin-left: 30px !important;
}
/* 设置弹窗：容器大圆角 + 内部控件胶囊化 */
body[data-ds-skin="capsule"] [role="dialog"] {
  border-radius: 18px !important;
  overflow: hidden;
}
body[data-ds-skin="capsule"] [role="dialog"] button,
body[data-ds-skin="capsule"] [role="dialog"] [role="tab"],
body[data-ds-skin="capsule"] [role="dialog"] input,
body[data-ds-skin="capsule"] [role="dialog"] [role="combobox"],
body[data-ds-skin="capsule"] [role="dialog"] [class*="selector"] {
  border-radius: 12px !important;
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
