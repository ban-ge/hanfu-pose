import { displayTitle } from '../library';
import { useState } from 'react';
import { assetAngles, assetUrl, poseAngles, viewLabels, type Angle, type ReferenceItem } from '../types';
import { ImagePreview } from './ImagePreview';

type View = Angle | 'example';
type Props = {
  item: ReferenceItem;
  angle?: Angle;
  selected: boolean;
  onOpen: () => void;
  onSelect: (angle: Angle) => void;
};

function flyToWorkbench(source: HTMLElement, imageUrl: string) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const target = [...document.querySelectorAll('a[href="#combine"]')]
    .map((link) => link.getBoundingClientRect())
    .find(({ width, height, top, bottom, left, right }) =>
      width > 0 && height > 0 && top >= 0 && bottom <= window.innerHeight &&
      left >= 0 && right <= window.innerWidth,
    );
  if (!target) return;

  const from = source.getBoundingClientRect();
  const x = from.left + from.width / 2;
  const y = from.top + from.height / 2;
  const dx = target.left + target.width / 2 - x;
  const dy = target.top + target.height / 2 - y;
  const lift = Math.min(140, Math.max(48, Math.abs(dx) * 0.23));
  const image = document.createElement("img");
  image.src = imageUrl;
  image.alt = "";
  image.setAttribute("aria-hidden", "true");
  image.className = "pointer-events-none fixed z-[9999] size-16 rounded-xl border border-white/10 bg-white object-cover shadow-lg";
  image.style.left = `${x - 32}px`;
  image.style.top = `${y - 32}px`;
  document.body.append(image);

  const frames = Array.from({ length: 21 }, (_, index) => {
    const t = index / 20;
    const translateY = dy * t - 4 * lift * t * (1 - t);
    return {
      transform: `translate(${dx * t}px, ${translateY}px) scale(${1 - 0.8 * t})`,
      opacity: Math.min(1, 4 * (1 - t)),
    };
  });
  return image.animate(frames, { duration: 530, easing: "ease-in-out" })
    .finished.catch(() => undefined).finally(() => image.remove());
}

export const ReferenceCard = ({ item, angle, selected, onOpen, onSelect }: Props) => {
  const [hovered, setHovered] = useState<View | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const views: View[] = (item.kind === 'pose' ? poseAngles : assetAngles).filter(key => item.view_files[key]);
  if (item.example) views.unshift('example');
  const preview = hovered ?? angle ?? views[0];
  const path = (view: View, full = false) => assetUrl(view === 'example'
    ? (full ? item.exampleFull ?? item.example! : item.example!)
    : item.view_files[view]!);
  const label = (view: View) => view === 'example' ? '拟拍' : viewLabels[view];
  const title = displayTitle(item);
  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#242729]">
      <button type="button" onClick={() => setZoom(views.indexOf(preview))} aria-label={`放大预览${title}`} className="group relative block aspect-[9/16] w-full cursor-zoom-in overflow-hidden bg-white">
        {views.map(view => <img key={view} src={path(view)} alt={title + ' ' + label(view)} aria-hidden={preview !== view} loading="lazy"
          className={`absolute inset-0 size-full object-contain motion-safe:transition-[opacity,scale] motion-safe:duration-300 motion-safe:group-hover:scale-105 ${preview === view ? 'opacity-100' : 'opacity-0'}`} />)}
      </button>
      <div className="grid gap-2 p-3">
        <small className="text-xs text-[#a1a5a0]">{item.id} · {item.era} · {item.gender}{selected && ' · 已加入配方'}</small>
        <button type="button" onClick={onOpen} aria-label={`查看${title}详情`} className="text-left text-sm font-semibold">{title}</button>
        <div role="group" aria-label={title + '视角'} className="grid gap-1" style={{gridTemplateColumns: `repeat(${views.length}, minmax(0, 2.25rem))`}}>
          {views.map(view => <button type="button" key={view} aria-label={view === 'example' ? 'AI 拟拍示例' : `预览${label(view)}，添加${title} · ${item.kind === 'pose' ? label(view) : '正面主图'}`}
            onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(view); }} onPointerLeave={() => setHovered(null)}
            onClick={event => {
              if (view === 'example') { setHovered(null); return; }
              const reference = item.kind === 'pose' ? view : 'front';
              onSelect(reference);
              void flyToWorkbench(event.currentTarget, path(reference));
            }}
            className={`group relative aspect-[2/3] min-w-0 overflow-hidden rounded-md border bg-white ${preview === view ? 'border-[#b9cb98]' : 'border-white/10'}`}>
            <img src={path(view)} alt="" loading="lazy" className={`absolute inset-0 size-full motion-safe:transition-transform motion-safe:group-hover:scale-105 ${view === 'example' ? 'object-cover object-[center_75%]' : 'object-contain'}`} />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pt-2 text-[10px] text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:transition-opacity">{label(view)}</span>
          </button>)}
        </div>
      </div>
      {zoom !== null && <ImagePreview label={title} whiteBackground images={views.map(view => path(view, true))} index={zoom} onIndexChange={setZoom} />}
    </article>
  );
};
