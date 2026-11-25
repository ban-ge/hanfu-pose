import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ImageIcon, LoaderCircle } from 'lucide-react';
import { PortraitUpload } from './PortraitUpload';
import { buildHanfuPrompt } from '../hanfu-prompt';
import { sizes, models, ratios, resolutions, qualities, type Ratio, type Resolution, type Quality } from '../image-options';
import { assetUrl, choiceSlots, type ReferenceChoices } from '../types';

type ImageConfig = { base: string; model: string; key: string; ratio?: Ratio; resolution?: Resolution; quality?: Quality };
const configStorageKey = 'hanfu-pose.image-service.v1';
const defaults: ImageConfig = { base: 'https://api.openai.com/v1', model: models[0].id, key: '' };

function readConfig(): ImageConfig | null {
  try {
    const config = JSON.parse(localStorage.getItem(configStorageKey) ?? 'null');
    if (!config || typeof config.base !== 'string' || typeof config.model !== 'string' ||
        typeof config.key !== 'string' || !config.key.trim() || !config.model.trim()) return null;
    endpoint(config.base);
    return { base: config.base, model: models.some(item => item.id === config.model) ? config.model : defaults.model, key: config.key,
      ratio: ratios.includes(config.ratio) ? config.ratio : undefined,
      resolution: resolutions.includes(config.resolution) ? config.resolution : undefined,
      quality: Object.hasOwn(qualities, config.quality) ? config.quality : undefined };
  } catch {
    return null;
  }
}

const optionClass = 'flex-1 rounded-md border border-[#52614e] py-2 aria-pressed:bg-[#d3e6a0] aria-pressed:text-[#20271a] disabled:opacity-30';
const field = 'mt-1 block w-full rounded-lg border border-[#52614e] bg-[#19221b] px-3 py-2 text-sm text-white';
const serviceErrors: Record<number, string> = {
  401: 'API_KEY 无效，请检查密钥。',
  403: '当前密钥没有此模型的访问权限。',
  404: '接口或模型不存在，请核对 BASE_URL 和模型名。',
  429: '服务限流或额度不足，请检查服务账户后重试。',
};

function endpoint(base: string) {
  const url = new URL(base.trim());
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.username || url.password || url.search || url.hash || !(url.protocol === 'https:' || (local && url.protocol === 'http:'))) {
    throw new Error('BASE_URL 请使用 HTTPS 服务地址或本机 HTTP 地址。');
  }
  url.pathname = url.pathname.replace(/\/+$/, '') + '/images/edits';
  return url;
}

async function generate(base: URL, key: string, model: string, size: string, quality: Quality, prompt: string, choices: ReferenceChoices, portraits: File[]) {
  const form = new FormData();
  form.set('model', model);
  form.set('prompt', prompt);
  form.set('size', size);
  form.set('quality', quality);
  for (const slot of choiceSlots) {
    const choice = choices[slot];
    if (!choice) continue;
    const path = choice.item.view_files[choice.angle];
    if (!path) throw new Error('缺少已选视角的参考图。');
    const response = await fetch(assetUrl(path));
    if (!response.ok) throw new Error('参考图读取失败，请重新选择。');
    const image = await response.blob();
    if (!image.type.startsWith('image/')) throw new Error('参考图格式无效。');
    form.append('image[]', image, choice.item.id + '-' + path.split('/').pop());
  }
  for (const file of portraits) form.append('image[]', file, file.name);
  const response = await fetch(base, {
    method: 'POST', headers: { Authorization: 'Bearer ' + key }, body: form, redirect: 'error', credentials: 'omit',
  });
  if (!response.ok) throw new Error(serviceErrors[response.status] ?? `生图服务返回 HTTP ${response.status}，请检查模型是否支持多图编辑及所选尺寸。`);
  const data = (await response.json()).data?.[0];
  if (typeof data?.b64_json === 'string' && data.b64_json) {
    const bytes = Uint8Array.from(atob(data.b64_json), char => char.charCodeAt(0));
    return new Blob([bytes], { type: 'image/png' });
  }
  if (typeof data?.url === 'string' && new URL(data.url).protocol === 'https:') {
    const image = await fetch(data.url, { credentials: 'omit' });
    const blob = await image.blob();
    if (image.ok && blob.type.startsWith('image/')) return blob;
  }
  throw new Error('服务没有返回可读取的图片，请检查接口响应格式。');
}

export function GenerateImage({ choices, scene, onSceneChange, children }: { children: ReactNode; choices: ReferenceChoices; onSceneChange: (scene: string) => void; scene: string }) {
  const [saved, setSaved] = useState(readConfig);
  const [editing, setEditing] = useState(!saved);
  const [base, setBase] = useState(saved?.base ?? defaults.base);
  const [model, setModel] = useState(saved?.model ?? defaults.model);
  const [ratio, setRatio] = useState<Ratio>(saved?.ratio ?? '9:16');
  const [resolution, setResolution] = useState<Resolution>(saved?.resolution ?? '1K');
  const [quality, setQuality] = useState<Quality>(saved?.quality ?? 'low');
  const size = sizes[resolution][ratio];
  const [key, setKey] = useState(saved?.key ?? '');
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Blob | null>(null);
  const [preview, setPreview] = useState('');
  useEffect(() => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);
  const [identity, setIdentity] = useState('');
  const [portraits, setPortraits] = useState<File[]>([]);
  const [copyStatus, setCopyStatus] = useState('');
  const selected = choiceSlots.flatMap(slot => choices[slot] ? [choices[slot]] : []);
  const total = selected.length + portraits.length;
  const prompt = buildHanfuPrompt([
    ...selected.map(({ item, angle }) => ({ kind: item.kind, angle })),
    ...portraits.map(() => null),
  ], identity, scene, ratio);
  const ready = Boolean(choices.pose && choices.costume);
  function saveConfig() {
    const config = { base: base.trim(), model: model.trim(), key: key.trim(), ratio, resolution, quality };
    try {
      endpoint(config.base);
    } catch {
      setError('请填写有效的 BASE_URL。');
      return;
    }
    if (!config.model || !config.key) {
      setError('请填写模型和 API_KEY。');
      return;
    }
    try {
      localStorage.setItem(configStorageKey, JSON.stringify(config));
      setSaved(config);
      setEditing(false);
      setError('');
    } catch {
      setError('浏览器未允许保存本地配置。当前页仍可生图。');
    }
  }
  function clearConfig() {
    try {
      localStorage.removeItem(configStorageKey);
      setSaved(null);
      setBase(defaults.base);
      setModel(defaults.model);
      setRatio('9:16');
      setResolution('1K');
      setQuality('low');
      setKey('');
      setEditing(true);
      setError('');
    } catch {
      setError('清除失败，请检查浏览器的站点存储权限。');
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || total > 5 || running.current) return;
    running.current = true;
    setBusy(true);
    setError('');
    try {
      setResult(await generate(endpoint(base), key.trim(), model.trim(), size, quality, prompt, choices, portraits));
    } catch (e) {
      setError(e instanceof TypeError ? '请检查服务地址、网络，以及服务是否允许浏览器跨域请求。' : e instanceof Error ? e.message : '请求失败，请重试。');
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="studio-layout">
    <form onSubmit={submit} className="studio-form">
      <div className="studio-fields">
      {children}
      <PortraitUpload files={portraits} selectedCount={selected.length} busy={busy}
        onAdd={files => setPortraits(current => [...current, ...files])}
        onRemove={index => setPortraits(current => current.filter((_, i) => i !== index))} />
        <label className="mt-4 block text-sm font-semibold">自定义形象
          <input className="mt-2 block w-full rounded-lg border border-[#435242] bg-[#19221b] p-2 text-sm font-normal" value={identity} onChange={event => setIdentity(event.target.value)} placeholder="年龄、面容、体态等" />
        </label>
        <label className="mt-4 block text-sm font-semibold">自定义内容
          <textarea value={scene} onChange={event => onSceneChange(event.target.value)} placeholder="描述人物、场景和光线…"
            className="mt-2 block min-h-20 w-full resize-y rounded-lg border border-[#435242] bg-[#19221b] p-3 text-sm font-normal" />
        </label>
      {total > 5 && <p className="text-xs text-[#ffc8aa]">请移除多出的参考图后生成。</p>}
      <details className="mt-3 border-b border-[#435242] pb-3 text-xs">
        <summary className="cursor-pointer">组合提示词</summary>
        <pre className="my-2 max-h-44 overflow-auto whitespace-pre-wrap break-words leading-5">{prompt}</pre>
        <button type="button" onClick={async () => {
          try { await navigator.clipboard.writeText(prompt); setCopyStatus('已复制'); }
          catch { setCopyStatus('请手动选择并复制提示词'); }
        }}>复制提示词</button> <span role="status">{copyStatus}</span>
      </details>
      <h3 className="mt-4 text-sm font-semibold">生图服务</h3>
      <p className="mt-1 text-xs leading-5 text-[#b4c4b0]">填写自己的 OpenAI 或兼容服务。点击生成后，浏览器会将提示词和参考图发送到填写的地址，费用由该服务计收。选择「保存本地配置」会将密钥保存在此浏览器的站点存储中。</p>
      {saved && !editing && <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <strong>本地配置</strong><span className="break-all">{saved.base}</span>
        <button type="button" disabled={busy} className="underline" onClick={() => setEditing(true)}>修改配置</button>
        <button type="button" disabled={busy} className="underline" onClick={clearConfig}>清除配置</button>
      </div>}
      {editing && <fieldset disabled={busy} className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
        <label>BASE_URL<input className={field} type="url" required value={base} onChange={e => { setBase(e.target.value); setKey(''); }} /></label>
        <label>API_KEY<input className={field} type="password" required autoComplete="off" spellCheck={false} placeholder="输入服务密钥" value={key} onChange={e => setKey(e.target.value)} /></label>
        <button type="button" onClick={saveConfig} className="justify-self-start rounded-lg border border-[#52614e] px-3 py-2">保存本地配置</button>
      </fieldset>}
      <fieldset disabled={busy} className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
        <label>模型<select className={field} value={model} onChange={e => setModel(e.target.value)}>
          {models.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select></label>
        <label>画面比例<select className={field} value={ratio} onChange={e => setRatio(e.target.value as Ratio)}>
          {ratios.map(value => <option key={value}>{value}</option>)}
        </select></label>
        <div className="sm:col-span-2">分辨率<div role="group" aria-label="分辨率" className="mt-1 flex gap-1">
          {resolutions.map(value => <button type="button" key={value} aria-pressed={value === resolution} className={optionClass} onClick={() => setResolution(value)}>{value}</button>)}
        </div><p className="mt-1 text-[#b4c4b0]">输出尺寸 {size.replace('x', ' × ')}</p></div>
        <div className="sm:col-span-2">质量<div role="group" aria-label="质量" className="mt-1 flex gap-1">
          {(Object.keys(qualities) as Quality[]).map(value => <button type="button" key={value} aria-pressed={quality === value} className={optionClass} onClick={() => setQuality(value)}>{qualities[value]}</button>)}
        </div></div>
      </fieldset>
      </div>
      <div className="border-t border-[#435242] p-4 text-center">
        <button disabled={busy || !ready || total > 5 || !key.trim() || !model.trim()} type="submit" className="w-full rounded-lg bg-[#d3e6a0] px-4 py-2 font-semibold text-[#20271a] disabled:opacity-50">{busy ? '生成中…' : '生成人物图'}</button>
        <span role="status" className="mt-1 block text-xs text-[#b4c4b0]">{busy ? '正在处理本次组合，请保持页面打开。' : !ready ? '请先选择姿势和服饰。' : ''}</span>
      {error && <p role="alert" className="mt-2 text-sm text-[#ffc8aa]">{error}</p>}
      </div>
    </form>
    <section className="studio-preview" aria-label="生成预览">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">生成预览</h3>
        {preview && <a className="text-xs text-[#d3e6a0] underline" href={preview} download={'hanfu-portrait.' + (result?.type.split('/')[1] || 'png')}>下载生成图</a>}
      </div>
      <div className="studio-canvas" aria-busy={busy}>
        {preview && <img src={preview} alt="组合生图结果" className="absolute inset-0 size-full object-contain" />}
        {(busy || !preview) && <div role="status" className={`absolute inset-0 grid place-content-center justify-items-center gap-3 text-sm text-[#b4c4b0] ${preview ? 'bg-black/65' : ''}`}>
          {busy ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <ImageIcon aria-hidden="true" size={28} />}
          {busy ? '正在生成人物图…' : '生成的图片将在这里显示'}
        </div>}
      </div>
    </section>
    </div>
  );
}
