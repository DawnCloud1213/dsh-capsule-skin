// dsh-capsule-skin host 半：服务插件 assets 目录（壁纸皮肤数据 + 背景图）+ /wallpaper-lab 状态路由（wallpaper-lab 已并入）
// 加壁纸 = 生成数据文件到 assets/ + 更新 skins.json → 刷新页面即可，无需重启 dsh web
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { version: PKG_VERSION } = require('../package.json');

// 平台默认值（Windows: D:\Wallpaper + python；macOS/Linux: ~/Pictures + python3）
const DEFAULT_WALLPAPER_DIR = process.platform === 'win32' ? 'D:\\Wallpaper' : path.join(os.homedir(), 'Pictures');
const DEFAULT_PYTHON = process.platform === 'win32' ? 'python' : 'python3';

const MIME = {
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

// ── Wallpaper Engine 动态壁纸兼容 ────────────────────────────────
// 订阅目录结构：SteamLibrary/steamapps/workshop/content/431960/<workshopid>/
//   project.json  描述（type/file/preview/title；UTF-8，type 大小写不一）
//   preview.jpg/gif  每个订阅项都有（缩略图 + 取色源 + 场景降级海报）
//   *.mp4         video 类（全部 H.264 → Chromium 可播，需 HTTP Range 流式）
//   scene.pkg     scene 类专有归档（PKGV0019，非 ZIP）+ shaders/*.dxs 编译
//                 DirectX 着色器 + .tex-json 纹理 → 浏览器无法渲染，仅预览图降级
// 设计：只读流式直服务 WE 目录、不复制 GB 级视频；/we-wallpaper/f 带 Range/白名单/穿越防护
const WE_EXTS = new Set(['.mp4', '.webm', '.gif', '.jpg', '.jpeg', '.png']);
const WE_MIME = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};
const WE_WORKSHOP_APPID = '431960'; // Wallpaper Engine Steam AppID

// 自动探测 SteamLibrary workshop content/431960（库可在任意盘/目录）
function detectWeDir(cfg) {
  const stored = cfg && cfg.weDir;
  if (stored && fs.existsSync(stored)) return stored;
  if (process.env.DSH_SKIN_WE_DIR && fs.existsSync(process.env.DSH_SKIN_WE_DIR)) return process.env.DSH_SKIN_WE_DIR;
  const base = path.join('steamapps', 'workshop', 'content', WE_WORKSHOP_APPID);
  const roots = [
    'D:\\SteamLibrary', 'C:\\SteamLibrary', 'E:\\SteamLibrary', 'F:\\SteamLibrary',
    'C:\\Program Files (x86)\\Steam', 'C:\\Program Files\\Steam',
    path.join(os.homedir(), 'SteamLibrary'),
  ];
  for (const root of roots) {
    const c = path.join(root, base);
    if (fs.existsSync(c)) return c;
  }
  return null;
}

// 路径穿越防护：候选文件 realpath 必须落在 weDir 之内（或为目录本身）
function realInside(rootDir, candidate) {
  let root, real;
  try {
    root = fs.realpathSync(rootDir);
    real = fs.realpathSync(candidate);
  } catch (e) { return false; }
  return real === root || real.startsWith(root + path.sep);
}

// 带 HTTP Range 的视频/图片流式输出（浏览器 seek/分段加载必需；pipe 自带背压）
function serveWeFile(req, res, file, mime) {
  let stat;
  try { stat = fs.statSync(file); } catch (e) { res.writeHead(404); res.end(); return; }
  const size = stat.size;
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'no-cache');
  const stream = () => {
    const s = fs.createReadStream(file);
    s.on('error', () => { try { res.destroy(); } catch (e) {} });
    res.on('close', () => { try { s.destroy(); } catch (e) {} });
    return s;
  };
  const range = req.headers.range;
  if (!range) {
    res.writeHead(200, { 'Content-Type': mime, 'Content-Length': size });
    stream().pipe(res);
    return;
  }
  const m = /^bytes=(\d*)-(\d*)$/.exec(String(range).trim());
  if (!m) { res.writeHead(416, { 'Content-Range': 'bytes */' + size }); res.end(); return; }
  let start = m[1] === '' ? null : parseInt(m[1], 10);
  let end = m[2] === '' ? null : parseInt(m[2], 10);
  if (start === null && end === null) { res.writeHead(416, { 'Content-Range': 'bytes */' + size }); res.end(); return; }
  if (start === null) { start = Math.max(0, size - end); end = size - 1; } // 后缀 "-N"
  else if (end === null) { end = size - 1; } // 前缀 "a-"
  if (start > end || start >= size) { res.writeHead(416, { 'Content-Range': 'bytes */' + size }); res.end(); return; }
  end = Math.min(end, size - 1);
  const len = end - start + 1;
  res.writeHead(206, {
    'Content-Type': mime,
    'Content-Range': 'bytes ' + start + '-' + end + '/' + size,
    'Content-Length': len,
  });
  fs.createReadStream(file, { start, end }).pipe(res);
}

// 扫描 WE 订阅目录 → 目录（纯 project.json 解析；application/无描述项跳过）
function parseWeCatalog(weDir) {
  const items = [];
  let names = [];
  try { names = fs.readdirSync(weDir); } catch (e) { return items; }
  for (const name of names) {
    if (!/^\d{6,}$/.test(name)) continue; // workshopid 命名目录
    const dir = path.join(weDir, name);
    let pj = null;
    try { pj = JSON.parse(fs.readFileSync(path.join(dir, 'project.json'), 'utf8')); } catch (e) { continue; }
    const type = String(pj.type || '').toLowerCase();
    if (!type) continue;
    const preview = typeof pj.preview === 'string' ? pj.preview : '';
    if (!preview) continue;
    const file = typeof pj.file === 'string' ? pj.file : '';
    const enc = (fn) => encodeURIComponent(fn);
    const poster = '/we-wallpaper/f/' + name + '/' + enc(preview);
    let kind, video = null, note = '';
    if (type === 'video') {
      const ext = path.extname(file).toLowerCase();
      if (!file || !fs.existsSync(path.join(dir, file))) { kind = 'poster'; note = '缺少视频文件'; }
      else if (ext !== '.mp4' && ext !== '.webm') { kind = 'poster'; note = '非 Web 可播格式'; }
      else { kind = 'video'; video = '/we-wallpaper/f/' + name + '/' + enc(file); }
    } else if (type === 'scene') {
      kind = preview.toLowerCase().endsWith('.gif') ? 'gif' : 'image'; // 专有场景仅预览图降级
    } else if (type === 'web') {
      kind = 'poster'; note = 'web 类型暂不支持';
    } else {
      continue; // application / 其他
    }
    const schema = ((pj.general || {}).properties || {}).schemecolor;
    items.push({
      id: 'we-' + name,
      weId: name,
      title: typeof pj.title === 'string' && pj.title ? pj.title : name,
      type,
      kind,
      video,
      poster,
      preview,
      schemecolor: schema && typeof schema.value === 'string' ? schema.value : null,
      note: note || undefined,
    });
  }
  items.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
  return items;
}

module.exports = {
  inject: ['webServer'],
  apply(ctx) {
    // 插件根目录（lib/ 的上级）；assets 与之平级
    const pkgRoot = path.resolve(__dirname, '..');
    const assetsDir = path.join(pkgRoot, 'assets');

    ctx.effect(() => ctx.webServer.register({
      kind: 'prefix',
      path: '/skin-assets',
      handler: async (req, res) => {
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'POST') {
          res.writeHead(405);
          res.end();
          return;
        }
        // 直接比较原始 pathname（不做 decodeURIComponent：畸形 % 编码会抛 URIError）
        const pathname = new URL(req.url ?? '/', 'http://x').pathname;
        // 配置 API：GET/POST /skin-assets/config（壁纸目录等）
        const CONFIG_FILE = path.join(pkgRoot, 'config.json');
        const loadConfig = () => { try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch (e) { return {}; } };
        if (pathname === '/skin-assets/config' && req.method === 'GET') {
          const cfg = loadConfig();
          const body = { wallpaperDir: cfg.wallpaperDir || process.env.DSH_SKIN_WALLPAPER_DIR || DEFAULT_WALLPAPER_DIR };
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(body));
          return;
        }
        if (pathname === '/skin-assets/config' && req.method === 'POST') {
          let raw = '';
          req.on('data', (chunk) => { raw += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(raw || '{}');
              const dir = String(data.wallpaperDir || '').trim();
              if (!dir) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: false, error: '目录不能为空' })); return; }
              const cfg = loadConfig();
              cfg.wallpaperDir = dir;
              fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ ok: true, wallpaperDir: dir }));
            } catch (e) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: false, error: String(e.message) }));
            }
          });
          return;
        }
        // 扫描壁纸 API：POST /skin-assets/scan → 跑 gen_skin.py 批量生成新皮肤
        if (pathname === '/skin-assets/scan' && req.method === 'POST') {
          const script = path.join(pkgRoot, 'scripts', 'gen_skin.py');
          const py = process.env.DSH_SKIN_PYTHON || DEFAULT_PYTHON;
          const wdir = loadConfig().wallpaperDir || process.env.DSH_SKIN_WALLPAPER_DIR || DEFAULT_WALLPAPER_DIR;
          execFile(py, [script, '--scan', wdir], { timeout: 120000 }, (err, stdout) => {
            const body = { ok: !err, output: String(stdout || '').slice(-1500), error: err ? String(err.message) : null };
            res.writeHead(err ? 500 : 200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(body));
          });
          return;
        }
        // 删除壁纸 API：POST /skin-assets/delete（body: {id}）→ 删除皮肤目录 + 更新清单
        if (pathname === '/skin-assets/delete' && req.method === 'POST') {
          let raw = '';
          req.on('data', (chunk) => { raw += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(raw || '{}');
              const id = String(data.id || '').trim();
              // 安全校验：拒绝空/路径分隔符/..，且解析后必须落在 assets 内
              if (!id || id === '.' || id === '..' || id.includes('/') || id.includes('\\')) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: '非法皮肤 ID' }));
                return;
              }
              const dir = path.resolve(assetsDir, id);
              const assetsRoot = path.resolve(assetsDir) + path.sep;
              if (!dir.startsWith(assetsRoot) || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: '皮肤不存在' }));
                return;
              }
              fs.rmSync(dir, { recursive: true, force: true });
              // 更新清单（保持 gen_skin.py 的 indent=1 格式）
              const manifest = path.join(assetsDir, 'skins.json');
              let skins = [];
              try { skins = JSON.parse(fs.readFileSync(manifest, 'utf8')); } catch (e) { /* 清单损坏则重建为空 */ }
              skins = skins.filter((s) => s.id !== id);
              fs.writeFileSync(manifest, JSON.stringify(skins, null, 1), 'utf8');
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ ok: true, skins }));
            } catch (e) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: false, error: String(e.message) }));
            }
          });
          return;
        }
        // 文件服务：仅对 rel 做安全解码（畸形 % 编码时退回原始值，不抛 URIError）
        let rel = pathname.slice('/skin-assets/'.length);
        try { rel = decodeURIComponent(rel); } catch (e) { /* 保留原始 rel */ }
        // 必须用 resolve（解析 .. 防路径穿越）+ 校验真实路径前缀
        const file = path.resolve(assetsDir, rel);
        const assetsRoot = path.resolve(assetsDir) + path.sep;
        if (!file.startsWith(assetsRoot) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
          res.writeHead(404);
          res.end();
          return;
        }
        const ext = path.extname(file).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Cache-Control': 'no-cache',
        });
        fs.createReadStream(file).pipe(res);
      },
    }), 'dsh-capsule-skin: asset route');

    // wallpaper-lab 状态路由（原独立子模块并入主 apply）
    ctx.effect(() => ctx.webServer.register({
      kind: 'prefix',
      path: '/wallpaper-lab',
      handler: async (req, res) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.writeHead(405);
          res.end();
          return;
        }
        // 直接比较原始 pathname（不做 decodeURIComponent）
        const pathname = new URL(req.url ?? '/', 'http://x').pathname;
        if (pathname === '/wallpaper-lab/status') {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            ok: true,
            name: '@dawn/dsh-capsule-skin/wallpaper-lab',
            version: PKG_VERSION,
            client: true,
          }));
          return;
        }
        res.writeHead(404);
        res.end();
      },
    }), 'dsh-capsule-skin: wallpaper-lab status route');

    // ════════════════════════════════════════════════════════════════
    // Wallpaper Engine 动态壁纸兼容路由（/we-wallpaper 前缀）
    //  - GET|POST /we-wallpaper/cfg       weDir 配置（默认自动探测 SteamLibrary）
    //  - GET      /we-wallpaper/index     扫描 WE 目录 → 目录（纯解析，快）
    //  - GET      /we-wallpaper/color?id= poster → MCU tokens（预览图 mtime 缓存）
    //  - GET      /we-wallpaper/f/<id>/<enc> 只读文件流（Range/白名单/穿越防护）
    // ════════════════════════════════════════════════════════════════
    const WE_CACHE = path.join(os.tmpdir(), 'dsh-capsule-skin-we-color');
    const WE_SCRIPT = path.join(pkgRoot, 'scripts', 'gen_we_color.py');
    const WE_CFG_FILE = path.join(pkgRoot, 'config.json');
    const loadWeCfg = () => { try { return JSON.parse(fs.readFileSync(WE_CFG_FILE, 'utf8')); } catch (e) { return {}; } };

    ctx.effect(() => ctx.webServer.register({
      kind: 'prefix',
      path: '/we-wallpaper',
      handler: async (req, res) => {
        // GET/POST/HEAD；HEAD 与 GET 同路径由 serveWeFile/JSON 分支处理（Node 自动不送 body）
        if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'HEAD') {
          res.writeHead(405);
          res.end();
          return;
        }
        // 直接比较原始 pathname（不做 decodeURIComponent：畸形 % 编码会抛 URIError）
        const pathname = new URL(req.url ?? '/', 'http://x').pathname;
        const weDir = detectWeDir(loadWeCfg());

        // 配置：GET/POST /we-wallpaper/cfg
        if (pathname === '/we-wallpaper/cfg' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: true, weDir: weDir || '', weDirExists: !!(weDir && fs.existsSync(weDir)) }));
          return;
        }
        if (pathname === '/we-wallpaper/cfg' && req.method === 'POST') {
          let raw = '';
          req.on('data', (c) => { raw += c; });
          req.on('end', () => {
            try {
              const data = JSON.parse(raw || '{}');
              const dir = String(data.weDir || '').trim();
              if (!dir) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: false, error: '目录不能为空' })); return; }
              const cfg = loadWeCfg();
              cfg.weDir = dir;
              fs.writeFileSync(WE_CFG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ ok: true, weDir: dir }));
            } catch (e) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: false, error: String(e.message) }));
            }
          });
          return;
        }

        // 目录：GET /we-wallpaper/index
        if (pathname === '/we-wallpaper/index' && req.method === 'GET') {
          const items = weDir ? parseWeCatalog(weDir) : [];
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: true, weDir, weDirExists: !!(weDir && fs.existsSync(weDir)), items }));
          return;
        }

        // 取色：GET /we-wallpaper/color?id=we-<id>（亦接受裸数字 id） → 预览图 → MCU tokens（mtime 缓存，避免重复跑 python）
        if (pathname === '/we-wallpaper/color' && req.method === 'GET') {
          const q = new URL(req.url ?? '/', 'http://x').searchParams;
          const id = q.get('id') || '';
          const m = /^(?:we-)?(\d{6,})$/.exec(id);
          if (!m || !weDir) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: false, error: '参数错误' })); return; }
          const wid = m[1];
          const dir = path.join(weDir, wid);
          if (!realInside(weDir, dir)) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: false, error: '不存在' })); return; }
          // 预览图：优先 project.json 的 preview 字段，兜底常见文件名
          let preview = null;
          try {
            const pj = JSON.parse(fs.readFileSync(path.join(dir, 'project.json'), 'utf8'));
            preview = typeof pj.preview === 'string' ? pj.preview : null;
          } catch (e) { /* 忽略 */ }
          if (!preview) {
            for (const cand of ['preview.jpg', 'preview.jpeg', 'preview.png', 'preview.gif']) {
              if (fs.existsSync(path.join(dir, cand))) { preview = cand; break; }
            }
          }
          if (!preview) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: false, error: '无预览图' })); return; }
          const disk = path.join(dir, preview);
          if (!realInside(weDir, disk) || !fs.existsSync(disk)) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: false, error: '预览不存在' })); return; }
          let st;
          try { st = fs.statSync(disk); } catch (e) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: false, error: '预览不可读' })); return; }
          const cacheKey = wid + '-' + st.mtimeMs + '-' + st.size;
          try { fs.mkdirSync(WE_CACHE, { recursive: true }); } catch (e) {}
          const cacheFile = path.join(WE_CACHE, wid + '.json');
          try {
            const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
            if (cached && cached._key === cacheKey) {
              const copy = { ...cached };
              delete copy._key;
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ ok: true, ...copy }));
              return;
            }
          } catch (e) { /* miss → 重新取色 */ }
          const outPath = cacheFile + '.tmp.' + process.pid;
          const py = process.env.DSH_SKIN_PYTHON || DEFAULT_PYTHON;
          execFile(py, [WE_SCRIPT, disk, outPath], { timeout: 60000 }, (err) => {
            try {
              if (!err && fs.existsSync(outPath)) {
                const data = JSON.parse(fs.readFileSync(outPath, 'utf8'));
                const copy = { ...data, _key: cacheKey };
                fs.writeFileSync(cacheFile, JSON.stringify(copy), 'utf8');
                delete copy._key;
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ ok: true, ...copy }));
              } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: String(err ? err.message : '取色失败') }));
              }
            } catch (e2) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: false, error: String(e2.message) }));
            } finally {
              try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e3) { /* 忽略 */ }
            }
          });
          return;
        }

        // 文件服务：GET /we-wallpaper/f/<id>/<encoded-name>（Range / 扩展名白名单 / 穿越防护）
        if (pathname.startsWith('/we-wallpaper/f/')) {
          if (!weDir) { res.writeHead(404); res.end(); return; }
          const raw = pathname.slice('/we-wallpaper/f/'.length);
          const slash = raw.indexOf('/');
          const id = slash < 0 ? raw : raw.slice(0, slash);
          const encName = slash < 0 ? '' : raw.slice(slash + 1);
          if (!/^\d{6,}$/.test(id) || !encName) { res.writeHead(404); res.end(); return; }
          let fname;
          try { fname = decodeURIComponent(encName); } catch (e) { res.writeHead(400); res.end(); return; }
          if (!fname || fname.includes('\0')) { res.writeHead(400); res.end(); return; }
          const ext = path.extname(fname).toLowerCase();
          if (!WE_EXTS.has(ext)) { res.writeHead(404); res.end(); return; }
          const file = path.resolve(weDir, id, fname);
          let isFile = false;
          try { isFile = fs.existsSync(file) && fs.statSync(file).isFile(); } catch (e) { isFile = false; }
          if (!isFile || !realInside(weDir, file)) { res.writeHead(404); res.end(); return; }
          serveWeFile(req, res, file, WE_MIME[ext]);
          return;
        }

        res.writeHead(404);
        res.end();
      },
    }), 'dsh-capsule-skin: wallpaper-engine routes');
  },
};
