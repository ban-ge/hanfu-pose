import catalog from '../data/catalog.json';
import type { ReferenceItem } from './types';

export const items = catalog.items as ReferenceItem[];

export function displayTitle({ name: title, era }: ReferenceItem) {
  let name = title.replace(/（(?:影视参考|创作参考|创作款|纯头饰|无人物)(?:·创作参考)?）/g, "");
  if (name.startsWith(era + "·")) name = name.slice(era.length + 1);
  return name
    .replace(/^(?:[汉唐宋元明清]风|通用)(?:男式|女式|通用)?·?/, "")
    .replace(/^儿童[男女](?=[春夏秋冬]季)/, "儿童")
    .replace(/（([春夏秋冬]款)）$/, " · $1")
    .trim() || title;
}


const facetOrder: Record<string, readonly string[]> = {
  朝代: ["通用", "汉", "唐", "宋", "元", "明", "清", "民国", "新中国（1949–1978）"],
  性别: ["通用", "男", "女"],
  年龄: ["通用", "儿童", "少年", "青年", "成年", "中年", "老年"],
  季节: ["不分季节", "春", "夏", "秋", "冬"],
  分类: ["通用", "发型", "头饰", "内搭"],
};
const facetCollator = new Intl.Collator("zh-CN");

export function sortFacetOptions(facet: string, values: string[]) {
  const order = facetOrder[facet] ?? [];
  const rank = (value: string) => {
    const index = order.indexOf(value);
    return index < 0 ? order.length : index;
  };
  return [...new Set(values)].sort(
    (a, b) => rank(a) - rank(b) || facetCollator.compare(a, b),
  );
}
