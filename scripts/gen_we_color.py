#!/usr/bin/env python3
"""dsh-capsule-skin Wallpaper Engine 预览图 → MCU tokens
用法: python gen_we_color.py <图像路径> <输出json路径>
支持 jpg/png/gif（gif 默认取第 0 帧）。token 表与 gen_skin.py 完全一致。
输出: {"tokens": {...}, "meta": {"seed","scheme","luminance"}}
"""
import json, sys
from PIL import Image
from material_color_utilities import theme_from_image


def main():
    if len(sys.argv) < 3:
        print('用法: python gen_we_color.py <图像路径> <输出json>', file=sys.stderr)
        sys.exit(1)
    img_path, out_path = sys.argv[1], sys.argv[2]

    # gif 打开即第 0 帧；convert('RGB') 丢弃 alpha 以兼容 MCU
    img = Image.open(img_path).convert('RGB')

    # 按图片平均亮度选板（与 gen_skin.py 一致的判板逻辑）
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
        return f"rgb({int(h[0:2], 16)}, {int(h[2:4], 16)}, {int(h[4:6], 16)})"

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
    meta = {'seed': seed, 'scheme': 'light' if is_light else 'dark', 'luminance': round(lum, 3)}

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump({'tokens': tokens, 'meta': meta}, f, ensure_ascii=False, indent=2)
    print(f"OK primary={seed} scheme={'light' if is_light else 'dark'}")


if __name__ == '__main__':
    main()
