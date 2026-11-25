import { viewLabels, type Angle } from './types';

const preset = "【汉服组合摄影】";
const identityLabel = "自定义形象：";
const sceneLabel = "自定义内容：";

export function buildHanfuPrompt(references: ReadonlyArray<{ kind: 'pose' | 'head' | 'costume' | 'inner'; angle: Angle } | null>, identity: string, content: string, aspect: string) {
  const lines = [preset, "生成一张写实服饰人像照片。"];
  const people: string[] = [];
  let hair = false;
  references.forEach((reference, index) => {
    const image = "图" + (index + 1);
    if (!reference) {
      people.push(image);
      return;
    }
    if (reference.kind === "pose") {
      const angle = viewLabels[reference.angle];
      lines.push(image + "为姿势参考。按" + angle + "机位还原人物朝向、手势、重心和双脚前后关系；将模型动作转化为自然的真人姿态。");
    } else if (reference.kind === "head") {
      hair = true;
      lines.push(image + "为发型配饰参考。按图呈现分缝、发髻位置和轮廓，冠帽、簪钗按图示方向佩戴，保持人物面容和头部比例。");
    } else {
      lines.push(image + "为服饰参考。还原衣装形制、面料、纹样、配色、叠穿顺序和系带位置，衣袖与下摆随动作自然垂落。");
    }
  });
  if (people.length) {
    lines.push("人物身份以" + people[0] + "为准。保持同一个人的实际年龄、脸型、五官比例、眼形、鼻形、唇形和肤色，转头、俯拍或仰拍时仍可辨认。脸、颈、手和其他可见皮肤保持一致的肤色基调，随现场光线自然变化。");
    if (!hair) lines.push("沿用" + people[0] + "的发型、发色和发际线。");
  }
  if (identity.trim()) lines.push(people.length ? "自定义形象用于补充与人物参考相符的神态、妆容或气质。" : "按自定义形象塑造人物，年龄、面容和体态协调，保留自然的个人特征。");
  if (content.trim()) lines.push("按自定义内容安排场景、季节和光线，保持选定的服饰、动作与镜头角度。");
  lines.push(
    `参考 Nikon Z8 搭配 50mm 镜头的实拍效果，f/4，1/250s，ISO 200，白平衡 5200K。采用自然光，按 ${aspect === "9:16" ? "9:16 竖版" : aspect} 构图。`,
    "保留皮肤毛孔、眼下细纹和布料经纬。肤色自然，避免过度磨皮和强烈的橙黄滤镜。手指、关节和肢体比例自然，脚底与地面的接触和阴影一致。若穿长裙，裙摆垂至鞋面，不拖地。",
    "场景符合服饰年代，排除现代物品和游客。画面无文字、标志或水印。",
  );
  if (identity.trim()) lines.push(identityLabel + identity.trim());
  if (content.trim()) lines.push(sceneLabel + content.trim());
  return lines.join("\n");
}
