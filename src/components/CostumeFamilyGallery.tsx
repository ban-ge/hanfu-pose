import type { ReactNode } from 'react';
import { matchesSeason, type ReferenceItem } from '../types';

type Props = {
  items: ReferenceItem[];
  season: string;
  renderItem: (item: ReferenceItem) => ReactNode;
};

export function CostumeFamilyGallery({ items, season, renderItem }: Props) {
  const families = [...new Set(items.map(item => item.costume_family!))];
  return <div className="space-y-7" aria-label="衣型与用途分类">
    <p className="text-xs leading-6 text-[#aeb7ae]">按独特衣型与用途收录，季节仅用于筛选适用款；没有明显结构差异时共用，不要求每类覆盖四季。</p>
    {families.map(family => {
      const available = items.filter(item => item.costume_family === family && matchesSeason(item, season));
      return <section key={family} aria-label={family} className="border-t border-[#303531] pt-5">
        <h3 className="mb-4 text-sm font-semibold text-[#dce8ce]">{family}<span className="ml-3 text-xs font-normal text-[#9da898]">{available.length ? `${available.length} 组` : `${season.length === 1 ? `${season}季` : season} · 暂无匹配`}</span></h3>
        {available.length ? <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">{available.map(renderItem)}</div> : <p className="rounded-xl border border-dashed border-[#414943] px-5 py-6 text-sm text-[#a0aaa0]">当前筛选暂无适用素材，可切换全部季节查看；不自动列为补图任务。</p>}
      </section>;
    })}
  </div>;
}
