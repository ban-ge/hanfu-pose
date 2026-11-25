import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import { angles, assetUrl, categoryOf, kindLabels, slotLabels, choiceSlot, viewLabels, type Angle, type ReferenceItem } from '../types';

type Props = {
  item: ReferenceItem;
  angle: Angle;
  selected: boolean;
  onAngle: (angle: Angle) => void;
  onOpen: () => void;
  onSelect: () => void;
};

export const ReferenceCard = ({ item, angle, selected, onAngle, onOpen, onSelect }: Props) => {
  const image = item.view_files[angle];
  const garment = item.kind === 'costume' || item.kind === 'inner';
  if (!image) return null;
  return (
    <article className="min-w-0 rounded-2xl bg-[#242729] p-2.5 sm:p-3">
      <div className="relative overflow-hidden rounded-xl bg-[#e8e4de]">
        <button type="button" onClick={onOpen} aria-label={`查看${item.name}详情`} className="block w-full cursor-zoom-in">
          <img src={assetUrl(image)} alt={`${item.name} ${viewLabels[angle]}参考图`} loading="lazy" width={900} height={1600} className="block h-auto w-full" />
        </button>
        <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-bold text-white">{item.id}</span>
        <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#202220]">{viewLabels[angle]}</span>
        <Button size="sm" variant="secondary" onPress={onSelect} className="!absolute !bottom-2.5 !left-2.5 !h-8 !min-h-0 !rounded-full !bg-[#202423]/85 !px-3 !text-xs !font-semibold !text-white">
          <Plus size={14} />{selected ? '已加入配方' : '加入配方'}
        </Button>
      </div>
      <div className="px-1 pb-0.5 pt-4">
        <h3 className="min-h-10 text-sm font-semibold leading-5 text-[#f1f2ed]">{item.name}</h3>
        {item.kind === 'head' && item.role && <p className="mt-1 text-xs leading-5 text-[#b6c4aa]">适用参考：{item.role}</p>}
        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-[#a1a5a0]"><span>{item.kind === 'head' ? slotLabels[choiceSlot(item)] : kindLabels[item.kind]} · {item.gender}</span><span className="text-[#d2d6ce]">{categoryOf(item)}</span></div>
        <div className="mt-3 grid grid-cols-4 gap-1.5" role="group" aria-label={`${item.name}视角`}>
          {angles.filter(key => item.view_files[key]).map(key => (
            <button key={key} type="button" onClick={() => onAngle(key)} aria-pressed={key === angle} aria-label={`${item.name}：${viewLabels[key]}`} className={`min-w-0 rounded-lg border p-0.5 text-[10px] transition ${key === angle ? 'border-[#e0e8cf] text-white' : 'border-transparent text-[#999f9a] hover:border-[#676e68]'}`}>
              <img src={assetUrl(item.view_files[key]!)} alt="" loading="lazy" className={`w-full rounded-md bg-[#e8e4de] object-contain ${garment ? 'aspect-[9/16]' : 'aspect-square'}`} />
              <span className="block py-0.5">{viewLabels[key]}</span>
            </button>
          ))}
        </div>
      </div>
    </article>
  );
};
