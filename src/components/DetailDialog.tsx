import { useEffect, useRef } from 'react';
import { Button } from '@heroui/react';
import { Download, Plus, X } from 'lucide-react';
import { angles, assetUrl, kindLabels, slotLabels, choiceSlot, seasonLabel, viewLabels, type Angle, type ReferenceItem } from '../types';

type Props = { item: ReferenceItem; angle: Angle; onAngle: (angle: Angle) => void; onClose: () => void; onSelect: () => void };
export const DetailDialog = ({ item, angle, onAngle, onClose, onSelect }: Props) => {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  const image = item.view_files[angle];
  return (
    <dialog ref={dialog} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="m-auto max-h-[92vh] w-[min(94vw,920px)] overflow-auto rounded-2xl border border-[#3b403c] bg-[#1e2220] p-0 text-[#f1f3ed] shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><span className="text-xs tracking-[.18em] text-[#aeb7a9]">REFERENCE / {item.id}</span><Button isIconOnly variant="ghost" onPress={onClose} aria-label="关闭详情" className="!text-white"><X size={19} /></Button></div>
      <div className="grid gap-6 p-5 md:grid-cols-2 md:gap-8">
        <div>
          <div className="mx-auto aspect-[9/16] max-h-[60vh] overflow-hidden rounded-xl bg-[#e8e4de]">{image && <img src={assetUrl(image)} alt={`${item.name} ${viewLabels[angle]}`} className="h-full w-full object-contain" />}</div>
          <div className="mt-3 grid grid-cols-4 gap-2">{angles.filter(key => item.view_files[key]).map(key => <button key={key} type="button" onClick={() => onAngle(key)} aria-pressed={angle === key} className={`rounded-lg border px-2 py-2 text-xs ${angle === key ? 'border-[#cfdf9b] bg-[#d9eba7] text-[#20271a]' : 'border-white/15 text-[#c3c9c1]'}`}>{viewLabels[key]}</button>)}</div>
        </div>
        <div className="py-1"><p className="text-xs text-[#aeb7a9]">{item.kind === 'head' ? slotLabels[choiceSlot(item)] : kindLabels[item.kind]} / {item.era} / {item.gender}{(item.kind === 'costume' || item.kind === 'inner') ? ` / ${seasonLabel(item)}` : ''}</p><h2 className="mt-3 text-2xl font-semibold">{item.name}</h2><p className="mt-4 text-sm leading-7 text-[#b5bcb5]">{item.description}</p>{(item.age || item.occasion || item.structure) && <div className="mt-5 space-y-1 text-xs leading-6 text-[#c6cec4]">{!!item.applicable_eras?.length && <p>适用时期：{item.applicable_eras.join('、')}；具体身份另核</p>}{item.age && <p>参考年龄：{item.age}</p>}{item.occasion && <p>参考场景：{item.occasion}</p>}{item.structure && <p>造型重点：{item.structure}</p>}</div>}{item.inspiration_url && <p className="mt-3 text-xs text-[#aeb7a9]">选题线索：<a className="underline" href={item.inspiration_url} target="_blank" rel="noreferrer">查看参考视频</a>（非历史考据来源）</p>}{item.references?.map(source => <p key={source.url} className="mt-3 text-xs leading-6 text-[#aeb7a9]">参考来源：<a className="underline" href={source.url} target="_blank" rel="noreferrer">{source.title}</a>。{source.note}</p>)}<div className="mt-6 border-y border-white/10 py-4"><p className="text-xs font-semibold text-[#e0e5db]">素材说明 · {item.status}</p><p className="mt-2 text-xs leading-6 text-[#aab2a8]">{item.review}</p></div><div className="mt-6 flex flex-wrap gap-2"><Button variant="primary" onPress={onSelect} className="!bg-[#d8e9a9] !text-[#20261c]"><Plus size={15} />加入配方</Button>{image && <a href={assetUrl(image)} download={image.split('/').pop()} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5"><Download size={15} />下载当前视角</a>}</div>{item.prompt && <details className="mt-7 text-xs leading-6 text-[#aeb7a9]"><summary className="cursor-pointer text-[#e1e5dc]">查看生成提示词</summary><p className="mt-3 break-words">{item.prompt}</p></details>}</div>
      </div>
    </dialog>
  );
};
