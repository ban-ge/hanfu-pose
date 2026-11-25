#!/usr/bin/env python3
"""Check catalog integrity and referenced PNGs, not image or historical accuracy."""
import json
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
items = json.loads((ROOT / 'data/catalog.json').read_text())['items']
catalog = {item['id']: item for item in items}
assert len(catalog) == len(items), 'Duplicate catalog IDs'
expected_files = set()


def image_size(path):
    with path.open('rb') as stream:
        header = stream.read(24)
        if header.startswith(b'\x89PNG\r\n\x1a\n') and header[12:16] == b'IHDR':
            return struct.unpack('>II', header[16:24])
        assert header.startswith(b'\xff\xd8'), path
        stream.seek(2)
        while stream.read(1) == b'\xff':
            marker = stream.read(1)
            while marker == b'\xff':
                marker = stream.read(1)
            length, = struct.unpack('>H', stream.read(2))
            assert length >= 2, path
            if marker in (b'\xc0', b'\xc1', b'\xc2'):
                _, height, width = struct.unpack('>BHH', stream.read(5))
                return width, height
            assert marker != b'\xda', path
            stream.seek(length - 2, 1)
    raise ValueError(f'Missing image dimensions: {path}')


published_ids = set()
for index in ('garment', 'head', 'pose'):
    manifest = json.loads((ROOT / f'data/{index}-images.json').read_text())
    for item in manifest['items']:
        ident = item['id']
        assert ident not in published_ids and item['name'], ident
        published_ids.add(ident)
        if index == 'pose':
            files = item['files']
            angles = {'front', 'diag', 'side', 'high', 'low', 'example-full', 'example'}
        else:
            files = item['views']
            angles = {'front', 'diag', 'side', 'back'}
        assert set(files) == angles and len(set(files.values())) == len(angles), ident
        entry = catalog[ident]
        views = {key: path for key, path in files.items() if not key.startswith('example')}
        assert entry['view_files'] == views and entry['image'] == views['front'], ident
        for key, value in item.items():
            if key not in ('views', 'files'):
                assert entry.get(key) == value, (ident, key)
        if index == 'pose':
            assert (entry['example'], entry['exampleFull']) == (files['example'], files['example-full']), ident
        expected_files.update(files.values())
        for angle, name in files.items():
            size = (360, 640) if angle == 'example' else (900, 1600)
            assert image_size(ROOT / name) == size, (ident, angle, name, size)
print(f'OK: {len(published_ids)} published groups with complete views and image dimensions')

assert set(catalog) == published_ids, 'Catalog contains inactive IDs'
actual_files = {str(p.relative_to(ROOT)) for p in (ROOT / 'assets').rglob('*') if p.is_file() and p.name != '.DS_Store'}
assert actual_files == expected_files, f'Unreferenced or missing assets: {sorted(actual_files ^ expected_files)[:10]}'
print(f'OK: {len(expected_files)} active files; no stale records or orphan files')
