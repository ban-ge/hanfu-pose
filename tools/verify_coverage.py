"""Verify current six-era coverage, including role mappings and child proportions."""
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
read = lambda p: json.loads((ROOT / p).read_text())
items = read('data/catalog.json')['items']
by_id = {i['id']: i for i in items}
eras = {'han': '汉', 'tang': '唐', 'song': '宋', 'yuan': '元', 'ming': '明', 'qing': '清'}
roles_source = (ROOT / 'src/roles.ts').read_text()
expected_pairs = {
    (name, gender)
    for name, genders in re.findall(r"name: '([^']+)', genders: \[([^\]]+)\]", roles_source)
    if name != '格格'
    for gender in re.findall(r"'([男女])'", genders)
}

def applicable(item, era):
    return item['era'] == era or item['era'] == '通用' and era in item.get('applicable_eras', list(eras.values()))

def seasons(item):
    return item.get('seasons', [item.get('season')])

summary = {}
for slug, era in eras.items():
    own = [i for i in items if i['era'] == era]
    families = {}
    for item in [i for i in items if applicable(i, era)]:
        if item['kind'] == 'costume':
            assert item.get('costume_family'), item['id']
            families.setdefault((item['gender'], item['costume_family']), []).append(item)
    unrepresented = [(g, f, s) for (g, f), group in families.items() for s in '春夏秋冬' if not any(i.get('season_scope') == '不分季节' or s in seasons(i) for i in group)]
    roles = read(f'data/{slug}-role-outfits.json')
    pairs = expected_pairs | ({('格格', '女')} if era == '清' else set())
    assert len(roles) == len(pairs) and {(r['role'], r['gender']) for r in roles} == pairs, era
    for row in roles:
        assert row.get('availability') != 'deferred', (era, row['role'])
        for kind in ['inner', 'costume', 'head']:
            assert row[kind] or kind == 'head' and row['role'] == '僧人', (era, row['role'], kind)
            assert len(row[kind]) == len(set(row[kind])), (era, row['role'], kind, 'duplicate')
            for ident in row[kind]:
                assert ident in by_id, ident
                item = by_id[ident]
                assert item['kind'] == kind and applicable(item, era), (era, row['role'], ident)
                assert item['gender'] in [row['gender'], '通用'], (era, row['role'], ident)
                if row['role'] == '儿童' and kind in ['inner', 'costume']:
                    assert item.get('age') == '儿童', (era, ident, 'child proportions')
                if kind == 'inner':
                    assert item.get('season_scope') == '不分季节', ident
    summary[era] = dict(groups=len(own), kinds=dict(Counter(i['kind'] for i in own)), families=len(families), role_gender_options=len(roles), seasons_without_tagged_candidates=unrepresented)
for item in items:
    if item['kind'] in ['costume', 'inner']:
        assert item['presentation'] == 'garment-only', item['id']
    if item.get('seasons'):
        assert set(item['seasons']) <= set('春夏秋冬'), (item['id'], 'invalid season')
    if item.get('season'):
        assert item['season'] in list('春夏秋冬'), (item['id'], 'invalid season')
    if item['kind'] == 'head':
        assert item['head_type'] in ['hairstyle', 'headwear'], item['id']
        assert item['presentation'] == {'hairstyle': 'hair-only', 'headwear': 'headwear-only'}[item['head_type']], item['id']
    assert len(set(item['view_files'].values())) == 4, item['id']
    assert all((ROOT/p).is_file() for p in item['view_files'].values()), item['id']
# Distinguish non-combat military duty from armor and civilian bird badges.
ming = read('data/ming-role-outfits.json')
warrior = next(r for r in ming if r['role'] == '武官／将军')
civilian = next(r for r in ming if r['role'] == '文官')
assert any(by_id[i].get('costume_family') == '一二品武官狮补常服' for i in warrior['costume'])
assert not set(warrior['costume']) & set(civilian['costume'])

qing = read('data/qing-role-outfits.json')
boy = next(r for r in qing if r['role'] == '儿童' and r['gender'] == '男')
assert any('瓜皮帽' in by_id[i]['name'] for i in boy['head'])
warrior = next(r for r in qing if r['role'] == '武官／将军')
civilian = next(r for r in qing if r['role'] == '文官')
assert {by_id[i]['costume_family'] for i in warrior['costume']} == {'二品武官补褂', '军旅钉甲'}
assert not set(warrior['costume']) & set(civilian['costume'])
print(json.dumps(dict(groups=len(items), views=len(items)*4, eras=summary, season_policy='季节为适用标签，不要求四季满格；无候选不自动构成补图任务', visual_and_historical_accuracy='需另行复核'), ensure_ascii=False, indent=2))
