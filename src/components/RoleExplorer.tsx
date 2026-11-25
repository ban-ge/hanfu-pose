import { useState } from 'react';
import hanOutfits from '../../data/han-role-outfits.json';
import tangOutfits from '../../data/tang-role-outfits.json';
import curatedOutfits from '../../data/song-role-outfits.json';
import yuanOutfits from '../../data/yuan-role-outfits.json';
import mingOutfits from '../../data/ming-role-outfits.json';
import qingOutfits from '../../data/qing-role-outfits.json';
import { CuratedRoleReferences, type CuratedRoleOutfit } from './CuratedRoleReferences';
import { RolePoseReferences } from './RolePoseReferences';
import { roleCatalog, seasonLayers } from '../roles';
import { matchesEra, matchesSeason, type ReferenceItem } from '../types';

type Props = { items: ReferenceItem[]; onUse: (description: string) => void; onViewImage: (id: string) => void };
const outfitsByEra: Record<string, CuratedRoleOutfit[]> = { 汉: hanOutfits, 唐: tangOutfits, 宋: curatedOutfits, 元: yuanOutfits, 明: mingOutfits, 清: qingOutfits };
const selectClass = 'mt-2 h-11 w-full rounded-lg border border-[#454b47] bg-[#303433] px-3 text-sm text-[#e8ebe5]';
const actionClass = 'rounded-lg border border-[#596b56] px-3 py-2 text-xs text-[#dce8d5] hover:bg-white/5';

export function RoleExplorer({ items, onUse, onViewImage }: Props) {
  const [roleName, setRoleName] = useState(roleCatalog[0].name);
  const role = roleCatalog.find(item => item.name === roleName)!;
  const [eraChoice, setEraChoice] = useState('明');
  const [genderChoice, setGenderChoice] = useState('男');
  const [season, setSeason] = useState('春');
  const [copied, setCopied] = useState('');
  const era = role.eras.includes(eraChoice) ? eraChoice : role.eras[0];
  const curatedOutfits = outfitsByEra[era];
  const genders = curatedOutfits ? curatedOutfits.filter(outfit => outfit.role === role.name).map(outfit => outfit.gender) : role.genders;
  const gender = genders.includes(genderChoice) ? genderChoice : genders[0];
  const curatedOutfit = curatedOutfits?.find(outfit => outfit.role === role.name && outfit.gender === gender);
  const roleNote = curatedOutfit ? curatedOutfit.note : role.note;
  const layers = seasonLayers[season];
  const usesSharedGarments = ['汉', '唐', '宋', '元', '明', '清'].includes(era);
  const referenceNames = (ids: string[]) => items.filter(item => ids.includes(item.id)).map(item => `${item.id} ${item.structure || item.name}`).join('、');
  const seasonalCostumes = curatedOutfit ? items.filter(item => curatedOutfit.costume.includes(item.id) && matchesSeason(item, season)).map(item => item.id) : [];
  const seasonalHeads = curatedOutfit ? items.filter(item => curatedOutfit.head.includes(item.id) && (!item.seasons?.length || matchesSeason(item, season))).map(item => item.id) : [];
  const inner = curatedOutfit?.availability === 'deferred' ? '此角色的汉代专属衣装暂缓，须先明确分期与依据。' : curatedOutfit ? (curatedOutfit.inner.length ? `${era}代题材，${gender}式跨季共享内搭候选：${referenceNames(curatedOutfit.inner)}；按外衣领襟和层次选配，只展示纯衣物。` : `${era}代${gender}童专用内衬待补，不直接套用成人尺寸。`) : usesSharedGarments ? `${era}代题材，${gender}式共享内搭：从基础中衣、衬裤或内裙中按外衣结构选择，不按角色或四季另生成；内搭穿于外衣内层。` : `${era}代题材，${gender}性，${role.name}，${season}季内搭参考：${layers.inner}；与外衣分开生成，重点展示裁剪、层次和系带。`;
  const outer = curatedOutfit?.availability === 'deferred' ? curatedOutfit.note : curatedOutfit ? `${era}代题材，${gender}式，${role.name}，${season}季外衣候选：${seasonalCostumes.length ? referenceNames(seasonalCostumes) : '当前季节暂无匹配，不自动列为补图任务'}。头饰候选：${seasonalHeads.length ? referenceNames(seasonalHeads) : role.name === '僧人' ? '剃发，无需人物头部图' : '当前季节暂无匹配'}。按用途分别选配，服装只展示纯衣物，冠帽独立展示，发髻只留头发饰物。` : `${era}代题材，${gender}性，${role.name}，${season}季外衣参考：${role.outer}；${layers.outer}。发型头饰：${role.head}。`;
  const text = `${inner}\n${outer}\n${roleNote ? `${roleNote}\n` : ''}原创时代题材设计，不声称历史复原；四张独立图片分别展示正面、斜侧、侧面、背面，保持同一服装结构、颜色和比例。`;
  const matchingItem = (kind: 'inner' | 'costume') => usesSharedGarments ? undefined : items.find(item => item.kind === kind && item.era === era && item.gender === gender && item.season === season && item.role === role.name);
  const imageId = matchingItem('costume')?.id;
  const innerId = matchingItem('inner')?.id;
  const sharedGarments = items.filter(item => matchesEra(item, era) && item.gender === gender && (item.kind === 'inner' || item.kind === 'costume') && matchesSeason(item, season));
  const progress = ['汉', '唐', '宋', '元', '明', '清'].map(dynasty => {
    const applicable = roleCatalog.filter(entry => entry.eras.includes(dynasty));
    const required = applicable.reduce((sum, entry) => sum + entry.genders.length * 4 * 2, 0);
    const completed = new Set(items.filter(item => item.era === dynasty && item.role && (item.kind === 'inner' || item.kind === 'costume') && item.season && applicable.some(entry => entry.name === item.role && entry.genders.some(value => value === item.gender))).map(item => [item.role, item.gender, item.season, item.kind].join('|'))).size;
    const outerCount = items.filter(item => matchesEra(item, dynasty) && item.kind === 'costume').length;
    const innerCount = items.filter(item => matchesEra(item, dynasty) && item.kind === 'inner').length;
    return { dynasty, required, completed, outerCount, innerCount };
  });
  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); setCopied('已复制'); }
    catch { setCopied('复制失败，请手动选择文字'); }
  };
  return <section id="roles" className="mt-12 scroll-mt-6 rounded-2xl border border-[#3a453a] bg-[#202922] p-5 sm:p-7">
    <p className="text-[10px] font-semibold tracking-[.2em] text-[#aec49f]">CHARACTER GUIDE / 角色服饰</p>
    <h2 className="mt-2 text-2xl font-semibold">按角色构建服饰方案</h2>
    <p className="mt-2 text-sm leading-6 text-[#a4b1a4]">选择角色、时期、造型和季节，生成可分别使用的内搭与外衣文字方案。方案是创作参考，需按具体历史资料核对。</p>
    <div aria-label="角色素材进度" className="mt-4 flex flex-wrap gap-2">{progress.map(({ dynasty, required, completed, outerCount, innerCount }) => <span key={dynasty} className="rounded-lg border border-[#4c5c4c] px-3 py-2 text-xs text-[#cbdcc5]">{['汉', '唐', '宋', '元', '明', '清'].includes(dynasty) ? `${dynasty}：可用外衣 ${outerCount} · 共享内衬 ${innerCount}` : `${dynasty}：已入库 ${completed} / ${required} 组`}</span>)}</div><p className="mt-2 text-xs leading-5 text-[#9eae9b]">汉、唐、宋、元、明、清按可用衣型统计（含适用通用款），内衬跨季共享；基础发型与配件跨朝代引用同一素材。素材形制仍需复核。</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-xs text-[#c8d3c5]">角色<select aria-label="角色" value={roleName} onChange={e => setRoleName(e.target.value)} className={selectClass}>{[...new Set(roleCatalog.map(item => item.group))].map(group => <optgroup key={group} label={group}>{roleCatalog.filter(item => item.group === group).map(item => <option key={item.name}>{item.name}</option>)}</optgroup>)}</select></label>
      <label className="text-xs text-[#c8d3c5]">时期<select aria-label="角色时期" value={era} onChange={e => setEraChoice(e.target.value)} className={selectClass}>{role.eras.map(item => <option key={item}>{item}</option>)}</select></label>
      <label className="text-xs text-[#c8d3c5]">造型<select aria-label="角色造型" value={gender} onChange={e => setGenderChoice(e.target.value)} className={selectClass}>{genders.map(item => <option key={item}>{item}</option>)}</select></label>
      <label className="text-xs text-[#c8d3c5]">季节<select aria-label="角色季节" value={season} onChange={e => setSeason(e.target.value)} className={selectClass}>{Object.keys(seasonLayers).map(item => <option key={item}>{item}</option>)}</select></label>
    </div>
    <div className="mt-5 grid gap-3 lg:grid-cols-2">{[{ title: '内衣内衬', value: inner }, { title: '外衣与头饰', value: outer }].map(({title, value}) => <div key={title} className="rounded-xl bg-[#19221b] p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-[#dce8d5]">{title}</h3><button type="button" className={actionClass} onClick={() => copy(value)}>复制</button></div><p className="mt-3 text-sm leading-6 text-[#b4c4b0]">{value}</p></div>)}</div>
    {!curatedOutfit && role.note && <p className="mt-3 text-xs leading-5 text-[#efd3a6]">{role.note}</p>}
    <p className="mt-3 text-xs leading-5 text-[#aebaa8]">{usesSharedGarments ? `${era}朝使用共享衣型，不再生成角色专属套装。下方按男女版型与季节列出可选素材；礼服、官服、甲衣及宗教服请按详情用途选择。` : imageId ? '此组合已有一组外衣四视角图。' : '此组合尚无专门生成的角色外衣图片。'}{usesSharedGarments ? '' : innerId ? ' 此组合已有角色专属内搭四视角图。' : ' 角色专属内搭尚未生成。'} </p>
    {curatedOutfit && <CuratedRoleReferences era={era} outfit={curatedOutfit} items={items} season={season} onViewImage={onViewImage} />}
    <RolePoseReferences role={role.name} items={items} onViewImage={onViewImage} />
    {usesSharedGarments && <label className="mt-4 block text-xs text-[#c8d3c5]">浏览当前版型的衣型（按用途自行搭配）<select aria-label={`${era}朝通用衣型`} value="" onChange={event => { if (event.target.value) onViewImage(event.target.value); }} className={selectClass}><option value="">选择一组，查看四视角与用途说明</option>{(['inner', 'costume'] as const).map(kind => <optgroup key={kind} label={kind === 'inner' ? '共享内衬 · 不分季节' : '外衣 · 当前季节建议'}>{sharedGarments.filter(item => item.kind === kind).map(item => <option key={item.id} value={item.id}>{item.id} {item.name}</option>)}</optgroup>)}</select></label>}
    <div className="mt-4 flex flex-wrap items-center gap-2"><button type="button" className={actionClass} onClick={() => { onUse(text); document.getElementById('combine')?.scrollIntoView({ behavior: 'smooth' }); }}>加入组合工作台</button><button type="button" className={actionClass} onClick={() => copy(text)}>复制完整方案</button>{imageId && <button type="button" className={actionClass} onClick={() => onViewImage(imageId)}>查看角色参考图</button>}{innerId && <button type="button" className={actionClass} onClick={() => onViewImage(innerId)}>查看角色内搭</button>}<span aria-live="polite" className="text-xs text-[#c5d7bc]">{copied}</span></div>
  </section>;
}
