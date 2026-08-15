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
  },
};
