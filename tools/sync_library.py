"""Refresh public library indexes from the local hanfu site, using this repository's originals."""
import json
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
with urlopen('http://localhost:3100/api/hanfu', timeout=15) as response:
    rows = json.load(response)

indexes = {}
originals = {}
for group in ('garment', 'head', 'pose'):
    path = ROOT / 'data' / f'{group}-images.json'
    index = json.loads(path.read_text())
    for item in index['items']:
        if not item['id'].startswith('retired-'):
            originals[item['id']] = item
    indexes[group] = (path, {**index, 'items': []})

ids = [row['id'] for row in rows]
if len(ids) != len(set(ids)) or set(ids) != set(originals):
    raise ValueError('Reconcile active source image IDs and published site IDs before syncing metadata.')

for row in rows:
    item = originals[row['id']]
    group = {'costume': 'garment', 'inner': 'garment', 'head': 'head', 'pose': 'pose'}[row['kind']]
    images = item['files' if group == 'pose' else 'views']
    angles = {Path(key).stem for key in row['image_keys']}
    if group == 'pose':
        if row.get('photo_example'):
            angles.add('example')
        if row.get('photo_example_full'):
            angles.add('example-full')
    if angles != set(images) or not all((ROOT / image).is_file() for image in images.values()):
        raise ValueError(f"Missing or mismatched views for {row['id']}")
    item.update(kind=row['kind'], name=row['title'])
    for key in ('era', 'gender', 'age', 'applicable_eras', 'summary', 'pose_category', 'head_type',
                'costume_family', 'season_scope', 'seasons'):
        item[key] = row.get(key)
    indexes[group][1]['items'].append(item)

catalog_path = ROOT / 'data/catalog.json'
catalog = json.loads(catalog_path.read_text())
details = {item['id']: item for item in catalog['items']}
labels = {'front': '正面', 'diag': '斜侧', 'side': '侧面', 'back': '背面', 'high': '俯拍', 'low': '仰拍'}
current = []
for row in rows:
    item = originals[row['id']]
    files = item.get('views') or item['files']
    views = {key: path for key, path in files.items() if key in labels}
    old = details.get(item['id'], {})
    entry = {key: value for key, value in item.items() if key not in ('views', 'files') and value is not None}
    if old.get('name') == item['name']:
        for key in ('occasion', 'structure', 'applicable_ages', 'applicable_roles', 'props', 'references',
                    'inspiration_url', 'presentation', 'role'):
            if key in old:
                entry[key] = old[key]
        # Keep image-specific notes only when they belong to these exact view paths.
        if old.get('view_files') == views:
            for key in ('description', 'review', 'status', 'prompt'):
                if old.get(key):
                    entry[key] = old[key]
    entry.setdefault('description', item['summary'])
    entry.setdefault('status', '创作参考')
    entry.update(image=views['front'], view_files=views, views=[labels[key] for key in views])
    if 'example' in files:
        entry.update(example=files['example'], exampleFull=files['example-full'])
    current.append(entry)

catalog_path.write_text(json.dumps({**catalog, 'items': current}, ensure_ascii=False, indent=2) + '\n')
for path, index in indexes.values():
    path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')
print(f'Synchronized {len(rows)} published assets.')
