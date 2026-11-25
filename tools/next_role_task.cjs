const fs = require('node:fs');
const ts = require('typescript');
const source = fs.readFileSync('src/roles.ts', 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exported = {};
new Function('exports', code)(exported);
const catalog = JSON.parse(fs.readFileSync('data/catalog.json', 'utf8')).items;
const requestedEra = process.argv[2];
const eras = requestedEra ? [requestedEra] : ['汉', '唐', '宋', '元', '明', '清'];
if (eras.some(era => !['汉', '唐', '宋', '元', '明', '清'].includes(era))) throw new Error('Unsupported era');
const seasons = ['春', '夏', '秋', '冬'];
const slots = new Set(catalog.filter(i => i.role && i.season && ['inner', 'costume'].includes(i.kind)).map(i => [i.era, i.role, i.gender, i.season, i.kind].join('|')));
const tasks = [];
for (const role of exported.roleCatalog) for (const gender of role.genders) for (const season of seasons) for (const era of eras) for (const kind of ['inner', 'costume']) {
  if (['汉', '唐', '宋', '元', '明', '清'].includes(era) || !role.eras.includes(era) || slots.has([era, role.name, gender, season, kind].join('|'))) continue;
  tasks.push({ era, role: role.name, gender, season, kind, outer: role.outer, head: role.head, note: role.note || '', seasonInfo: exported.seasonLayers[season] });
}
process.stdout.write(JSON.stringify({ note: '汉、唐、宋、元、明、清已改为精选共享衣型，不产生角色矩阵补图任务；其他朝代缺项仅供旧数据盘点。', remaining: tasks.length, next: tasks[0] || null }));
