import { matchesSeason, type ReferenceItem } from '../types';
export type CuratedRoleOutfit = { role: string; gender: string; inner: string[]; costume: string[]; head: string[]; note: string; availability?: string };

type Props = {
  outfit: CuratedRoleOutfit;
  era: string;
  items: ReferenceItem[];
  season: string;
  onViewImage: (id: string) => void;
};

export function CuratedRoleReferences({ era, outfit, items, season, onViewImage }: Props) {
  if (outfit.availability === 'deferred') return <p className="mt-4 rounded-xl border border-[#4c5c4c] p-4 text-xs leading-6 text-[#efd3a6]">该角色暂缓专属素材：{outfit.note}</p>;
  return <div className="mt-4 rounded-xl border border-[#4c5c4c] p-4" aria-label={`${era}朝角色素材搭配`}>
    <h3 className="text-sm font-semibold text-[#dce8d5]">当前角色可复用素材</h3>
    <p className="mt-2 text-xs leading-5 text-[#aebaa8]">按用途选配，礼冠与常服不机械组合；外衣与已标夏冬的冠帽按季节筛选，内衬跨季共用。</p>
    {(['inner', 'costume', 'head'] as const).map(kind => {
      const available = items.filter(item => outfit[kind].includes(item.id) && ((kind !== 'costume' && !(kind === 'head' && item.seasons?.length)) || matchesSeason(item, season)));
      const label = { inner: '共享内衬', costume: `${season}季外衣`, head: '头饰／发髻' }[kind];
      return <div key={kind} className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#c8d3c5]">{label}</span>
        {available.map(item => <button key={item.id} type="button" onClick={() => onViewImage(item.id)} className="rounded-lg border border-[#596b56] px-3 py-2 text-xs text-[#dce8d5] hover:bg-white/5">{item.id} · {item.structure || item.name}</button>)}
        {!available.length && <span className="text-xs text-[#efd3a6]">{kind === 'head' && outfit.role === '僧人' ? '剃发，无需生成头部人物图' : outfit[kind].length ? '当前季节暂无匹配，不自动列为补图任务' : '待补'}</span>}
      </div>;
    })}
    {outfit.note && <p className="mt-3 text-xs leading-5 text-[#efd3a6]">{outfit.note}</p>}
  </div>;
}
