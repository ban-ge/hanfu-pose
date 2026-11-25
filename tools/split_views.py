#!/usr/bin/env python3
"""Split the original 2×2 image sheets using macOS sips; never overwrite crops."""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / 'data/catalog.json'
POSITIONS = [('front', 0, 0), ('diag', 0, 1), ('side', 1, 0), ('back', 1, 1)]

def main():
    data = json.loads(CATALOG.read_text())
    count = 0
    for item in data['items']:
        source = ROOT / item['image']
        info = subprocess.check_output(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', str(source)], text=True)
        w = int(re.search(r'pixelWidth: (\d+)', info).group(1))
        h = int(re.search(r'pixelHeight: (\d+)', info).group(1))
        cw, ch = w // 2 - 6, h // 2 - 6
        dest = source.with_suffix('')
        dest.mkdir(exist_ok=True)
        views = {}
        for name, row, col in POSITIONS:
            target = dest / f'{name}.png'
            if not target.exists():
                subprocess.run(['sips', '-c', str(ch), str(cw), '--cropOffset', str(row * (h // 2) + 3), str(col * (w // 2) + 3), str(source), '--out', str(target)], check=True, stdout=subprocess.DEVNULL)
                count += 1
            views[name] = str(target.relative_to(ROOT))
        item['view_files'] = views
        item['source_type'] = '内置 imagegen，四宫格生成后裁切'
    CATALOG.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print(f"素材 {len(data['items'])} 组，新增裁切 {count} 张；每组 4 个独立视角")

if __name__ == '__main__':
    main()
