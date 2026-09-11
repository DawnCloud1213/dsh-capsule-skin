#!/usr/bin/env python3
"""dsh-capsule-skin Wallpaper Engine 高清底图提取
从 scene.pkg（专有 PKGV0019 容器，内嵌 PNG/JPEG 原始字节）中凿出最高清的横向背景图，
压成 ≤4096 边 JPEG 供浏览器全屏呈现。用法:
  python gen_we_hi.py <scene.pkg> <out.jpg>
  python gen_we_hi.py --probe <scene.pkg>   # 只打印候选，不写文件
"""
import io, json, os, sys
from PIL import Image

MAGICS = [
    (b'\x89PNG\r\n\x1a\n', 'png', b'IEND'),
    (b'\xff\xd8\xff', 'jpg', b'\xff\xd9'),
]


def carve(b):
    found = []
    for magic, kind, endmark in MAGICS:
        i = 0
        while True:
            s = b.find(magic, i)
            if s < 0:
                break
            e = b.find(endmark, s + len(magic))
            if e > 0:
                # png: IEND 标记后还有 4 字节 CRC → 结束 = e + 8；jpg: SOI..EOI 含尾
                n = (e - s + 8) if kind == 'png' else (e - s + 2)
                try:
                    im = Image.open(io.BytesIO(b[s:s + n]))
                    im.verify()
                    found.append((kind, s, n, im.size))
                except Exception:
                    pass
            i = s + 1
    return found


def pick(found):
    """候选：优先 w>h 且 w>=800 的最大像素；若无非横向大图，退回最大图。"""
    if not found:
        return None
    land = [f for f in found if f[3][0] > f[3][1] and f[3][0] >= 800]
    pool = land if land else found
    return max(pool, key=lambda f: f[3][0] * f[3][1])


def main():
    args = sys.argv[1:]
    if not args:
        print('用法: python gen_we_hi.py <scene.pkg> <out.jpg> | --probe <scene.pkg>', file=sys.stderr)
        sys.exit(1)
    probe = args[0] == '--probe'
    if probe:
        args = args[1:]
    pkg = args[0]
    b = open(pkg, 'rb').read()
    found = carve(b)
    cand = pick(found)
    print(f'decodeable={len(found)}', file=sys.stderr)
    if not cand:
        print('NO_IMAGE', file=sys.stderr)
        sys.exit(1)
    kind, off, n, (w, h) = cand
    print(f'candidate kind={kind} off={off} bytes={n} size={w}x{h} aspect={w / max(1, h):.3f}', file=sys.stderr)
    if probe:
        print(f'{w}x{h}')
        return
    out = args[1]
    data = b[off:off + n]
    im = Image.open(io.BytesIO(data)).convert('RGB')
    # 限最大边 ≤4096，保持原分辨率语义（原图通常 ≥4K）
    longest = max(im.size)
    if longest > 4096:
        r = 4096 / longest
        im = im.resize((max(1, int(im.size[0] * r)), max(1, int(im.size[1] * r))), Image.LANCZOS)
    im.save(out, 'JPEG', quality=85, optimize=True)
    print(f'OK -> {out} {im.size[0]}x{im.size[1]}')


if __name__ == '__main__':
    main()
