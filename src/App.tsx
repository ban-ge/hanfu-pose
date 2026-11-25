import { useState } from 'react';
import { Button } from '@heroui/react';
import { BookOpen, Image, Layers3, RotateCcw, Search, SlidersHorizontal, Sparkles, UserRound } from 'lucide-react';
import { items, displayTitle, sortFacetOptions } from './library';
import { ReferenceCard } from './components/ReferenceCard';
import { DetailDialog } from './components/DetailDialog';
import { Workbench } from './components/Workbench';
import { poseAngles, assetAngles, kindLabels, choiceSlot, viewLabels, type Angle, type ReferenceChoices, type Kind, type ReferenceItem } from './types';

type Choices = ReferenceChoices;
const nav: { kind: Kind; icon: typeof UserRound; hint: string }[] = [
  { kind: 'pose', icon: UserRound, hint: '动作与形态' },
  { kind: 'costume', icon: Layers3, hint: '历代与四季' },
  { kind: 'head', icon: Sparkles, hint: '发式与头饰' },
];
const controlClass = 'h-11 w-full rounded-lg border border-[#454b47] bg-[#303433] px-3 text-sm text-[#e8ebe5] outline-none hover:border-[#777f76]';


export const App = () => {
  const [kind, setKind] = useState<Kind>('pose');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [globalAngle, setGlobalAngle] = useState<Angle | 'all'>('all');
  const [cardAngles, setCardAngles] = useState<Record<string, Angle>>({});
  const [choices, setChoices] = useState<Choices>({});
  const [detail, setDetail] = useState<ReferenceItem | null>(null);
  const [scene, setScene] = useState('');
  const group = items.filter(item => choiceSlot(item) === kind);
  const counts = Object.fromEntries(nav.map(({ kind: key }) => [key, items.filter(item => choiceSlot(item) === key).length]));
  const facets: Record<string, (item: ReferenceItem) => string[]> = {};
  if (kind !== 'pose') facets['朝代'] = item => [item.era, ...(item.applicable_eras ?? [])].map(value =>
    value === '晚清' ? '清' : value === '国民政府时期（1927–1949）' ? '民国' : value);
  facets['性别'] = item => [item.gender];
  facets['分类'] = item => [item.head_type === 'hairstyle' ? '发型' : item.kind === 'head' ? '头饰'
    : item.kind === 'inner' ? '内搭' : item.costume_family || item.pose_category || '其他'];
  if (kind !== 'head') facets['年龄'] = item => item.age ? [item.age] : [];
  if (kind === 'costume') facets['季节'] = item => item.season_scope ? [item.season_scope] : item.seasons ?? [];
  const filtered = group.filter(item => (item.name + item.id + displayTitle(item)).toLowerCase().includes(query.trim().toLowerCase()) &&
    Object.entries(facets).every(([key, values]) => !filters[key] || values(item).includes(filters[key])) &&
    (globalAngle === 'all' || item.view_files[globalAngle]));
  const selectedCount = Object.values(choices).filter(Boolean).length;
  const angleFor = (item: ReferenceItem): Angle => cardAngles[item.id] || (globalAngle !== 'all' && item.view_files[globalAngle] ? globalAngle : 'front');
  const setAngle = (item: ReferenceItem, angle: Angle) => setCardAngles(current => ({ ...current, [item.id]: angle }));
  const changeKind = (next: Kind) => { setKind(next); setFilters({}); setQuery(''); setView('all'); window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); };
  const reset = () => { setQuery(''); setFilters({}); setView('all'); };
  const setView = (next: Angle | 'all') => { setGlobalAngle(next); setCardAngles({}); };
  const select = (item: ReferenceItem, angle: Angle) => setChoices(current => ({ ...current, [choiceSlot(item)]: { item, angle } }));


  return (
    <div className="min-h-screen bg-[#111314] text-[#f2f3ef]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[76px] flex-col items-center border-r border-[#303531] bg-[#1d2422] py-6 md:flex">
        <a href="#top" aria-label="形与衣首页" className="grid size-10 place-items-center rounded-xl bg-[#d3e6a0] font-serif text-xl font-bold text-[#263223]">形</a>
        <div className="mt-12 flex w-full flex-col items-center gap-3">{nav.map(({ kind: key, icon: Icon }) => <button key={key} type="button" onClick={() => changeKind(key)} aria-label={kindLabels[key]} aria-current={kind === key ? 'page' : undefined} title={kindLabels[key]} className={`grid size-11 place-items-center rounded-xl transition ${kind === key ? 'bg-[#cbd9ae] text-[#263124]' : 'text-[#9aa69a] hover:bg-white/10 hover:text-white'}`}><Icon size={19} /></button>)}</div>
        <a href="#about" aria-label="关于图库" className="mt-auto grid size-10 place-items-center rounded-lg text-[#98a69a] hover:bg-white/10"><BookOpen size={18} /></a>
      </aside>
      <div id="top" className="md:pl-[76px]">
        <header className="border-b border-[#303531] px-5 py-4 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-[1900px] items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#d3e6a0] font-serif text-xl font-bold text-[#263223] md:hidden">形</div><div><p className="text-[10px] font-medium tracking-[.24em] text-[#a4b297]">FORM & ATTIRE</p><p className="mt-1 text-sm font-semibold tracking-wide">形与衣 <span className="ml-2 hidden font-normal text-[#929b92] sm:inline">古代人物参考图鉴</span></p></div></div><a href="#combine" className="flex items-center gap-2 rounded-full border border-[#4b554a] px-4 py-2 text-xs font-medium text-[#dbe7cf] hover:bg-white/5"><Layers3 size={15} />组合工作台 <span className="grid size-5 place-items-center rounded-full bg-[#d3e6a0] text-[10px] font-bold text-[#263223]">{selectedCount}</span></a></div></header>
        <main className="@container mx-auto max-w-[1900px] px-5 pb-24 pt-8 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-[10px] font-semibold tracking-[.2em] text-[#a8b896]">REFERENCE LIBRARY / 参考图鉴</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">让灵感，有形可循<span className="ml-2 text-[#d0e49d]">.</span></h1><p className="mt-3 text-sm leading-6 text-[#9ca69c]">选择姿势、内搭、衣装与发饰，组合属于你的古代人物。</p></div><div className="flex items-center gap-2 text-xs text-[#949d93]"><span className="size-1.5 rounded-full bg-[#c7df94]" />原创参考素材 · 当前 {items.length} 组</div></div>
          <div className="mt-8 flex gap-2 overflow-x-auto border-b border-[#303531]" role="group" aria-label="素材类别">{nav.map(({ kind: key, icon: Icon, hint }) => <button key={key} type="button" onClick={() => changeKind(key)} aria-pressed={kind === key} className={`flex shrink-0 items-center gap-2 border-b-2 px-4 pb-3 text-sm transition ${kind === key ? 'border-[#cde2a0] text-[#e6f1d1]' : 'border-transparent text-[#949d94] hover:text-white'}`}><Icon size={16} /><span>{kindLabels[key]}</span><span className="hidden text-xs text-[#858f84] sm:inline">{hint}</span><span className="rounded-md bg-white/7 px-1.5 py-0.5 text-[10px]">{counts[key]}</span></button>)}</div>
          <section aria-label="筛选参考素材" className="mt-6 rounded-2xl bg-[#242729] p-4 sm:p-5">
            <div className="flex flex-wrap gap-3">
              <label className="relative min-w-44 flex-[2]"><Search size={18} className="absolute left-3 top-3.5" />
                <input value={query} onChange={e => setQuery(e.target.value)} aria-label="搜索名称或编号" placeholder="搜索名称或编号" className={controlClass + ' pl-10'} /></label>
              {Object.entries(facets).map(([key, values]) => <select key={key} aria-label={key} value={filters[key] || ''} onChange={e => setFilters({ ...filters, [key]: e.target.value })} className={controlClass + ' min-w-24 flex-1'}>
                <option value="">全部{key}</option>
                {sortFacetOptions(key, group.flatMap(values)).map(value => <option key={value}>{value}</option>)}
              </select>)}
              <Button variant="ghost" onPress={reset}><RotateCcw size={16} />重置</Button>
            </div><div className="mt-4 flex flex-wrap items-center gap-2"><SlidersHorizontal size={15} className="mr-1 text-[#9aa29a]" /><span className="mr-1 text-xs text-[#aeb7ae]">视角</span>{(['all', ...(kind === 'pose' ? poseAngles : assetAngles)] as const).map(key => <button key={key} type="button" onClick={() => setView(key)} aria-pressed={globalAngle === key} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${globalAngle === key ? 'bg-[#dbe9bb] text-[#263022]' : 'text-[#abb2ab] hover:bg-white/8 hover:text-white'}`}>{key === 'all' ? '全部视角' : viewLabels[key]}</button>)}</div></section>
          <div className="mb-4 mt-8 flex items-center justify-between gap-4"><div><h2 className="text-base font-semibold">{kindLabels[kind]}图鉴 <span className="ml-2 text-xs font-normal text-[#939d93]">{filtered.length} 组</span></h2><p className="mt-1 text-xs text-[#8e988e]">悬停缩略图切换预览，点击视角加入配方，点击主图放大</p></div><div className="hidden items-center gap-1.5 text-xs text-[#98a397] sm:flex"><Image size={14} />独立视角图</div></div>
          {filtered.length ? <div className="reference-grid">{filtered.map(item => <ReferenceCard key={item.id} item={item} angle={globalAngle === 'all' ? undefined : globalAngle} selected={choices[choiceSlot(item)]?.item.id === item.id} onOpen={() => setDetail(item)} onSelect={angle => select(item, angle)} />)}</div> : <div className="rounded-2xl border border-dashed border-[#414943] px-5 py-16 text-center text-sm text-[#a0aaa0]">没有匹配的素材，请调整筛选条件。</div>}
          <Workbench onPick={slot => {
            reset();
            changeKind(slot);
          }} choices={choices} scene={scene} onSceneChange={setScene} onRemove={key => setChoices(current => { const next = { ...current }; delete next[key]; return next; })} />
          <footer id="about" className="mt-12 flex flex-wrap justify-between gap-3 border-t border-[#303531] pt-6 text-xs leading-6 text-[#89948a]"><p>图片为 AI 原创时代题材设计，形制和视角细节需复核，不代表严格历史复原。</p><p>形与衣 · FORM & ATTIRE</p></footer>
        </main>
      </div>
      {detail && <DetailDialog item={detail} angle={angleFor(detail)} onAngle={angle => setAngle(detail, angle)} onClose={() => setDetail(null)} onSelect={() => { select(detail, angleFor(detail)); setDetail(null); }} />}
    </div>
  );
};
