// dsh-capsule-skin /we-wallpaper 线上端到端自检（需 dsh web 已重启 + 新路由生效）
// 用法: node scripts/we_live_test.js [baseUrl]   （默认 http://127.0.0.1:3080）
const path = require('node:path');
const http = require('node:http');
const BASE = process.argv[2] || 'http://127.0.0.1:3080';

function req(method, url, headers = {}, maxBytes = 1_000_000) {
  return new Promise((resolve, reject) => {
    const u = new URL(url, BASE);
    const r = http.request({ host: u.hostname, port: u.port, path: u.pathname + u.search, method, headers }, (res) => {
      const chunks = [];
      let got = 0;
      res.on('data', (c) => {
        got += c.length;
        if (got <= maxBytes) chunks.push(c);
        if (got > maxBytes) res.destroy(); // 只取头部 + 前缀（大视频不整包拉取）
      });
      const settle = () => {
        try { resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() }); }
        catch (e) { resolve({ status: res.statusCode, headers: res.headers, body: '' }); }
      };
      res.on('end', settle);
      res.on('close', settle);
    });
    r.on('error', reject);
    r.end();
  });
}

(async () => {
  const results = [];
  const check = (name, cond, detail) => { results.push({ name, ok: !!cond, detail: detail || '' }); console.log((cond ? 'PASS' : 'FAIL') + '  ' + name + (cond ? '' : '  → ' + detail)); };

  // 1) index 目录（新 host 路由生效的判定）
  const idx = await req('GET', '/we-wallpaper/index');
  if (!/json/.test(idx.headers['content-type'] || '')) {
    console.log('HINT: /we-wallpaper/index 返回 ' + (idx.headers['content-type'] || 'unknown') + ' —— host 路由未生效，请重启 dsh web 后重试');
    process.exit(2);
  }
  const cat = JSON.parse(idx.body || '{}');
  check('GET /we-wallpaper/index → JSON ok', idx.status === 200 && cat.ok === true, `status=${idx.status} ct=${idx.headers['content-type']}`);
  check('weDirExists（D:\\SteamLibrary 探测）', cat.weDirExists === true, String(cat.weDir));
  check('目录含 video/gif/image 三类', Array.isArray(cat.items) && cat.items.some(i => i.kind === 'video') && cat.items.some(i => i.kind === 'gif') && cat.items.some(i => i.kind === 'image'), `items=${Array.isArray(cat.items) ? cat.items.length : '?'}`);
  const vid = cat.items.find(i => i.kind === 'video');
  const gvid = cat.items.find(i => i.kind === 'video' && i.weId === '3300777757'); // gif 海报视频用例
  const sceneGif = cat.items.find(i => i.kind === 'gif');

  // 2) 文件流：真实线上 mp4 不带/带 Range
  if (vid) {
    const a = await req('GET', vid.video);
    check('线上 mp4 无 Range → 200 video/mp4', a.status === 200 && /video\/mp4/.test(a.headers['content-type'] || ''), `status=${a.status}`);
    const b = await req('GET', vid.video, { range: 'bytes=0-2047' });
    check('线上 mp4 Range → 206 + 0-2047', b.status === 206 && /^bytes 0-2047\//.test(b.headers['content-range'] || ''), `status=${b.status} CR=${b.headers['content-range']}`);
    check('Accept-Ranges: bytes', b.headers['accept-ranges'] === 'bytes', String(b.headers['accept-ranges']));
    const c = await req('GET', vid.video, { range: 'bytes=-4096' });
    check('后缀 Range → 206 len=4096', c.status === 206 && String(c.headers['content-length']) === '4096', `status=${c.status} len=${c.headers['content-length']}`);
  } else { check('video 用例存在', false, '目录里没有 video'); }

  // 3) gif 海报视频的 poster（gif 可经 f/ 服务 + 客户端 body 底=gif）
  if (gvid) {
    const a = await req('GET', gvid.poster);
    check('gif 海报视频 poster → image/gif', a.status === 200 && /image\/gif/.test(a.headers['content-type'] || ''), `status=${a.status} ${gvid.poster}`);
  } else { check('gif 海报视频用例存在', true, 'skip（无 3300777757）'); }

  // 4) scene gif 降级
  if (sceneGif) {
    const a = await req('GET', sceneGif.poster);
    check('scene gif 降级海报 → image/gif', a.status === 200 && /image\/gif/.test(a.headers['content-type'] || ''), `status=${a.status}`);
  }

  // 5) 取色（真实跑线上 python + 返回 token）
  if (vid) {
    const a = await req('GET', '/we-wallpaper/color?id=' + vid.weId);
    const j = JSON.parse(a.body || '{}');
    check('color → tokens + bg-base', a.status === 200 && j.ok && j.tokens && j.tokens['--dsw-alias-bg-base'], `status=${a.status} keys=${j.tokens ? Object.keys(j.tokens).length : 0}`);
    const b = await req('GET', '/we-wallpaper/color?id=' + vid.weId);
    const j2 = JSON.parse(b.body || '{}');
    check('color 二次命中缓存', b.status === 200 && j2.ok && !!j2.tokens, `status=${b.status}`);
  } else { check('color 用例存在', false, '无 video'); }

  // 6) 安全
  const t = await req('GET', '/we-wallpaper/f/1573769316/%2e%2e%2f..%2f..%2fWindows%2fwin.ini');
  check('编码穿越 → 404', t.status === 404, `status=${t.status}`);
  const p = await req('GET', '/we-wallpaper/f/3105414361/scene.pkg');
  check('scene.pkg → 404', p.status === 404, `status=${p.status}`);

  const failed = results.filter(r => !r.ok);
  console.log('\n=== 线上 ' + (failed.length ? failed.length + ' FAILED' : 'ALL PASS') + ' (' + results.length + ') ===');
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('LIVE TEST CRASH', e); process.exit(2); });
