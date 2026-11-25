export type Role = {
  name: string;
  group: string;
  genders: ('男' | '女')[];
  eras: string[];
  outer: string;
  head: string;
  note?: string;
};

const all = ['汉', '唐', '宋', '元', '明', '清'];
const roles = (group: string, entries: Omit<Role, 'group'>[]): Role[] => entries.map(entry => ({ group, ...entry }));
export const roleCatalog: Role[] = [
  ...roles('宫廷与宗室', [
    { name: '皇帝', genders: ['男'], eras: all, outer: '礼仪长袍，层次庄重、织纹精细，礼服与常服区分', head: '礼冠或适合场景的冠帽' },
    { name: '皇后', genders: ['女'], eras: all, outer: '礼仪长衣与裙装，层次丰富，使用精细织纹', head: '礼仪冠饰与整齐发髻' },
    { name: '宫廷妃嫔', genders: ['女'], eras: all, outer: '精致长衣与裙装，色彩和装饰随身份、场景变化', head: '盘发与簪饰' },
    { name: '王爷／宗室男子', genders: ['男'], eras: all, outer: '质地讲究的长袍与腰带，日常和礼仪款区分', head: '束发冠或相应冠帽', note: '名称、爵位及服制须按具体朝代核对。' },
    { name: '王妃／宗室女眷', genders: ['女'], eras: all, outer: '精致长衣与裙装，绣纹与佩饰适度', head: '盘髻与簪饰', note: '称谓和礼服须按时代及身份核对。' },
    { name: '公主', genders: ['女'], eras: all, outer: '精致长衣裙与外衫，绣纹和配色突出身份', head: '盘发与精致头饰' },
    { name: '皇子／王子', genders: ['男'], eras: all, outer: '质地讲究的长袍、腰带与内衫', head: '束发与冠饰', note: '此处按成年人物设计，具体称谓依时代调整。' },
    { name: '格格', genders: ['女'], eras: ['清'], outer: '清代题材长衣，结合旗人身份与场合设计', head: '清代题材发式与头饰', note: '仅作为清代题材称谓；旗人身份、时期和形制仍须核对。' },
    { name: '宫女／内侍', genders: ['男', '女'], eras: all, outer: '素净便于劳作的长衣，装饰克制', head: '简洁束发或帽巾' },
  ]),
  ...roles('官员与军旅', [
    { name: '文官', genders: ['男'], eras: all, outer: '整洁长袍、腰带与官服元素，品级细节待考', head: '相应时代的官帽' },
    { name: '武官／将军', genders: ['男'], eras: all, outer: '军旅袍服与护具，层次清晰；礼服与作战装备分开', head: '束发或头盔', note: '默认采用男性将领造型，时代装备须分别核对。' },
    { name: '士兵', genders: ['男'], eras: all, outer: '实用短衣裤，外加简朴护具或甲衣', head: '布巾或简朴头盔', note: '默认采用男性士兵造型，时代装备须分别核对。' },
    { name: '捕快／差役', genders: ['男'], eras: all, outer: '耐磨短衣裤、紧袖与腰带，佩带收纳袋', head: '布巾或简帽', note: '身份名称与制度按时代核对，此处为通俗影视题材。' },
    { name: '书吏／幕僚', genders: ['男'], eras: all, outer: '素色长衣，袖口整洁、配色克制', head: '简巾或朴素盘发' },
  ]),
  ...roles('市井与民生', [
    { name: '店小二', genders: ['男'], eras: all, outer: '便于活动的布短衣、腰带和宽裤，可配工作巾', head: '布巾或简洁束发', note: '店小二为通俗角色称呼，职业制度依时代核对。' },
    { name: '店老板／掌柜', genders: ['男', '女'], eras: all, outer: '整洁布袍或上衣裙裤，腰间收束，材质比伙计略精细', head: '朴素巾帽或盘发' },
    { name: '商人', genders: ['男', '女'], eras: all, outer: '耐用而整洁的长衣，腰带与收纳袋', head: '巾帽或简洁发髻' },
    { name: '小贩', genders: ['男', '女'], eras: all, outer: '耐磨布衣、短外衫、宽裤与腰带', head: '布巾或束发' },
    { name: '农人', genders: ['男', '女'], eras: all, outer: '朴素短衣裤，方便劳作，鞋履实用', head: '布巾或简束发' },
    { name: '渔人／船工', genders: ['男'], eras: all, outer: '便于行动的工作衣裤和鞋履；水边作业配件另列', head: '布巾或束发', note: '不同地区和时期的具体装束待核对。' },
    { name: '工匠', genders: ['男'], eras: all, outer: '窄袖工作衣与裤装，可加布围裙', head: '布巾或束发' },
    { name: '医者', genders: ['男'], eras: all, outer: '干净素雅的长衣或短衫，方便行走', head: '简巾或朴素发髻' },
    { name: '书生', genders: ['男'], eras: all, outer: '素净长衣与布腰带，避免过多装饰', head: '束发或简巾', note: '按文学与影视人物设计，身份和称谓依时代核对。' },
    { name: '僧人', genders: ['男'], eras: all, outer: '按用途选择僧众日常长衣、礼佛法会披搭衣、住持正式法会礼衣或劳作习武衣裤', head: '按具体宗教、时代及图像资料研究', note: '住持是职务，袈裟并非住持专属；日常、法会、正式礼仪与劳作用途不合并。唐代少林及习武造型为创作参考，形制须另行考证。' },
    { name: '道士／道姑', genders: ['男', '女'], eras: all, outer: '衣袍与鞋履按仪式或日常分别设计', head: '束发或冠帽，需依宗派和时代核对', note: '住持是职务，袈裟并非住持专属；日常、法会、正式礼仪与劳作用途不合并。唐代少林及习武造型为创作参考，形制须另行考证。' },
    { name: '伶人／乐师', genders: ['男', '女'], eras: all, outer: '适合演出的层叠衣衫，布料和色彩依场合变化', head: '束发或适度装饰' },
  ]),
  ...roles('家宅与乡绅', [
    { name: '地主／乡绅', genders: ['男'], eras: all, outer: '宽松长衣或袄裙，织物讲究，饰物不过度繁复', head: '巾帽或整齐发髻' },
    { name: '富家小姐', genders: ['女'], eras: all, outer: '精致上衣与长裙，柔和配色和细密纹样', head: '整齐发髻与少量簪花', note: '以成年人物为默认参考。' },
    { name: '富家公子', genders: ['男'], eras: all, outer: '质地讲究的长袍，色彩雅致，配布带', head: '束发与简冠', note: '以成年人物为默认参考。' },
    { name: '丫鬟／侍女', genders: ['女'], eras: all, outer: '素色短衣与长裙或裤装，收束袖口，便于劳作', head: '简髻与布带', note: '以成年人物为默认参考。' },
    { name: '儿童', genders: ['男', '女'], eras: all, outer: '符合年龄、完整遮覆的日常衣裤或衣裙', head: '儿童束发或简朴发式', note: '儿童体型和服饰单独制作，年龄相关形制待核。' },
    { name: '老年人', genders: ['男', '女'], eras: all, outer: '便于穿着的日常衣裤或衣裙，按季节增减层次', head: '简巾或朴素发髻', note: '年龄和发色不应作为身份的固定规则。' },
    { name: '家仆／管家', genders: ['男', '女'], eras: all, outer: '朴素整洁的布衣裤或长衣，腰带实用', head: '布巾或简洁盘发' },
  ]),
  ...roles('江湖与幻想', [
    { name: '大侠／游侠', genders: ['男'], eras: all, outer: '便于行走的窄袖外衣、腰带与裤装，配轻便披肩', head: '束发或布巾', note: '武侠造型为创作设计，非特定时期制服。' },
    { name: '江湖人士', genders: ['男', '女'], eras: all, outer: '耐磨短衣、叠穿外衫、腰带与便鞋', head: '束发或布巾', note: '创作角色，服饰可随地域及场景变化。' },
    { name: '护送商旅者', genders: ['男'], eras: all, outer: '耐磨衣裤与行旅外层，适合走动', head: '束发或布巾', note: '创作角色，不等同于各朝代都有镖局制度。' },
    { name: '镖师', genders: ['男'], eras: all, outer: '耐磨窄袖衣裤、腰带与行旅外套', head: '布巾或束发', note: '镖局制度及称谓不能泛化到所有朝代；此处为影视创作。' },
    { name: '小偷', genders: ['男', '女'], eras: all, outer: '朴素短衣裤与腰带，方便行动，不依赖单一黑衣形象', head: '布巾或简束发', note: '服装为叙事性设计，并非历史上的统一制服。' },
    { name: '夜行者', genders: ['男', '女'], eras: all, outer: '深色耐磨短衣裤、简洁腰带与软底鞋', head: '简洁束发或布巾', note: '夜袭人物按虚构造型处理，非历史制服。' },
  ]),
];

export const seasonLayers: Record<string, { inner: string; outer: string }> = {
  春: { inner: '轻薄中衣与宽松衬裤或内裙，袖口与领口整洁', outer: '中等厚度外衣，可加轻薄外衫' },
  夏: { inner: '透气的薄布中衣与宽松衬裤或内裙', outer: '轻薄透气面料，减少保暖层，保持服饰结构' },
  秋: { inner: '中等厚度中衣与衬裤或内裙', outer: '加一层外衫或夹衣，色彩可采用沉稳秋色' },
  冬: { inner: '柔软保暖中衣与衬裤或内裙', outer: '夹衣或絮棉外衣，必要时加披风，保持活动空间' },
};
