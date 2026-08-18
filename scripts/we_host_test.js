// dsh-capsule-skin /we-wallpaper 路由自检（不重启 dsh web 的离线验证）
// 用法: node scripts/we_host_test.js
const path = require('node:path');
const fs = require('node:fs');

const plugin = require(path.resolve(__dirname, '..', 'lib', 'index.js'));

// ---- 收集注册的 handler ----
const routes = [];
const ctx = {
  effect: (fn) => fn(),
  webServer: {
    register: (def) => routes.push(def),
  },
};
plugin.apply(ctx);
const we = routes.find((r) => r.path === '/we-wallpaper');
if (!we) { console.error('FAIL: /we-wallpaper 路由未注册'); process.exit(1); }

// ---- 极简 fake http req/res ----
const { Writable } = require('node:stream');
function fakeRes() {
  const s = new Writable({
    write(chunk, enc, cb) { this.chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)); cb(); },
    final(cb) { this._finished = true; cb(); },
  });
  s.chunks = [];
  s.status = 0;
  s.headers = {};
  s.writeHead = (status, headers) => { s.status = status; if (headers) Object.assign(s.headers, headers); };
  s.setHeader = (k, v) => { s.headers[k] = v; };
  s.getHeader = (k) => s.headers[k];
  return s;
}

function call(method, url, headers = {}) {
  const req = { method, url, headers };
  const res = fakeRes();
  we.handler(req, res);
  return new Promise((resolve) => {
    // handler 异步（color 走 execFile；文件流走 pipe）。给 2.5s 结算
    const body = () => Buffer.concat(res.chunks || []).toString('utf8');
    setTimeout(() => resolve({ status: res.status, headers: res.headers, text: body(), ended: res.writableEnded }), 2500);
  });
}

(async () => {
  const results = [];
  const check = (name, cond, detail) => {
    results.push({ name, ok: !!cond, detail: detail || '' });
    console.log((cond ? 'PASS' : 'FAIL') + '  ' + name + (cond ? '' : '  → ' + detail));
  };

  // 1) index 目录
  const idx = await call('GET', '/we-wallpaper/index');
  const catalog = JSON.parse(idx.text || '{}');
  check('index ok=true', idx.status === 200 && catalog.ok === true, `status=${idx.status}`);
  check('weDirExists 自动探测 D:\\SteamLibrary', catalog.weDirExists === true, catalog.weDir);
  check('目录非空且含 video/gif/image', Array.isArray(catalog.items) && catalog.items.length > 0 &&
    catalog.items.some(i => i.kind === 'video') && catalog.items.some(i => i.kind === 'gif') && catalog.items.some(i => i.kind === 'image'),
    `items=${Array.isArray(catalog.items) ? catalog.items.length : '?'}`);
  const vid = catalog.items.find(i => i.kind === 'video');
  const sceneGif = catalog.items.find(i => i.kind === 'gif');
  const img = catalog.items.find(i => i.kind === 'image');
  check('video 项带 video/poster URL', !!vid && /^\/we-wallpaper\/f\/\d+\//.test(vid.video) && /^\/we-wallpaper\/f\/\d+\//.test(vid.poster), vid && (vid.video + ' | ' + vid.poster));
  check('gif 项（scene 降级）', !!sceneGif, sceneGif && sceneGif.id);
  check('image 项（scene jpg）', !!img, img && img.id);
  check('不含 application(2705892428)', !catalog.items.some(i => i.weId === '2705892428'), '');
  check('schemecolor 为原始浮点串或 null', catalog.items.every(i => i.schemecolor === null || i.schemecolor === undefined || /^[\d. ]+$/.test(i.schemecolor)), '');

  // 2) 文件流：mp4 无 Range → 200
  let fv;
  if (vid) {
    // 用小文件视频（2253273790=3.1MB）
    const smallVid = catalog.items.find(i => i.kind === 'video' && i.weId === '2253273790') || vid;
    fv = await call('GET', smallVid.video, { 'Cache-Control': 'no-cache' });
    check('mp4 无 Range → 200 + video/mp4', fv.status === 200 && fv.headers['Content-Type'] === 'video/mp4', `status=${fv.status} ${fv.headers['Content-Type']}`);
    check('Accept-Ranges: bytes', fv.headers['Accept-Ranges'] === 'bytes', String(fv.headers['Accept-Ranges']));
    const fh = await call('HEAD', smallVid.video);
    check('HEAD 允许（200）', fh.status === 200, `status=${fh.status}`);

    // 3) Range 请求 → 206 + Content-Range
    const fr = await call('GET', smallVid.video, { range: 'bytes=0-1023' });
    check('mp4 Range → 206 + bytes 0-1023', fr.status === 206 && /^bytes 0-1023\//.test(fr.headers['Content-Range']), `status=${fr.status} CR=${fr.headers['Content-Range']}`);
    const frlen = await call('GET', smallVid.video, { range: 'bytes=-2048' });
    check('mp4 suffix Range → 206', frlen.status === 206 && frlen.headers['Content-Length'] === 2048, `status=${frlen.status} len=${frlen.headers['Content-Length']}`);
    const fbad = await call('GET', smallVid.video, { range: 'bytes=9999999999-' });
    check('越界 Range → 416', fbad.status === 416, `status=${fbad.status}`);
  } else { check('mp4 测试却被跳过（无 video 项）', true, 'skip'); }

  // 4) 海报 gif/jpg 可通过 f/ 服务
  if (sceneGif) {
    const fg = await call('GET', sceneGif.poster);
    check('gif 海报 → 200 image/gif', fg.status === 200 && fg.headers['Content-Type'] === 'image/gif', `status=${fg.status}`);
  }

  // 5) 安全：穿越 / 白名单 / 目录
  const trav = await call('GET', '/we-wallpaper/f/1573769316/%2e%2e%2f..%2f..%2f..%2fWindows%2fwin.ini');
  check('编码穿越 → 404', trav.status === 404, `status=${trav.status}`);
  const pkg = await call('GET', '/we-wallpaper/f/3105414361/scene.pkg');
  check('scene.pkg 白名单拦截 → 404', pkg.status === 404, `status=${pkg.status}`);
  const noid = await call('GET', '/we-wallpaper/f/abc/preview.jpg');
  check('非法 id → 404', noid.status === 404, `status=${noid.status}`);

  // 6) cfg
  const cfg = await call('GET', '/we-wallpaper/cfg');
  const cfgParsed = JSON.parse(cfg.text || '{}');
  check('cfg 返回 weDir + 状态', cfg.status === 200 && typeof cfgParsed.weDir === 'string' && typeof cfgParsed.weDirExists === 'boolean', cfgParsed.weDir + ' exists=' + cfgParsed.weDirExists);

  // 7) color：真实跑 python（用 4K 视频的 jpg 海报）
  if (vid) {
    const c = await call('GET', '/we-wallpaper/color?id=' + vid.weId);
    let body = {};
    try { body = JSON.parse(c.text || '{}'); } catch (e) {}
    check('color 返回 tokens', c.status === 200 && body.ok === true && body.tokens && body.tokens['--dsw-alias-bg-base'], `status=${c.status} tokens=${body.tokens ? Object.keys(body.tokens).length : 0}`);
    // 二次命中缓存
    const c2 = await call('GET', '/we-wallpaper/color?id=' + vid.weId);
    let b2 = {};
    try { b2 = JSON.parse(c2.text || '{}'); } catch (e) {}
    check('color 缓存命中（二次请求成功）', b2.ok === true && !!b2.tokens, `status=${c2.status}`);
  } else { check('color 测试跳过（无 video 项）', true, 'skip'); }

  const failed = results.filter(r => !r.ok);
  console.log('\n=== ' + (failed.length ? failed.length + ' FAILED' : 'ALL PASS') + ' (' + results.length + ' checks) ===');
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
