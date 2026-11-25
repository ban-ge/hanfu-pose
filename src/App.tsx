import { useMemo, useState } from 'react';
import { Button } from '@heroui/react';
import { BookOpen, ChevronDown, Image, Layers3, RotateCcw, Search, Shirt, SlidersHorizontal, Sparkles, UserRound } from 'lucide-react';
import catalog from '../data/catalog.json';
import { CostumeFamilyGallery } from './components/CostumeFamilyGallery';
import { ReferenceCard } from './components/ReferenceCard';
import { DetailDialog } from './components/DetailDialog';
import { Workbench } from './components/Workbench';
import { RoleExplorer } from './components/RoleExplorer';
import { angles, categoryOf, kindLabels, matchesEra, choiceSlot, matchesSeason, seasonLabel, viewLabels, type Angle, type ReferenceChoices, type Kind, type ReferenceItem } from './types';

type Choices = ReferenceChoices;
const items = catalog.items as ReferenceItem[];
const poseCategories = [...new Set(items.filter(item => item.kind === 'pose').map(categoryOf))];
const nav: { kind: Kind; icon: typeof UserRound; hint: string }[] = [
  { kind: 'pose', icon: UserRound, hint: '动作与形态' },
  { kind: 'inner', icon: Shirt, hint: '基础内搭' },
  { kind: 'costume', icon: Layers3, hint: '历代与四季' },
  { kind: 'head', icon: Sparkles, hint: '发式与头饰' },
];
const controlClass = 'h-11 w-full rounded-lg border border-[#454b47] bg-[#303433] px-3 text-sm text-[#e8ebe5] outline-none hover:border-[#777f76]';


export const App = () => {
  const [kind, setKind] = useState<Kind>('pose');
  const [query, setQuery] = useState('');
  const [era, setEra] = useState('all');
  const [gender, setGender] = useState('all');
  const [season, setSeason] = useState('all');
  const [age, setAge] = useState('all');
  const [headType, setHeadType] = useState('all');
  const [headScope, setHeadScope] = useState('all');
  const [category, setCategory] = useState('all');
  const [globalAngle, setGlobalAngle] = useState<Angle | 'all'>('all');
  const [cardAngles, setCardAngles] = useState<Record<string, Angle>>({});
  const [choices, setChoices] = useState<Choices>({});
  const [detail, setDetail] = useState<ReferenceItem | null>(null);
  const [scene, setScene] = useState('');
  const counts = useMemo(() => Object.fromEntries(nav.map(({ kind: key }) => [key, items.filter(item => item.kind === key).length])) as Record<Kind, number>, []);
  const matchingItems = items.filter(item => (kind !== 'head' || ((headType === 'all' || item.head_type === headType) && (headScope === 'all' || (headScope === 'shared' ? item.era === '通用' : item.era !== '通用')))) && item.kind === kind && matchesEra(item, era) && (gender === 'all' || item.gender === gender || item.gender === '通用') && (kind !== 'pose' || category === 'all' || categoryOf(item) === category) && (kind !== 'head' || age === 'all' || ((item.age || '未标年龄') === age || !!item.applicable_ages?.includes(age))) && (!query.trim() || [item.name, item.id, item.summary, item.era, item.gender, seasonLabel(item), item.role, item.age, item.occasion, item.structure, item.costume_family, item.applicable_roles?.join(' '), item.props, categoryOf(item)].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) && (globalAngle === 'all' || !!item.view_files[globalAngle]));
  const filtered = matchingItems.filter(item => (kind !== 'costume' && kind !== 'inner') || matchesSeason(item, season));
  const showFamilies = kind === 'costume' && ['汉', '唐', '宋', '元', '明', '清'].includes(era) && (season === 'all' || ['春', '夏', '秋', '冬'].includes(season));
  const selectedCount = Object.values(choices).filter(Boolean).length;
  const angleFor = (item: ReferenceItem): Angle => cardAngles[item.id] || (globalAngle !== 'all' && item.view_files[globalAngle] ? globalAngle : 'front');
  const setAngle = (item: ReferenceItem, angle: Angle) => setCardAngles(current => ({ ...current, [item.id]: angle }));
  const changeKind = (next: Kind) => { setKind(next); setCategory('all'); };
  const reset = () => { setQuery(''); setEra('all'); setGender('all'); setSeason('all'); setAge('all'); setHeadType('all'); setHeadScope('all'); setCategory('all'); setGlobalAngle('all'); setCardAngles({}); };
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
        <main className="mx-auto max-w-[1900px] px-5 pb-24 pt-8 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-[10px] font-semibold tracking-[.2em] text-[#a8b896]">REFERENCE LIBRARY / 参考图鉴</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">让灵感，有形可循<span className="ml-2 text-[#d0e49d]">.</span></h1><p className="mt-3 text-sm leading-6 text-[#9ca69c]">选择姿势、内搭、衣装与发饰，组合属于你的古代人物。<a href="#roles" className="ml-3 text-[#d3e6a0] underline">查看角色服饰方案</a></p></div><div className="flex items-center gap-2 text-xs text-[#949d93]"><span className="size-1.5 rounded-full bg-[#c7df94]" />原创参考素材 · 当前 {items.length} 组</div></div>
          <div className="mt-8 flex gap-2 overflow-x-auto border-b border-[#303531]" role="group" aria-label="素材类别">{nav.map(({ kind: key, icon: Icon, hint }) => <button key={key} type="button" onClick={() => changeKind(key)} aria-pressed={kind === key} className={`flex shrink-0 items-center gap-2 border-b-2 px-4 pb-3 text-sm transition ${kind === key ? 'border-[#cde2a0] text-[#e6f1d1]' : 'border-transparent text-[#949d94] hover:text-white'}`}><Icon size={16} /><span>{kindLabels[key]}</span><span className="hidden text-xs text-[#858f84] sm:inline">{hint}</span><span className="rounded-md bg-white/7 px-1.5 py-0.5 text-[10px]">{counts[key]}</span></button>)}</div>
          <section aria-label="筛选参考素材" className="mt-6 rounded-2xl bg-[#242729] p-4 sm:p-5"><div className="flex flex-wrap gap-3"><label className="relative min-w-[220px] flex-[2]"><Search size={18} className="pointer-events-none absolute left-3 top-3.5 text-[#9ba39b]" /><input value={query} onChange={event => setQuery(event.target.value)} aria-label="搜索名称、编号或分类" placeholder="搜索名称、编号、角色、分类或时期..." className={`${controlClass} pl-10 placeholder:text-[#8e9690]`} /></label><label className="relative min-w-[120px] flex-1"><span className="sr-only">时期</span><select value={era} onChange={event => setEra(event.target.value)} className={`${controlClass} appearance-none pr-8`}><option value="all">全部时期</option><option value="通用">通用</option><option value="汉">汉</option><option value="唐">唐</option><option value="宋">宋</option><option value="元">元</option><option value="明">明</option><option value="清">清</option></select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-3.5 text-[#929b92]" /></label><label className="relative min-w-[110px] flex-1"><span className="sr-only">造型</span><select value={gender} onChange={event => setGender(event.target.value)} className={`${controlClass} appearance-none pr-8`}><option value="all">全部造型</option><option value="女">女</option><option value="男">男</option><option value="通用">通用</option></select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-3.5 text-[#929b92]" /></label>{(kind === 'costume' || kind === 'inner') && <label className="relative min-w-[120px] flex-1"><span className="sr-only">季节</span><select value={season} onChange={event => setSeason(event.target.value)} className={`${controlClass} appearance-none pr-8`}><option value="all">全部季节</option>{['春','夏','秋','冬','不分季节','未标季节'].map(value => <option key={value} value={value}>{value.length === 1 ? `${value}季` : value}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-3.5 text-[#929b92]" /></label>}{kind === 'head' && <label className="relative min-w-[120px] flex-1"><span className="sr-only">参考年龄</span><select value={age} onChange={event => setAge(event.target.value)} className={`${controlClass} appearance-none pr-8`}><option value="all">全部年龄</option>{['儿童','少年','青年','中年','老年','成年','中老年','未标年龄'].map(value => <option key={value} value={value}>{value}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-3.5 text-[#929b92]" /></label>}{kind === 'pose' && <label className="relative min-w-[120px] flex-1"><span className="sr-only">动作分类</span><select value={category} onChange={event => setCategory(event.target.value)} className={`${controlClass} appearance-none pr-8`}><option value="all">全部动作分类</option>{poseCategories.map(value => <option key={value}>{value}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-3.5 text-[#929b92]" /></label>}<Button variant="ghost" onPress={reset} className="!h-11 !rounded-lg !px-3 !text-[#d2d8d0]"><RotateCcw size={16} />重置</Button></div><div className="mt-4 flex flex-wrap items-center gap-2"><SlidersHorizontal size={15} className="mr-1 text-[#9aa29a]" /><span className="mr-1 text-xs text-[#aeb7ae]">视角</span>{(['all', ...angles] as const).map(key => <button key={key} type="button" onClick={() => setView(key)} aria-pressed={globalAngle === key} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${globalAngle === key ? 'bg-[#dbe9bb] text-[#263022]' : 'text-[#abb2ab] hover:bg-white/8 hover:text-white'}`}>{key === 'all' ? '全部视角' : viewLabels[key]}</button>)}</div></section>
          {kind === 'pose' && <p className="mt-4 text-xs leading-6 text-[#aeb7ae]">通用动作参考：无脸灰衣模型，服装与头饰另选。可搜索角色名称，或在角色方案中查看适用姿势；儿童使用独立比例。</p>}
          {['元', '明', '清'].includes(era) && <p className="mt-4 text-xs leading-6 text-[#efd3a6]">{era}朝按独特衣型精简复用，内衬跨季共享；冠帽盔只保留物件，发髻只保留头发与饰物。按用途选择已有衣型；季节仅作适用建议，不强制每季单独生成。{era === '元' && '蒙古宫廷／行旅与汉地日常衣装分别标注，请按族群、地域与场合选配。'}{era === '清' && '以清中晚期主要形象为范围，区分旗人、汉地衣装与朝服、吉服、便服；补褂仅列一品文官、二品武官代表款，僧道基础款与明代题材共享。'}</p>}
          {era === '汉' && <p className="mt-4 text-xs leading-6 text-[#efd3a6]">汉朝按日常、宫廷、军旅、劳动、儿童和舞乐衣型共享；冠服注明西汉／东汉参考边界。内衬跨季复用，外衣按用途和实际季节差异选择。</p>}
          {era === '宋' && <p className="mt-4 text-xs leading-6 text-[#efd3a6]">宋朝保留款已去人物，按衣型与共享内衬复用；基础发型与配件改用通用素材，朝代专属款按身份搭配。按用途选择已有衣型；有明显厚薄差异时再区分季节款。</p>}
          {kind === 'head' && <div className="mt-4 flex flex-wrap items-center gap-3" aria-label="发型头饰分类">
            <label className="text-xs text-[#aeb7ae]">类型<select aria-label="发型或头饰" value={headType} onChange={e => setHeadType(e.target.value)} className={`${controlClass} mt-2`}><option value="all">全部类型</option><option value="hairstyle">发型 · 含配套簪饰</option><option value="headwear">头饰 · 冠帽盔巾</option></select></label>
            <label className="text-xs text-[#aeb7ae]">适用范围<select aria-label="头部素材范围" value={headScope} onChange={e => setHeadScope(e.target.value)} className={`${controlClass} mt-2`}><option value="all">朝代特有 + 适用通用款</option><option value="shared">仅通用款</option><option value="specific">仅朝代特有款</option></select></label>
            <p className="max-w-2xl text-xs leading-6 text-[#939d93]">发型与独立头饰可分别加入配方。基础髻式、布巾、笠帽跨朝代共享；冠冕、官帽、军盔及特征发式按时代保留。通用款仍须核对族群、年龄、场合和佩戴空间。</p>
          </div>}
          <div className="mb-4 mt-8 flex items-center justify-between gap-4"><div><h2 className="text-base font-semibold">{kindLabels[kind]}图鉴 <span className="ml-2 text-xs font-normal text-[#939d93]">{filtered.length} 组</span></h2><p className="mt-1 text-xs text-[#8e988e]">点击缩略图切换视角，点击大图查看详情</p></div><div className="hidden items-center gap-1.5 text-xs text-[#98a397] sm:flex"><Image size={14} />独立视角图</div></div>
          {showFamilies && matchingItems.length ? <CostumeFamilyGallery items={matchingItems} season={season} renderItem={item => <ReferenceCard key={item.id} item={item} angle={angleFor(item)} selected={choices[choiceSlot(item)]?.item.id === item.id && choices[choiceSlot(item)]?.angle === angleFor(item)} onAngle={angle => setAngle(item, angle)} onOpen={() => setDetail(item)} onSelect={() => select(item, angleFor(item))} />} /> : filtered.length ? <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">{filtered.map(item => <ReferenceCard key={item.id} item={item} angle={angleFor(item)} selected={choices[choiceSlot(item)]?.item.id === item.id && choices[choiceSlot(item)]?.angle === angleFor(item)} onAngle={angle => setAngle(item, angle)} onOpen={() => setDetail(item)} onSelect={() => select(item, angleFor(item))} />)}</div> : <div className="rounded-2xl border border-dashed border-[#414943] px-5 py-16 text-center text-sm text-[#a0aaa0]">没有匹配的素材，请调整筛选条件。</div>}
          <RoleExplorer items={items} onUse={description => setScene(current => current.trim() ? `${current.trim()}\n\n${description}` : description)} onViewImage={id => { const item = items.find(entry => entry.id === id); if (item) { setKind(item.kind); setEra('all'); setGender('all'); setSeason('all'); setAge('all'); setHeadType('all'); setHeadScope('all'); setCategory('all'); setQuery(id); setDetail(item); } }} />
          <Workbench choices={choices} scene={scene} onSceneChange={setScene} onRemove={key => setChoices(current => { const next = { ...current }; delete next[key]; return next; })} />
          <footer id="about" className="mt-12 flex flex-wrap justify-between gap-3 border-t border-[#303531] pt-6 text-xs leading-6 text-[#89948a]"><p>图片为 AI 原创时代题材设计，形制和视角细节需复核，不代表严格历史复原。</p><p>形与衣 · FORM & ATTIRE</p></footer>
        </main>
      </div>
      {detail && <DetailDialog item={detail} angle={angleFor(detail)} onAngle={angle => setAngle(detail, angle)} onClose={() => setDetail(null)} onSelect={() => { select(detail, angleFor(detail)); setDetail(null); }} />}
    </div>
  );
};
