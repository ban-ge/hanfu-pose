#!/usr/bin/env python3
"""Import one generated four-view role sheet without overwriting existing assets."""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
payload = json.loads(sys.argv[1])
source = Path(payload['source']).resolve()
if 'generated_images' not in source.parts or not source.is_file():
    raise ValueError('Generated source image not found')
kind = payload['kind']
if kind not in ('inner', 'costume'):
    raise ValueError('Unsupported garment type')
catalog_path = ROOT / 'data/catalog.json'
catalog = json.loads(catalog_path.read_text())
prefix = 'I' if kind == 'inner' else 'C'
ids = {item['id'] for item in catalog['items']}
ids.update(path.stem for path in (ROOT / 'assets' / kind).glob('*.png'))
n = max((int(i[1:]) for i in ids if re.fullmatch(prefix + r'\d+', i)), default=0) + 1
ident = f'{prefix}{n:03d}'
source_path = ROOT / 'assets' / kind / f'{ident}.png'
view_dir = source_path.with_suffix('')
if source_path.exists() or view_dir.exists():
    raise FileExistsError(ident)
shutil.copyfile(source, source_path)
info = subprocess.check_output(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', str(source_path)], text=True)
w = int(re.search(r'pixelWidth: (\d+)', info).group(1))
h = int(re.search(r'pixelHeight: (\d+)', info).group(1))
view_dir.mkdir()
views = {}
for angle, row, col in [('front', 0, 0), ('diag', 0, 1), ('side', 1, 0), ('back', 1, 1)]:
    target = view_dir / f'{angle}.png'
    subprocess.run(['sips', '-c', str(h // 2 - 6), str(w // 2 - 6), '--cropOffset', str(row * (h // 2) + 3), str(col * (w // 2) + 3), str(source_path), '--out', str(target)], check=True, stdout=subprocess.DEVNULL)
    views[angle] = str(target.relative_to(ROOT))
name = f"{payload['era']}风{payload['role']}{payload['gender']}{payload['season']}季{'内衬' if kind == 'inner' else '外衣'}"
latest = json.loads(catalog_path.read_text())
if any(item['id'] == ident for item in latest['items']):
    raise FileExistsError(f'Catalog changed while importing {ident}; generated files retained')
catalog = latest
catalog['items'].append({
    'id': ident, 'kind': kind, 'name': name, 'era': payload['era'], 'gender': payload['gender'],
    'season': payload['season'], 'role': payload['role'], 'summary': '角色专属服饰参考',
    'description': name + '；原创时代题材设计，非考证复原。', 'image': str(source_path.relative_to(ROOT)),
    'views': ['正面', '斜侧', '侧面', '背面'], 'status': '需复核',
    'review': 'AI 创作参考；四视角完整性、一致性和时代形制需人工复核。',
    'prompt': payload['prompt'], 'view_files': views, 'source_type': '内置 imagegen，四宫格生成后裁切',
})
catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'id': ident, 'name': name}, ensure_ascii=False))
