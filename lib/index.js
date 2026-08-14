// dsh-capsule-skin host 半：服务插件 assets 目录（壁纸皮肤数据 + 背景图）
// 加壁纸 = 生成数据文件到 assets/ + 更新 skins.json → 刷新页面即可，无需重启 dsh web
const path = require('node:path');
const fs = require('node:fs');

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
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.writeHead(405);
          res.end();
          return;
        }
        const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
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
