import { GenerateImage } from './GenerateImage';
import { assetUrl, choiceSlots, slotLabels, matchesEra, viewLabels, type ReferenceChoices, type ChoiceSlot } from '../types';

type Choices = ReferenceChoices;
type Props = { onPick: (slot: ChoiceSlot) => void; choices: Choices; onRemove: (kind: ChoiceSlot) => void; scene: string; onSceneChange: (scene: string) => void };

export const Workbench = ({ choices, onPick, onRemove, scene, onSceneChange }: Props) => {
  const selectedCount = Object.values(choices).filter(Boolean).length;
  const garments = [choices.costume?.item, choices.head?.item].filter(item => item !== undefined);
  const mismatch = new Set(garments.map(item => item.era).filter(value => value !== '通用')).size > 1 || new Set(garments.map(item => item.gender).filter(value => value !== '通用')).size > 1 || garments.some(item => item.era === '通用' && garments.some(other => other.era !== '通用' && !matchesEra(item, other.era)));
  return (
    <section id="combine" aria-label="组合工作台" className="mt-16 scroll-mt-4">
      <GenerateImage choices={choices} scene={scene} onSceneChange={onSceneChange}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">组合工作台</h2>
          <span className="text-xs text-[#b4c4b0]">已选 {selectedCount} / {choiceSlots.length}</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {choiceSlots.map(slot => {
            const choice = choices[slot];
            const image = choice?.item.view_files[choice.angle];
            const label = slotLabels[slot];
            return (
              <div key={slot} className="min-w-0">
                <button type="button" aria-label={`${choice ? '更换' : '选择'}${label}`} onClick={() => onPick(slot)}
                  className="grid h-20 w-full place-items-center overflow-hidden rounded-lg border border-[#52614e] bg-[#29342b] hover:border-[#c4d89c]">
                  {image && choice ? <img src={assetUrl(image)} alt={choice.item.name} className="size-full object-contain" /> : <span aria-hidden="true" className="text-xl text-[#b4c4b0]">+</span>}
                </button>
                <p className="mt-1.5 text-xs">{label} · {choice ? viewLabels[choice.angle] : slot === 'head' ? '可选' : '必选'}</p>
                {image && choice && <div className="mt-1 text-xs text-[#c5d7bc]">
                  <p className="truncate" title={choice.item.name}>{choice.item.name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3">
                    <a href={assetUrl(image)} download={choice.item.id + '-' + image.split('/').pop()} className="underline">下载</a>
                    <button type="button" onClick={() => onRemove(slot)}>移除</button>
                  </div>
                </div>}
              </div>
            );
          })}
        </div>
        {mismatch && <p className="mt-3 text-xs text-[#efd3a6]">所选服饰和发型配饰的时期或造型不同，当前为创意搭配。</p>}
        {choices.head && ['儿童', '少年'].includes(choices.head.item.age ?? '') && choices.costume &&
          <p className="mt-3 text-xs text-[#efd3a6]">请核对发型配饰的参考年龄与服饰是否适配。</p>}
        {choices.pose && <p className="mt-3 text-xs text-[#b4c4b0]">姿势以所选视角为准，请核对手部与遮挡细节。</p>}


      </GenerateImage>
    </section>
  );
};
