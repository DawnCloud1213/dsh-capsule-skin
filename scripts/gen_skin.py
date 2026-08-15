#!/usr/bin/env python3
"""dsh-capsule-skin 壁纸→皮肤管线
从壁纸提取主题色(MCU) + 生成背景帧 + 输出皮肤数据到插件 assets/
用法: python gen_skin.py [壁纸路径] [皮肤名]
"""
import json, os, sys, shutil
from PIL import Image, ImageEnhance

from material_color_utilities import theme_from_image

# 插件根目录（脚本位于 scripts/ 下）
PLUGIN_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ASSETS_DIR = os.path.join(PLUGIN_ROOT, 'assets')
# profile 副本（dsh 实际加载的包；同步用）
PROFILE_PKG = os.path.expandvars(r'%USERPROFILE%\.dsh\profiles\web\node_modules\@dawn\dsh-capsule-skin')

def sync_to_profile(name):
    """把新增皮肤同步到 profile 副本（仅本地开发模式；scan API 场景脚本直接跑在 profile 内无需同步）"""
    if not os.path.isdir(PROFILE_PKG):
        print(f"⏭️  跳过 profile 同步（{PROFILE_PKG} 不存在——非本机开发模式）")
        return
    src = os.path.join(ASSETS_DIR, name)
    dst = os.path.join(PROFILE_PKG, 'assets', name)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.exists(dst):
        shutil.rmtree(dst)
    shutil.copytree(src, dst)
    # 同步清单
    shutil.copy2(os.path.join(ASSETS_DIR, 'skins.json'),
                 os.path.join(PROFILE_PKG, 'assets', 'skins.json'))
    print(f"📋 已同步到 profile: {dst} + skins.json")

def rebuild_manifest():
    """扫描 assets/ 下所有皮肤，重建 skins.json 清单"""
    skins = []
    for d in sorted(os.listdir(ASSETS_DIR)):
        sj = os.path.join(ASSETS_DIR, d, 'skin.json')
        if not os.path.isfile(sj):
            continue
        try:
            data = json.load(open(sj, encoding='utf-8'))
        except Exception:
            continue
        tokens = data.get('tokens', {})
        meta = data.get('meta', {})
        skins.append({
            'id': d,
            'name': meta.get('display', d),
            'source': meta.get('source', ''),
            'tokens': tokens,
            'bg': f'/skin-assets/{d}/bg.jpg',
        })
    manifest = os.path.join(ASSETS_DIR, 'skins.json')
    json.dump(skins, open(manifest, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return skins

def generate(wallpaper_path, name):
    out_dir = os.path.join(ASSETS_DIR, name)
    os.makedirs(out_dir, exist_ok=True)
    img = Image.open(wallpaper_path).convert('RGB')

    # 1. MCU 配色板：按图片平均亮度选板（亮图→浅色板浅底深字；暗图→暗色板深底浅字）
    small = img.copy().resize((64, 64))
    px = list(small.getdata())
    avg = tuple(sum(c[i] for c in px) // len(px) for i in range(3))
    lum = (0.2126 * avg[0] + 0.7152 * avg[1] + 0.0722 * avg[2]) / 255
    is_light = lum > 0.5
    theme = theme_from_image(img)
    scheme = theme.schemes.light if is_light else theme.schemes.dark
    seed = scheme.primary

    def to_rgb(hexstr):
        h = hexstr.lstrip('#')
        return f"rgb({int(h[0:2],16)}, {int(h[2:4],16)}, {int(h[4:6],16)})"

    # 2. 背景帧：轻微压暗 15% 保可读性，几乎原图
    bg = img.copy()
    bg = ImageEnhance.Brightness(bg).enhance(0.85)
    w, h = bg.size
    if w > 1920:
        bg = bg.resize((1920, int(h * 1920 / w)), Image.LANCZOS)
    bg_path = os.path.join(out_dir, 'bg.jpg')
    bg.save(bg_path, 'JPEG', quality=68, optimize=True)

    # 3. token 表：MCU 语义色 → dsh --dsw-alias-*（按图片亮度选浅/暗色板）
    tokens = {
        '--dsw-alias-bg-base': to_rgb(scheme.surface),
        '--dsw-alias-bg-layer-1': to_rgb(scheme.surface_container_low),
        '--dsw-alias-bg-layer-2': to_rgb(scheme.surface_container),
        '--dsw-alias-bg-layer-3': to_rgb(scheme.surface_container_high),
        '--dsw-alias-border-l1': to_rgb(scheme.outline_variant),
        '--dsw-alias-border-l2': to_rgb(scheme.outline),
        '--dsw-alias-brand-primary': to_rgb(scheme.primary),
        '--dsw-alias-label-primary': to_rgb(scheme.on_surface),
        '--dsw-alias-label-secondary': to_rgb(scheme.on_surface_variant),
        '--dsw-alias-state-error': to_rgb(scheme.error),
        '--dsw-alias-interactive-hover': to_rgb(scheme.primary_container),
        '--dsw-alias-button-primary-fill': to_rgb(scheme.primary),
        '--dsw-alias-button-primary-text': to_rgb(scheme.on_primary),
        '--dsw-specific-sidebar-fill': to_rgb(scheme.surface_container),
    }
    meta = {
        'name': name,
        'display': os.path.splitext(os.path.basename(wallpaper_path))[0],
        'source': wallpaper_path,
        'seed': seed,
        'scheme': 'light' if is_light else 'dark',
        'luminance': round(lum, 3),
        'dark': {k: to_rgb(v) for k, v in theme.schemes.dark.dict().items() if k in
                 ('primary','on_primary','surface','on_surface','surface_container','primary_container')},
    }
    with open(os.path.join(out_dir, 'skin.json'), 'w', encoding='utf-8') as f:
        json.dump({'tokens': tokens, 'meta': meta}, f, ensure_ascii=False, indent=2)

    print(f"✅ 种子色: {seed}")
    print(f"✅ 背景帧: {bg_path} ({bg.size[0]}x{bg.size[1]}, {os.path.getsize(bg_path)//1024}KB)")
    print(f"✅ tokens: {len(tokens)} 个 -> {os.path.join(out_dir, 'skin.json')}")
    print(f"\n{'浅色板' if is_light else '暗色板'}预览(亮度 {lum:.3f}): primary={to_rgb(scheme.primary)} "
          f"surface={to_rgb(scheme.surface)} on_surface={to_rgb(scheme.on_surface)}")

    # 重建清单 + 同步 profile
    rebuild_manifest()
    sync_to_profile(name)
    print(f"✅ skins.json 清单: {len(rebuild_manifest())} 个皮肤")

if __name__ == '__main__':
    # 批量扫描模式: python gen_skin.py --scan <壁纸目录>
    if len(sys.argv) >= 2 and sys.argv[1] == '--scan':
        wdir = sys.argv[2] if len(sys.argv) > 2 else r'D:\Wallpaper'
        exts = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}
        targets = []
        for fn in sorted(os.listdir(wdir)):
            if os.path.splitext(fn)[1].lower() not in exts:
                continue
            if any(k in fn.lower() for k in ('mask', 'blur', 'normal', 'phase', 'mix')):
                continue  # 跳过特效/遮罩图
            targets.append(os.path.join(wdir, fn))
        added = []
        for wp in targets:
            name = os.path.splitext(os.path.basename(wp))[0]
            # 已有则跳过（幂等）
            if os.path.isdir(os.path.join(ASSETS_DIR, name)):
                continue
            try:
                generate(wp, name)
                added.append(name)
            except Exception as e:
                print(f"⚠️ {name} 失败: {e}")
        print(f"\n=== 扫描完成: 新增 {len(added)} 个皮肤: {added} ===")
        sys.exit(0)
    if len(sys.argv) < 2:
        print('用法: python gen_skin.py <壁纸路径> [皮肤名] | python gen_skin.py --scan <壁纸目录>')
        sys.exit(1)
    wp = sys.argv[1]
    name = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(os.path.basename(wp))[0]
    generate(wp, name)
