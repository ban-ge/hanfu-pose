#!/usr/bin/env python3
"""Check catalog integrity and referenced PNGs, not image or historical accuracy."""
import json
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
items = json.loads((ROOT / 'data/catalog.json').read_text())['items']
seen = set()
for item in items:
    ident = item['id']
    assert ident not in seen, f'duplicate id: {ident}'
    seen.add(ident)
    assert item['kind'] in ('pose', 'inner', 'costume', 'head')
    assert item['status'] and item['review'], ident
    if ident != 'I020' or 'prompt' in item:
        assert item['prompt'], ident  # I020 has no archived generation prompt.
    assert set(item['view_files']) == {'front', 'diag', 'side', 'back'}, ident
    for name in [item['image'], *item['view_files'].values()]:
        path = ROOT / name
        assert path.is_file(), f'missing: {name}'
        with path.open('rb') as f:
            header = f.read(24)
        assert header[:8] == b'\x89PNG\r\n\x1a\n' and header[12:16] == b'IHDR', f'invalid PNG: {name}'
        width, height = struct.unpack('>II', header[16:24])
        assert width >= 300 and height >= 300, f'low resolution: {name}'
print(f"OK: {len(items)} groups, {len(items)*4} individual view files, source sheets and required metadata")


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
        for angle, name in files.items():
            size = (360, 640) if angle == 'example' else (900, 1600)
            assert image_size(ROOT / name) == size, (ident, angle, name, size)
print(f'OK: {len(published_ids)} published groups with complete views and image dimensions')
