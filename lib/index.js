// dsh-capsule-skin host 半：服务插件 assets 目录（壁纸皮肤数据 + 背景图）
// 加壁纸 = 生成数据文件到 assets/ + 更新 skins.json → 刷新页面即可，无需重启 dsh web
const path = require('node:path');
const fs = require('node:fs');
const { execFile } = require('node:child_process');

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
        const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
        // 配置 API：GET/POST /skin-assets/config（壁纸目录等）
        const CONFIG_FILE = path.join(pkgRoot, 'config.json');
        const loadConfig = () => { try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch (e) { return {}; } };
        if (pathname === '/skin-assets/config' && req.method === 'GET') {
          const cfg = loadConfig();
          const body = { wallpaperDir: cfg.wallpaperDir || process.env.DSH_SKIN_WALLPAPER_DIR || 'D:\\Wallpaper' };
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
          const py = process.env.DSH_SKIN_PYTHON || 'python';
          const wdir = loadConfig().wallpaperDir || process.env.DSH_SKIN_WALLPAPER_DIR || 'D:\\Wallpaper';
          execFile(py, [script, '--scan', wdir], { timeout: 120000 }, (err, stdout) => {
            const body = { ok: !err, output: String(stdout || '').slice(-1500), error: err ? String(err.message) : null };
            res.writeHead(err ? 500 : 200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(body));
          });
          return;
        }
        const rel = pathname.slice('/skin-assets/'.length);
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
  },
};
