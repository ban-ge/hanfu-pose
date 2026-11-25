import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

function Thumbnail({ file }: { file: File }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return src ? <img src={src} alt={file.name} className="aspect-square w-full rounded-lg bg-black/20 object-contain" /> : null;
}

type Props = {
  files: File[];
  selectedCount: number;
  busy: boolean;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
};

export function PortraitUpload({ files, selectedCount, busy, onAdd, onRemove }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState('');
  const total = selectedCount + files.length;
  function add(incoming: File[]) {
    if (busy || !incoming.length) return;
    if (incoming.length + total > 5) { setError('组合素材与上传照片合计最多 5 张，请减少图片后再试。'); return; }
    if (incoming.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
      setError('请选择 JPG、PNG 或 WebP 图片。'); return;
    }
    setError('');
    onAdd(incoming);
  }
  return (
    <section aria-label="人物参考照片" className="mt-4" onDragOver={e => e.preventDefault()} onDrop={e => {
      e.preventDefault(); setOver(false); add(Array.from(e.dataTransfer.files));
    }} onPaste={e => {
      const images = Array.from(e.clipboardData.files);
      if (images.length) { e.preventDefault(); add(images); }
    }}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">人物参考照片 <span className="text-xs font-normal text-[#b4c4b0]">可选</span></h3>
        <span className="text-xs text-[#b4c4b0]">参考图合计 {total}/5</span>
      </div>
      <input type="file" hidden ref={input} accept="image/jpeg,image/png,image/webp" multiple onChange={e => {
        add(Array.from(e.target.files ?? [])); e.target.value = '';
      }} />
      <button type="button" disabled={busy || total >= 5} onClick={() => input.current?.click()}
        onDragEnter={() => setOver(true)} onDragLeave={() => setOver(false)}
        className={`flex min-h-20 w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#a7bd84] px-3 py-3 text-left text-[#edf5dc] transition-colors hover:bg-[#3e503b] disabled:opacity-60 ${over ? 'bg-[#485c41]' : 'bg-[#303e30]'}`}>
        <ImagePlus size={25} aria-hidden="true" />
        <span><strong className="block text-sm">{total >= 5 ? '参考图已满' : '上传人物照片'}</strong>
          <span className="block text-xs text-[#ccdac2]">点击选择，或拖入、粘贴图片</span></span>
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-[#ffc8aa]">{error}</p>}
      {!!files.length && <div className="mt-2 grid grid-cols-3 gap-2">
        {files.map((file, i) => <div key={i} className="relative min-w-0">
          <Thumbnail file={file} />
          <button type="button" aria-label={`移除人物照片 ${i + 1}`} disabled={busy} onClick={() => { setError(''); onRemove(i); }}
            className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/75 text-white"><X size={14} /></button>
          <p className="mt-1 truncate text-xs" title={file.name}>图{selectedCount+i+1} · {file.name}</p>
        </div>)}
      </div>}
    </section>
  );
}
