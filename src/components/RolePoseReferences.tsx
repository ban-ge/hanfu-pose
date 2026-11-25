import { assetUrl, type ReferenceItem } from '../types';

type Props = { role: string; items: ReferenceItem[]; onViewImage: (id: string) => void };

export const RolePoseReferences = ({ role, items, onViewImage }: Props) => {
  const poses = items.filter(item => item.kind === 'pose' && item.applicable_roles?.includes(role));
  return <section aria-label={`${role}适用姿势`} className="mt-5 rounded-xl bg-[#19221b] p-4">
    <h3 className="text-sm font-semibold text-[#dce8d5]">适用姿势 · {poses.length} 组</h3>
    <p className="mt-2 text-xs leading-5 text-[#a4b1a4]">按动作共享，不按四季重复生成。以下是角色创作候选，适用朝代、身份与场景以素材说明为准；模型仅供动作参考，服饰、发型与头饰另选。</p>
    {poses.length ? <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{poses.map(item => <button key={item.id} type="button" onClick={() => onViewImage(item.id)} className="flex items-center gap-3 rounded-lg border border-[#455343] p-2 text-left hover:bg-white/5">
      {item.view_files.front && <img src={assetUrl(item.view_files.front)} alt="" loading="lazy" className="h-16 w-14 shrink-0 rounded bg-[#eee7dd] object-contain" />}
      <span className="text-xs leading-5 text-[#dce8d5]"><span className="block text-[#9eae9b]">{item.id}</span>{item.name}</span>
    </button>)}</div> : <p className="mt-3 text-xs text-[#a4b1a4]">此角色暂无已关联的姿势。</p>}
  </section>;
};
