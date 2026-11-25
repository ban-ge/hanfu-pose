import { useState } from 'react';
import { Button } from '@heroui/react';
import { Check, Copy } from 'lucide-react';
import { assetUrl, choiceSlots, slotLabels, matchesEra, seasonLabel, viewLabels, type ReferenceChoices, type ChoiceSlot } from '../types';

type Choices = ReferenceChoices;
type Props = { choices: Choices; onRemove: (kind: ChoiceSlot) => void; scene: string; onSceneChange: (scene: string) => void };

const buildPrompt = (choices: Choices, scene: string) => {
  const chosen = choiceSlots.map(kind => ({ kind, choice: choices[kind] })).filter(entry => entry.choice);
  if (!chosen.length) return scene.trim() || '从图鉴中选择姿势、内搭、服装和发型头饰，开始组合你的参考方案。';
  const roles = chosen.map(({ kind, choice }, index) => {
    const selected = choice!;
    const role = kind === 'pose' ? '仅参考姿势、构图和道具接触关系，不复制灰色练习服或模型头部；使用所选服装与头饰' : kind === 'inner' ? '参考内搭的面料和款式；与外衣组合时穿在外衣里面，按外衣结构决定可见部分，保持外衣版型' : kind === 'costume' ? '仅参考外衣的形制、配色和层次' : kind === 'hairstyle' ? '仅参考头发结构与配套簪饰；佩戴冠帽时调整发髻位置，不复制面容' : '仅参考独立冠帽盔巾，按身份与场合选择，遮挡处的头发自然收纳';
    return `图 ${index + 1}：${slotLabels[kind]} ${selected.item.id}（${viewLabels[selected.angle]}${selected.item.kind === 'costume' || selected.item.kind === 'inner' ? `，${seasonLabel(selected.item)}` : ''}）；${role}。${selected.item.description}`;
  });
  const ageNote = choices.hairstyle?.item.age ? `发型参考年龄阶段：${choices.hairstyle.item.age}；请结合人物设定调整。\n\n` : '';
  return `${roles.join('\n')}\n\n${ageNote}${scene.trim() || '人物与场景：请在此补充。'}\n\n让人物的姿势、衣服与发饰自然融合；保留衣物结构和头饰细节，完整呈现人物。以上造型为时代题材设计，不声称历史复原。`;
};

export const Workbench = ({ choices, onRemove, scene, onSceneChange }: Props) => {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const selectedCount = Object.values(choices).filter(Boolean).length;
  const prompt = buildPrompt(choices, scene);
  const garments = [choices.inner?.item, choices.costume?.item, choices.hairstyle?.item, choices.headwear?.item].filter(item => item !== undefined);
  const mismatch = new Set(garments.map(item => item.era).filter(value => value !== '通用')).size > 1 || new Set(garments.map(item => item.gender).filter(value => value !== '通用')).size > 1 || garments.some(item => item.era === '通用' && garments.some(other => other.era !== '通用' && !matchesEra(item, other.era)));
  const copyPrompt = async () => {
    try { await navigator.clipboard.writeText(prompt); setCopied(true); setCopyFailed(false); window.setTimeout(() => setCopied(false), 2200); }
    catch { setCopyFailed(true); }
  };
  return (
    <section id="combine" className="mt-16 scroll-mt-6 rounded-2xl border border-[#3a453a] bg-[#202922] p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-semibold tracking-[.2em] text-[#aec49f]">COMPOSITION / 组合工作台</p><h2 className="mt-2 text-2xl font-semibold">从参考，到人物</h2><p className="mt-2 text-sm text-[#a4b1a4]">分别选取姿势、内搭、服装、发型与独立头饰，生成组合提示词。</p></div><span className="rounded-full border border-[#6b7b68] px-3 py-1 text-xs text-[#cbdcc5]">已选 {selectedCount} / 5</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{choiceSlots.map(key => { const choice = choices[key]; const image = choice?.item.view_files[choice.angle]; return <div key={key} className="flex min-h-24 items-center gap-3 rounded-xl border border-[#4c5c4c] bg-[#283329] p-3">{image ? <img src={assetUrl(image)} alt={`${choice?.item.name} ${viewLabels[choice!.angle]}`} className="h-20 w-16 rounded-lg bg-[#eee] object-contain" /> : <div className="grid h-20 w-16 place-items-center rounded-lg border border-dashed border-[#617260] text-[#94a88e]"><PlusSign /></div>}<div className="min-w-0"><p className="text-[10px] tracking-wider text-[#aabb9f]">{slotLabels[key]}</p><p className="mt-1 truncate text-sm font-medium">{choice?.item.name || `选择${slotLabels[key]}`}</p>{choice && image && <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#c5d7bc]"><a href={assetUrl(image)} download={`${choice.item.id}-${choice.angle}.png`} className="underline">下载{viewLabels[choice.angle]}</a><button type="button" onClick={() => onRemove(key)} className="underline">移除</button></div>}</div></div>; })}</div>{choices.hairstyle && choices.headwear && <p className="mt-4 text-xs leading-5 text-[#efd3a6]">发型与头饰分别引用；请核对冠帽容纳空间，避免把两个完整头部造型直接叠放。</p>}{mismatch && <p className="mt-4 text-xs leading-5 text-[#efd3a6]">内搭、服装或发型头饰的时期或造型不同，当前为创意搭配。</p>}{(choices.hairstyle?.item.age === '儿童' || choices.hairstyle?.item.age === '少年') && (choices.inner || choices.costume) && <p className="mt-4 text-xs leading-5 text-[#efd3a6]">所选发型为儿童或少年参考；请确认人物年龄与服装适配，现有成人服装不代表未成年人穿着。</p>}{choices.pose && <p className="mt-4 text-xs leading-5 text-[#efd3a6]">姿势为 AI 多视角参考，手部与遮挡细节可能有差异；组合时以所选单张视角为准。</p>}<div className="mt-4 grid gap-3 lg:grid-cols-2"><label className="rounded-xl bg-[#19221b] p-4 text-xs font-semibold text-[#d2dfcd]">补充人物与场景<textarea value={scene} onChange={event => onSceneChange(event.target.value)} placeholder="例如：成年女子，在庭院中自然行走，柔和日光。" className="mt-3 block min-h-32 w-full resize-y rounded-lg border border-[#435242] bg-[#202c21] p-3 text-sm font-normal leading-6 text-white placeholder:text-[#829080]" /></label><div className="rounded-xl bg-[#19221b] p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-xs font-semibold text-[#d2dfcd]">组合提示词</h3><Button variant="ghost" onPress={copyPrompt} className="!h-8 !min-h-0 !px-2 !text-xs !text-[#d5e8c9]">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? '已复制' : '复制提示词'}</Button></div>{copyFailed && <p className="mt-2 text-xs text-[#f0c5a5]">复制失败，请手动选择提示词。</p>}<pre className="mt-3 max-h-44 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-[#b4c4b0]">{prompt}</pre><p className="mt-3 text-[11px] leading-5 text-[#889a86]">请按提示顺序手动上传参考图；本站不调用生图服务。</p></div></div></section>
  );
};

const PlusSign = () => <span className="text-2xl font-light">+</span>;
